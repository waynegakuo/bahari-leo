import { MarineSnapshot } from './types';

interface OpenMeteoCurrentBlock {
  sea_surface_temperature?: number;
  wave_height?: number;
  wave_direction?: number;
  wave_period?: number;
  ocean_current_velocity?: number;
  ocean_current_direction?: number;
  temperature_2m?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  time?: string;
}

interface OpenMeteoResponse {
  current?: OpenMeteoCurrentBlock;
  hourly?: { wave_height?: Array<number | null> };
}

const NAIROBI = 'Africa/Nairobi';

export async function fetchMarineSnapshot(lat: number, lon: number): Promise<MarineSnapshot> {
  const latStr = String(lat);
  const lonStr = String(lon);
  const [marine, weather] = await Promise.all([
    getJson<OpenMeteoResponse>(marineUrl(latStr, lonStr)),
    getJson<OpenMeteoResponse>(weatherUrl(latStr, lonStr)),
  ]);
  return toSnapshot(lat, lon, marine, weather);
}

function marineUrl(lat: string, lon: string): string {
  return url('https://marine-api.open-meteo.com/v1/marine', lat, lon, {
    current: [
      'sea_surface_temperature',
      'wave_height',
      'wave_direction',
      'wave_period',
      'ocean_current_velocity',
      'ocean_current_direction',
    ].join(','),
    hourly: 'wave_height',
    forecast_days: '2',
    cell_selection: 'sea',
  });
}

function weatherUrl(lat: string, lon: string): string {
  return url('https://api.open-meteo.com/v1/forecast', lat, lon, {
    current: 'temperature_2m,wind_speed_10m,wind_direction_10m',
    forecast_days: '1',
    wind_speed_unit: 'kmh',
  });
}

function url(base: string, lat: string, lon: string, extra: Record<string, string>): string {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: NAIROBI,
    ...extra,
  });
  return `${base}?${params.toString()}`;
}

async function getJson<T>(href: string): Promise<T> {
  const response = await fetch(href);
  if (!response.ok) {
    throw new Error(`Marine request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

function toSnapshot(
  lat: number,
  lon: number,
  marine: OpenMeteoResponse,
  weather: OpenMeteoResponse,
): MarineSnapshot {
  const current = marine.current ?? {};
  const air = weather.current ?? {};
  const waves = marine.hourly?.wave_height?.slice(0, 6) ?? [];
  const numericWaves = waves.filter((value): value is number => value !== null && value !== undefined);
  return {
    lat,
    lon,
    sstC: num(current.sea_surface_temperature),
    waveHeightM: num(current.wave_height),
    waveDirectionDeg: num(current.wave_direction),
    wavePeriodS: num(current.wave_period),
    currentMs: num(current.ocean_current_velocity),
    currentDirectionDeg: num(current.ocean_current_direction),
    windKmh: num(air.wind_speed_10m),
    windDirectionDeg: num(air.wind_direction_10m),
    airC: num(air.temperature_2m),
    nextWaveMaxM: numericWaves.length ? Math.max(...numericWaves) : num(current.wave_height),
    fetchedAt: current.time ?? new Date().toISOString(),
    source: 'open-meteo',
  };
}

function num(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
