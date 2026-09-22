export type RegionId = 'mombasa' | 'north' | 'south' | 'coast';

export type BaseMapId = 'chart' | 'satellite';

export type AdvisoryTone = 'good' | 'mixed' | 'poor' | 'danger';

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface CoastRegion {
  id: RegionId;
  label: string;
  swahili: string;
  summary: string;
  center: GeoPoint;
  zoom: number;
  bounds: [[number, number], [number, number]];
}

export interface LandingSite extends GeoPoint {
  id: string;
  name: string;
  county: string;
  region: Exclude<RegionId, 'coast'>;
  note: string;
  watch?: 'dolphins';
}

export interface MarinePark {
  id: string;
  name: string;
  kind: 'park' | 'reserve';
  polygon: [number, number][];
}

export interface LayerState {
  baseMap: BaseMapId;
  chlorophyll: boolean;
  sst: boolean;
  model: boolean;
  landings: boolean;
  parks: boolean;
}

export interface MarineSnapshot {
  lat: number;
  lon: number;
  sstC: number | null;
  waveHeightM: number | null;
  waveDirectionDeg: number | null;
  wavePeriodS: number | null;
  currentMs: number | null;
  currentDirectionDeg: number | null;
  windKmh: number | null;
  windDirectionDeg: number | null;
  airC: number | null;
  nextWaveMaxM: number | null;
  fetchedAt: string;
  source: 'open-meteo';
}

export interface Advisory {
  score: number;
  label: string;
  tone: AdvisoryTone;
  go: boolean;
  reasons: string[];
}

export type SeaMood = 'kind' | 'restless' | 'rough';

export interface ActivityHint {
  id: 'beach' | 'swim' | 'boat' | 'fish' | 'stay';
  label: string;
  ok: boolean;
}

export interface SeaStory {
  mood: SeaMood;
  headline: string;
  swahili: string;
  blurb: string;
  waves: string;
  wind: string;
  water: string;
  activities: ActivityHint[];
}

export interface SiteBoardRow {
  site: LandingSite;
  marine: MarineSnapshot | null;
  advisory: Advisory | null;
  story: SeaStory | null;
  error?: string;
}

export interface InspectTarget {
  lat: number;
  lon: number;
  label: string;
  siteId?: string;
}

export interface InspectReading {
  marine: MarineSnapshot;
  advisory: Advisory;
  story: SeaStory;
}

export type OverlayKey = Exclude<keyof LayerState, 'baseMap'>;

export const FORECAST_UNAVAILABLE = 'Could not hear the sea just now. Try again in a moment.';
