export type RegionId = 'mombasa' | 'north' | 'south';

export type AdvisoryTone = 'good' | 'mixed' | 'poor' | 'danger';

export interface LandingSite {
  id: string;
  name: string;
  county: string;
  region: RegionId;
  lat: number;
  lon: number;
  watch?: 'dolphins';
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

export interface SeaStoryBrief {
  app: {
    name: 'Bahari Leo';
    editionDate: string;
    greeting: string;
    regionLabel: string;
  };
  place: {
    id: string;
    name: string;
    county: string;
    watch?: 'dolphins';
  };
  story: Pick<SeaStory, 'mood' | 'headline' | 'swahili' | 'blurb' | 'waves' | 'wind' | 'water'>;
  activities: ActivityHint[];
  wildlife: {
    whaleSeason: boolean;
    dolphinSites: string[];
    note: string;
  };
  approvedSwahili: string[];
  generatedAt: string;
}

export interface ComicPanel {
  caption: string;
  imagePrompt: string;
  /** Base64 data URL — cached in Firestore, no Cloud Storage. */
  imageUrl?: string;
}

export interface ComicEdition {
  editionTitle: string;
  panels: ComicPanel[];
  footer: string;
}
