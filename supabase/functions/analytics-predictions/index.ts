import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PredictionPoint {
  month: string;
  actual: number | null;
  predicted: number;
  lower: number;
  upper: number;
}

interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number;
  description: string;
}

interface PredictionResponse {
  forecast: PredictionPoint[];
  confidence: number;
  insights: string[];
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
  }>;
  trends: TrendAnalysis;
  model: {
    type: string;
    parameters: { alpha: number; beta: number };
    accuracy: number;
    lastTrainedAt: string;
  };
}

const MONTHS_FR = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { horizonMonths = 3, metric = 'consultations' } = await req.json().catch(() => ({}));

    // Get historical data (last 24 months)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    let historicalData: number[];

    if (metric === 'consultations') {
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('id, created_at')
        .gte('created_at', twoYearsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      historicalData = aggregateByMonth(consultations || []);
    } else if (metric === 'appointments') {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id, appointment_date')
        .gte('appointment_date', twoYearsAgo.toISOString().split('T')[0])
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      historicalData = aggregateAppointmentsByMonth(appointments || []);
    } else if (metric === 'patients') {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, created_at')
        .gte('created_at', twoYearsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      historicalData = aggregateByMonth(patients || []);
    } else {
      historicalData = [];
    }

    // Apply Holt-Winters Exponential Smoothing
    const { forecast, fittedValues, parameters } = holtWintersSmoothing(historicalData, horizonMonths);

    // Calculate confidence
    const confidence = calculateModelConfidence(historicalData, fittedValues);

    // Generate forecast points with confidence intervals
    const forecastPoints = generateForecastPoints(historicalData, forecast, fittedValues, confidence);

    // Analyze trends
    const trends = analyzeTrends(historicalData);

    // Generate insights
    const insights = generateInsights(historicalData, forecast, trends);

    // Generate alerts
    const alerts = generateAlerts(historicalData, forecast, trends);

    const response: PredictionResponse = {
      forecast: forecastPoints,
      confidence: Math.round(confidence * 100),
      insights,
      alerts,
      trends,
      model: {
        type: 'Holt-Winters Double Exponential Smoothing',
        parameters,
        accuracy: confidence,
        lastTrainedAt: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function aggregateByMonth(data: any[]): number[] {
  const monthlyCount = new Map<string, number>();

  data.forEach(item => {
    const date = new Date(item.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyCount.set(key, (monthlyCount.get(key) || 0) + 1);
  });

  // Convert to sorted array, filling in missing months with 0
  const sortedKeys = Array.from(monthlyCount.keys()).sort();
  if (sortedKeys.length === 0) return [];

  const result: number[] = [];
  const startDate = new Date(sortedKeys[0] + '-01');
  const endDate = new Date();

  let current = new Date(startDate);
  while (current <= endDate) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    result.push(monthlyCount.get(key) || 0);
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

function aggregateAppointmentsByMonth(data: any[]): number[] {
  const monthlyCount = new Map<string, number>();

  data.forEach(item => {
    const date = new Date(item.appointment_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyCount.set(key, (monthlyCount.get(key) || 0) + 1);
  });

  const sortedKeys = Array.from(monthlyCount.keys()).sort();
  return sortedKeys.map(key => monthlyCount.get(key) || 0);
}

interface SmoothingResult {
  forecast: number[];
  fittedValues: number[];
  parameters: { alpha: number; beta: number };
}

function holtWintersSmoothing(data: number[], horizon: number): SmoothingResult {
  if (data.length < 3) {
    // Not enough data - return simple average
    const avg = data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0;
    return {
      forecast: Array(horizon).fill(Math.round(avg)),
      fittedValues: data.map(() => avg),
      parameters: { alpha: 0.3, beta: 0.1 },
    };
  }

  // Holt-Winters double exponential smoothing parameters
  const alpha = 0.3; // Level smoothing
  const beta = 0.1;  // Trend smoothing

  // Initialize
  let level = data[0];
  let trend = data.length > 1 ? data[1] - data[0] : 0;

  const fittedValues: number[] = [level];

  // Fit model to historical data
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;

    // Update level
    level = alpha * data[i] + (1 - alpha) * (level + trend);

    // Update trend
    trend = beta * (level - prevLevel) + (1 - beta) * trend;

    fittedValues.push(level);
  }

  // Generate forecasts
  const forecast: number[] = [];
  for (let h = 1; h <= horizon; h++) {
    const prediction = level + h * trend;
    forecast.push(Math.max(0, Math.round(prediction))); // Ensure non-negative
  }

  return { forecast, fittedValues, parameters: { alpha, beta } };
}

function calculateModelConfidence(actual: number[], fitted: number[]): number {
  if (actual.length < 3 || fitted.length < 3) return 0.5;

  // Calculate Mean Absolute Percentage Error (MAPE)
  let totalError = 0;
  let validCount = 0;

  for (let i = 0; i < Math.min(actual.length, fitted.length); i++) {
    if (actual[i] > 0) {
      totalError += Math.abs(actual[i] - fitted[i]) / actual[i];
      validCount++;
    }
  }

  if (validCount === 0) return 0.5;

  const mape = totalError / validCount;
  const confidence = Math.max(0.3, Math.min(0.95, 1 - mape));

  // Bonus for more data points
  const dataBonus = Math.min(0.1, actual.length / 240);

  return confidence + dataBonus;
}

function generateForecastPoints(
  historical: number[],
  forecast: number[],
  fitted: number[],
  confidence: number
): PredictionPoint[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const results: PredictionPoint[] = [];

  // Calculate standard error for confidence intervals
  const errors = historical.map((actual, i) => Math.abs(actual - (fitted[i] || actual)));
  const stdError = errors.length > 0
    ? Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length)
    : 0;

  // Add last 6 months of historical data
  const historyStart = Math.max(0, historical.length - 6);
  for (let i = historyStart; i < historical.length; i++) {
    const monthsBack = historical.length - 1 - i;
    const monthIndex = (currentMonth - monthsBack + 12) % 12;

    results.push({
      month: MONTHS_FR[monthIndex],
      actual: historical[i],
      predicted: Math.round(fitted[i] || historical[i]),
      lower: Math.round((fitted[i] || historical[i]) - 1.96 * stdError),
      upper: Math.round((fitted[i] || historical[i]) + 1.96 * stdError),
    });
  }

  // Add future predictions
  for (let h = 0; h < forecast.length; h++) {
    const monthIndex = (currentMonth + h + 1) % 12;
    const intervalWidth = stdError * (1 + 0.15 * (h + 1)); // Wider intervals for further predictions

    results.push({
      month: MONTHS_FR[monthIndex],
      actual: null,
      predicted: forecast[h],
      lower: Math.max(0, Math.round(forecast[h] - 1.96 * intervalWidth)),
      upper: Math.round(forecast[h] + 1.96 * intervalWidth),
    });
  }

  return results;
}

function analyzeTrends(data: number[]): TrendAnalysis {
  if (data.length < 3) {
    return {
      direction: 'stable',
      strength: 0,
      description: 'Donnees insuffisantes pour determiner une tendance',
    };
  }

  // Calculate recent vs older average
  const recentCount = Math.min(3, Math.floor(data.length / 2));
  const olderCount = Math.min(3, Math.floor(data.length / 2));

  const recentAvg = data.slice(-recentCount).reduce((a, b) => a + b, 0) / recentCount;
  const olderAvg = data.slice(-(recentCount + olderCount), -recentCount).reduce((a, b) => a + b, 0) / olderCount;

  if (olderAvg === 0) {
    return {
      direction: 'stable',
      strength: 0,
      description: 'Activite recente sans historique de comparaison',
    };
  }

  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
  const absChange = Math.abs(changePercent);

  let direction: 'increasing' | 'decreasing' | 'stable';
  let description: string;

  if (changePercent > 10) {
    direction = 'increasing';
    description = `Croissance de ${Math.round(changePercent)}% sur les ${recentCount} derniers mois`;
  } else if (changePercent < -10) {
    direction = 'decreasing';
    description = `Baisse de ${Math.round(Math.abs(changePercent))}% sur les ${recentCount} derniers mois`;
  } else {
    direction = 'stable';
    description = 'Activite stable sur la periode recente';
  }

  return {
    direction,
    strength: Math.min(100, Math.round(absChange)),
    description,
  };
}

function generateInsights(
  historical: number[],
  forecast: number[],
  trends: TrendAnalysis
): string[] {
  const insights: string[] = [];

  if (historical.length < 3) {
    insights.push('Accumulation de donnees en cours - les predictions s\'amelioreront avec le temps');
    return insights;
  }

  // Trend insight
  insights.push(trends.description);

  // Seasonal patterns (if enough data)
  if (historical.length >= 12) {
    const monthlyAvg = new Array(12).fill(0);
    const monthlyCount = new Array(12).fill(0);

    historical.forEach((val, i) => {
      const monthIndex = i % 12;
      monthlyAvg[monthIndex] += val;
      monthlyCount[monthIndex]++;
    });

    const avgByMonth = monthlyAvg.map((sum, i) => sum / (monthlyCount[i] || 1));
    const maxMonthIndex = avgByMonth.indexOf(Math.max(...avgByMonth));
    const minMonthIndex = avgByMonth.indexOf(Math.min(...avgByMonth));

    insights.push(`Pic d'activite historique en ${MONTHS_FR[maxMonthIndex]}`);

    if (avgByMonth[maxMonthIndex] > avgByMonth[minMonthIndex] * 1.5) {
      insights.push(`Creux d'activite en ${MONTHS_FR[minMonthIndex]}`);
    }
  }

  // Forecast insight
  if (forecast.length > 0 && historical.length > 0) {
    const lastActual = historical[historical.length - 1];
    const nextPredicted = forecast[0];
    const changePercent = ((nextPredicted - lastActual) / Math.max(lastActual, 1)) * 100;

    if (Math.abs(changePercent) > 5) {
      insights.push(
        `Prevision: ${changePercent > 0 ? '+' : ''}${Math.round(changePercent)}% pour le mois prochain`
      );
    }
  }

  return insights;
}

function generateAlerts(
  historical: number[],
  forecast: number[],
  trends: TrendAnalysis
): Array<{ type: 'warning' | 'info' | 'success'; message: string }> {
  const alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string }> = [];

  if (historical.length < 3) {
    return alerts;
  }

  // Capacity warning
  const maxHistorical = Math.max(...historical);
  const maxForecast = forecast.length > 0 ? Math.max(...forecast) : 0;

  if (maxForecast > maxHistorical * 1.2) {
    alerts.push({
      type: 'warning',
      message: `Capacite a surveiller: prevision de ${Math.round((maxForecast / maxHistorical - 1) * 100)}% au-dessus du pic historique`,
    });
  }

  // Trend alerts
  if (trends.direction === 'increasing' && trends.strength > 20) {
    alerts.push({
      type: 'info',
      message: 'Croissance soutenue detectee - envisager un renforcement des ressources',
    });
  } else if (trends.direction === 'decreasing' && trends.strength > 20) {
    alerts.push({
      type: 'warning',
      message: 'Baisse significative detectee - analyser les causes potentielles',
    });
  }

  // Success indicators
  if (trends.direction === 'stable' && historical.length >= 6) {
    const variance = calculateVariance(historical.slice(-6));
    const mean = historical.slice(-6).reduce((a, b) => a + b, 0) / 6;

    if (variance / mean < 0.1) {
      alerts.push({
        type: 'success',
        message: 'Activite stable et previsible sur les 6 derniers mois',
      });
    }
  }

  return alerts;
}

function calculateVariance(data: number[]): number {
  if (data.length === 0) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
}
