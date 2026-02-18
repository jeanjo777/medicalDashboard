export type ExportFormat = 'csv' | 'json' | 'txt' | 'clipboard';

export interface ExportOptions {
  filename: string;
  title?: string;
  metadata?: Record<string, any>;
}

export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportError';
  }
}

export function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    throw new ExportError('Aucune donnée à exporter');
  }

  const headers = Object.keys(data[0]);

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeCSV).join(',');
  const dataRows = data.map(row =>
    headers.map(header => escapeCSV(row[header])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

export function convertToJSON(data: any[], options?: ExportOptions): string {
  if (!data || data.length === 0) {
    throw new ExportError('Aucune donnée à exporter');
  }

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      exportedBy: 'MediCare Pro Analytics',
      recordCount: data.length,
      ...options?.metadata
    },
    data: data
  };

  return JSON.stringify(exportData, null, 2);
}

export function convertToTXT(data: any[], options?: ExportOptions): string {
  if (!data || data.length === 0) {
    throw new ExportError('Aucune donnée à exporter');
  }

  const title = options?.title || options?.filename || 'Export';
  const date = new Date().toLocaleString('fr-FR');
  const separator = '='.repeat(80);

  let content = `${title}\n`;
  content += `Date d'export: ${date}\n`;
  content += `Nombre d'entrées: ${data.length}\n`;
  content += `${separator}\n\n`;

  const headers = Object.keys(data[0]);
  const maxKeyLength = Math.max(...headers.map(h => h.length));

  data.forEach((row, index) => {
    content += `[${index + 1}/${data.length}]\n`;
    headers.forEach(header => {
      const key = header.padEnd(maxKeyLength + 2, ' ');
      const value = row[header] !== null && row[header] !== undefined ? row[header] : 'N/A';
      content += `  ${key}: ${value}\n`;
    });
    content += '\n';
  });

  content += `${separator}\n`;
  content += `Export terminé - ${data.length} entrées\n`;

  return content;
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function copyToClipboard(data: any[]): Promise<void> {
  if (!data || data.length === 0) {
    throw new ExportError('Aucune donnée à copier');
  }

  const text = convertToJSON(data);

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (err) {
    throw new ExportError('Erreur lors de la copie dans le presse-papier');
  }
}

export async function exportData(
  data: any[],
  format: ExportFormat,
  options: ExportOptions
): Promise<void> {
  if (!data || data.length === 0) {
    throw new ExportError('Aucune donnée à exporter');
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${options.filename}_${timestamp}`;

  switch (format) {
    case 'csv': {
      const csv = convertToCSV(data);
      downloadFile('\uFEFF' + csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
      break;
    }

    case 'json': {
      const json = convertToJSON(data, options);
      downloadFile(json, `${filename}.json`, 'application/json;charset=utf-8;');
      break;
    }

    case 'txt': {
      const txt = convertToTXT(data, options);
      downloadFile(txt, `${filename}.txt`, 'text/plain;charset=utf-8;');
      break;
    }

    case 'clipboard': {
      await copyToClipboard(data);
      break;
    }

    default:
      throw new ExportError(`Format d'export non supporté: ${format}`);
  }
}

export function prepareAnalyticsDataForExport(data: any, type: string) {
  const timestamp = new Date().toISOString();

  return {
    exportType: type,
    exportDate: timestamp,
    generatedBy: 'MediCare Pro Analytics Dashboard',
    ...data
  };
}

export function flattenData(data: any[]): any[] {
  return data.map(item => {
    const flattened: any = {};

    Object.keys(item).forEach(key => {
      const value = item[key];

      if (value === null || value === undefined) {
        flattened[key] = '';
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach(subKey => {
          flattened[`${key}_${subKey}`] = value[subKey];
        });
      } else if (Array.isArray(value)) {
        flattened[key] = value.join(', ');
      } else {
        flattened[key] = value;
      }
    });

    return flattened;
  });
}
