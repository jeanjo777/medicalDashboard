// PostgREST client — drop-in replacement for @supabase/supabase-js
// Exports the same `supabase` object so no import changes needed across the app.

// Use current origin so the app works on any domain (medical.simpliceake.com, dashboard.simpliceake.com, etc.)
export const getApiBase = (): string => {
  try { return window.location.origin; } catch { return import.meta.env.VITE_SUPABASE_URL as string || ''; }
};
const BASE_URL = getApiBase();
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

const REST_URL = `${BASE_URL}/rest/v1`;

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
  };
  try {
    const token = localStorage.getItem('auth_token');
    if (token) h.Authorization = `Bearer ${token}`;
  } catch { /* SSR guard */ }
  return h;
}

// ── Query builder (mirrors Supabase PostgREST client) ────────────────

type Method = 'GET' | 'HEAD' | 'POST' | 'PATCH' | 'DELETE';

interface Filter {
  type: string;
  column?: string;
  value?: unknown;
  raw?: string;
}

interface QueryResult<T = unknown> {
  data: T | null;
  error: { message: string; code?: string } | null;
  count: number | null;
}

class PostgrestBuilder<T = unknown> {
  private _table: string;
  private _method: Method = 'GET';
  private _body: unknown = null;
  private _select = '*';
  private _filters: Filter[] = [];
  private _orders: string[] = [];
  private _limitVal: number | null = null;
  private _rangeFrom: number | null = null;
  private _rangeTo: number | null = null;
  private _single = false;
  private _maybeSingle = false;
  private _head = false;
  private _wantCount = false;
  private _returnBody = false;

  constructor(table: string) {
    this._table = table;
  }

  // ── Query types ──────────────────────────────────────────────────

  select(columns = '*', opts?: { count?: string; head?: boolean }) {
    this._select = columns.replace(/\s+/g, '');
    if (opts?.count === 'exact') this._wantCount = true;
    if (opts?.head) {
      this._head = true;
      this._method = 'HEAD';
    }
    // Chained after insert/update → want returned rows
    if (this._method === 'POST' || this._method === 'PATCH') {
      this._returnBody = true;
    }
    return this;
  }

  insert(data: unknown) {
    this._method = 'POST';
    this._body = data;
    this._returnBody = true;
    return this;
  }

  update(data: unknown) {
    this._method = 'PATCH';
    this._body = data;
    this._returnBody = true;
    return this;
  }

  delete() {
    this._method = 'DELETE';
    return this;
  }

  // ── Filters ──────────────────────────────────────────────────────

  eq(col: string, val: unknown) { this._filters.push({ type: 'eq', column: col, value: val }); return this; }
  neq(col: string, val: unknown) { this._filters.push({ type: 'neq', column: col, value: val }); return this; }
  gt(col: string, val: unknown) { this._filters.push({ type: 'gt', column: col, value: val }); return this; }
  gte(col: string, val: unknown) { this._filters.push({ type: 'gte', column: col, value: val }); return this; }
  lt(col: string, val: unknown) { this._filters.push({ type: 'lt', column: col, value: val }); return this; }
  lte(col: string, val: unknown) { this._filters.push({ type: 'lte', column: col, value: val }); return this; }

  in(col: string, values: unknown[]) {
    const formatted = values.map(v => typeof v === 'string' ? `"${v}"` : v).join(',');
    this._filters.push({ type: 'raw', column: col, raw: `in.(${formatted})` });
    return this;
  }

  is(col: string, val: unknown) {
    this._filters.push({ type: 'raw', column: col, raw: `is.${val}` });
    return this;
  }

  not(col: string, op: string, val: unknown) {
    this._filters.push({ type: 'raw', column: col, raw: `not.${op}.${val}` });
    return this;
  }

  or(conditions: string) {
    this._filters.push({ type: 'or', raw: conditions });
    return this;
  }

  ilike(col: string, pattern: string) {
    this._filters.push({ type: 'ilike', column: col, value: pattern });
    return this;
  }

  // ── Modifiers ────────────────────────────────────────────────────

  order(col: string, opts?: { ascending?: boolean }) {
    this._orders.push(`${col}.${opts?.ascending === false ? 'desc' : 'asc'}`);
    return this;
  }

  limit(n: number) { this._limitVal = n; return this; }

  range(from: number, to: number) {
    this._rangeFrom = from;
    this._rangeTo = to;
    return this;
  }

  single() { this._single = true; return this; }
  maybeSingle() { this._maybeSingle = true; return this; }

  // ── URL builder ──────────────────────────────────────────────────

  private buildUrl(): string {
    const parts: string[] = [];

    // Select columns for GET/HEAD, or for POST/PATCH with return
    if (this._method === 'GET' || this._method === 'HEAD' || this._returnBody) {
      parts.push(`select=${this._select}`);
    }

    // Filters
    for (const f of this._filters) {
      if (f.type === 'or') {
        parts.push(`or=(${f.raw})`);
      } else if (f.type === 'raw') {
        parts.push(`${f.column}=${f.raw}`);
      } else {
        parts.push(`${f.column}=${f.type}.${f.value}`);
      }
    }

    // Order
    if (this._orders.length) {
      parts.push(`order=${this._orders.join(',')}`);
    }

    // Range → limit + offset
    if (this._rangeFrom !== null && this._rangeTo !== null) {
      parts.push(`limit=${this._rangeTo - this._rangeFrom + 1}`);
      parts.push(`offset=${this._rangeFrom}`);
    } else if (this._limitVal !== null) {
      parts.push(`limit=${this._limitVal}`);
    }

    const qs = parts.length ? '?' + parts.join('&') : '';
    return `${REST_URL}/${this._table}${qs}`;
  }

  // ── Headers builder ──────────────────────────────────────────────

  private buildHeaders(): Record<string, string> {
    const headers = getHeaders();
    const prefer: string[] = [];

    if (this._wantCount) prefer.push('count=exact');
    if (this._method === 'POST' || this._method === 'PATCH') prefer.push('return=representation');
    if (this._method === 'DELETE') prefer.push('return=minimal');

    if (prefer.length) headers['Prefer'] = prefer.join(', ');

    if (this._single || this._maybeSingle) {
      headers['Accept'] = 'application/vnd.pgrst.object+json';
    }

    return headers;
  }

  // ── Execute ──────────────────────────────────────────────────────

  private async execute(): Promise<QueryResult<T>> {
    try {
      const url = this.buildUrl();
      const headers = this.buildHeaders();
      const init: RequestInit = { method: this._head ? 'HEAD' : this._method, headers };

      if (this._body && (this._method === 'POST' || this._method === 'PATCH')) {
        init.body = JSON.stringify(this._body);
      }

      const res = await fetch(url, init);

      // Parse count from Content-Range header
      let count: number | null = null;
      const cr = res.headers.get('content-range');
      if (cr) {
        const m = cr.match(/\/(\d+)/);
        if (m) count = parseInt(m[1], 10);
      }

      // HEAD requests return count only
      if (this._head) {
        return { data: null as T, error: null, count };
      }

      // Error handling
      if (!res.ok) {
        // maybeSingle returns null on 406 (no rows)
        if (this._maybeSingle && res.status === 406) {
          return { data: null, error: null, count };
        }
        const body = await res.json().catch(() => ({ message: res.statusText }));
        // Clear stale auth token on JWT signature errors and retry with ANON_KEY
        if (body.code === 'PGRST301' || body.message?.includes('JWSInvalidSignature')) {
          try { localStorage.removeItem('auth_token'); } catch { /* SSR guard */ }
          const retryRes = await fetch(url, { ...init, headers: { ...headers, Authorization: `Bearer ${ANON_KEY}` } });
          if (retryRes.ok) {
            const retryText = await retryRes.text();
            const retryCr = retryRes.headers.get('content-range');
            let retryCount: number | null = null;
            if (retryCr) { const rm = retryCr.match(/\/(\d+)/); if (rm) retryCount = parseInt(rm[1], 10); }
            return { data: retryText ? JSON.parse(retryText) : (this._single || this._maybeSingle ? null : []) as T, error: null, count: retryCount };
          }
        }
        return { data: null, error: { message: body.message || res.statusText, code: body.code }, count: null };
      }

      // Parse body
      const text = await res.text();
      if (!text) {
        return { data: (this._single || this._maybeSingle ? null : []) as T, error: null, count };
      }

      return { data: JSON.parse(text), error: null, count };
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' }, count: null };
    }
  }

  // Thenable — allows `await supabase.from(...).select(...)`
  then<R1 = QueryResult<T>, R2 = never>(
    resolve?: ((v: QueryResult<T>) => R1 | PromiseLike<R1>) | null,
    reject?: ((e: unknown) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return this.execute().then(resolve, reject);
  }
}

// ── RPC builder ──────────────────────────────────────────────────────

class RpcBuilder<T = unknown> {
  private _fn: string;
  private _params: Record<string, unknown>;

  constructor(fn: string, params: Record<string, unknown> = {}) {
    this._fn = fn;
    this._params = params;
  }

  private async execute(): Promise<QueryResult<T>> {
    try {
      const res = await fetch(`${REST_URL}/rpc/${this._fn}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(this._params),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        return { data: null, error: { message: body.message || res.statusText }, count: null };
      }
      const text = await res.text();
      return { data: text ? JSON.parse(text) : null, error: null, count: null };
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : 'Network error' }, count: null };
    }
  }

  then<R1 = QueryResult<T>, R2 = never>(
    resolve?: ((v: QueryResult<T>) => R1 | PromiseLike<R1>) | null,
    reject?: ((e: unknown) => R2 | PromiseLike<R2>) | null,
  ): Promise<R1 | R2> {
    return this.execute().then(resolve, reject);
  }
}

// ── Channel stub (polling replacement for Supabase Realtime) ─────────

interface ChannelStub {
  on(event: string, config: unknown, callback?: unknown): ChannelStub;
  subscribe(callback?: (status: string) => void): ChannelStub;
  unsubscribe(): void;
}

function createChannel(): ChannelStub {
  const stub: ChannelStub = {
    on(_event: string, _config: unknown, _callback?: unknown) { return stub; },
    subscribe(callback?: (status: string) => void) {
      // Fire SUBSCRIBED callback for hooks that check status
      if (callback) setTimeout(() => callback('SUBSCRIBED'), 0);
      return stub;
    },
    unsubscribe() { /* no-op */ },
  };
  return stub;
}

// ── Auth stub ────────────────────────────────────────────────────────

const authStub = {
  async getUser() {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return { data: { user: { id: payload.sub || payload.user_id || 'system' } }, error: null };
      }
    } catch { /* ignore */ }
    return { data: { user: null }, error: null };
  },
};

// ── Main client ──────────────────────────────────────────────────────

export const supabase = {
  from<T = unknown>(table: string) {
    return new PostgrestBuilder<T>(table);
  },

  rpc<T = unknown>(fn: string, params?: Record<string, unknown>) {
    return new RpcBuilder<T>(fn, params);
  },

  channel(_name: string): ChannelStub {
    return createChannel();
  },

  removeChannel(ch: ChannelStub) {
    ch.unsubscribe();
  },

  auth: authStub,
};

// ── Re-exported interfaces ───────────────────────────────────────────

export interface AppointmentRequest {
  id?: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  type_de_soin: string;
  message: string;
  date_demande: string;
  source: string;
  created_at?: string;
}
