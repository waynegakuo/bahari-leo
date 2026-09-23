import { greetingForNow, whaleSeasonNow } from './plain-speak';
import { CoastRegion, SeaStory, SiteBoardRow } from './models';

/** Input for the Genkit Cloud Function — derived from live data, never invented by the model. */
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
  activities: SeaStory['activities'];
  wildlife: {
    whaleSeason: boolean;
    dolphinSites: string[];
    note: string;
  };
  approvedSwahili: string[];
  generatedAt: string;
}

/** Expected JSON shape from Gemini (optional comic layer). */
export interface ComicEdition {
  editionTitle: string;
  panels: Array<{ caption: string; imagePrompt?: string; imageUrl?: string }>; // imageUrl = base64 data URL
  footer: string;
}

const APPROVED_SWAHILI = [
  'Bahari ni shwari',
  'Bahari inachachamaa',
  'Kaa pwani leo',
] as const;

const DOLPHIN_SITES = ['Shimoni', 'Watamu'];

export function buildSeaStoryBrief(row: SiteBoardRow, region: CoastRegion): SeaStoryBrief | null {
  if (!row.story) {
    return null;
  }
  const now = new Date();
  return {
    app: {
      name: 'Bahari Leo',
      editionDate: now.toISOString().slice(0, 10),
      greeting: greetingForNow(),
      regionLabel: region.label,
    },
    place: {
      id: row.site.id,
      name: row.site.name,
      county: row.site.county,
      watch: row.site.watch,
    },
    story: {
      mood: row.story.mood,
      headline: row.story.headline,
      swahili: row.story.swahili,
      blurb: row.story.blurb,
      waves: row.story.waves,
      wind: row.story.wind,
      water: row.story.water,
    },
    activities: row.story.activities,
    wildlife: {
      whaleSeason: whaleSeasonNow(),
      dolphinSites: DOLPHIN_SITES,
      note: 'Wildlife live in known areas year-round. Never imply live GPS or guaranteed sightings.',
    },
    approvedSwahili: [...APPROVED_SWAHILI],
    generatedAt: now.toISOString(),
  };
}
