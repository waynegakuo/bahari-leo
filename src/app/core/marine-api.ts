import { Injectable } from '@angular/core';
import { GeoPoint, LandingSite, MarineSnapshot } from './models';

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

interface OpenMeteoHourlyBlock {
  wave_height?: Array<number | null>;
}

interface OpenMeteoResponse {
  current?: OpenMeteoCurrentBlock;
  hourly?: OpenMeteoHourlyBlock;
}

const NAIROBI = 'Africa/Nairobi';

@Injectable({ providedIn: 'root' })
export class MarineApi {
  fetchPoint(lat: number, lon: number, abortSignal?: AbortSignal): Promise<MarineSnapshot> {
    return this.fetchLocations([{ lat, lon }], abortSignal).then((rows) => {
      const snapshot = rows[0];
      if (!snapshot) {
        throw new Error('No marine snapshot returned');
      }
      return snapshot;
    });
  }

  fetchSites(sites: LandingSite[], abortSignal?: AbortSignal): Promise<MarineSnapshot[]> {
    return this.fetchLocations(sites, abortSignal);
  }

  private async fetchLocations(points: GeoPoint[], abortSignal?: AbortSignal): Promise<MarineSnapshot[]> {
    if (points.length === 0) {
      return [];
    }
    const lats = points.map((point) => point.lat).join(',');
    const lons = points.map((point) => point.lon).join(',');
    const [marineRaw, weatherRaw] = await Promise.all([
      this.getJson<OpenMeteoResponse | OpenMeteoResponse[]>(this.marineUrl(lats, lons), abortSignal),
      this.getJson<OpenMeteoResponse | OpenMeteoResponse[]>(this.weatherUrl(lats, lons), abortSignal),
    ]);
    const marineList = asList(marineRaw);
    const weatherList = asList(weatherRaw);
    return points.map((point, index) =>
      this.toSnapshot(point.lat, point.lon, marineList[index] ?? marineList[0], weatherList[index] ?? weatherList[0]),
    );
  }

  private marineUrl(lat: string, lon: string): string {
    return this.url('https://marine-api.open-meteo.com/v1/marine', lat, lon, {
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

  private weatherUrl(lat: string, lon: string): string {
    return this.url('https://api.open-meteo.com/v1/forecast', lat, lon, {
      current: 'temperature_2m,wind_speed_10m,wind_direction_10m',
      forecast_days: '1',
      wind_speed_unit: 'kmh',
    });
  }

  private url(base: string, lat: string, lon: string, extra: Record<string, string>): string {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      timezone: NAIROBI,
      ...extra,
    });
    return `${base}?${params.toString()}`;
  }

  private async getJson<T>(url: string, abortSignal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal: abortSignal });
    if (!response.ok) {
      throw new Error(`Marine request failed (${response.status})`);
    }
    return (await response.json()) as T;
  }

  private toSnapshot(
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
}

function asList<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

function num(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
