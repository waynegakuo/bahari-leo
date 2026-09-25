import { scoreConditions } from './advisory';
import { fetchMarineSnapshot } from './marine';
import { nairobiDate, nairobiNowIso } from './nairobi';
import { greetingForNow, tellSeaStory, whaleSeasonNow } from './plain-speak';
import { REGION_LABEL, siteById } from './sites';
import { SeaStoryBrief } from './types';

/** Examples only — the sea-copy agent should prefer fresh phrases. */
const APPROVED_SWAHILI = [
  'Bahari ni shwari',
  'Bahari inachachamaa',
  'Kaa pwani leo',
  'Mawimbi ni laini',
  'Upepo mzuri leo',
] as const;
const DOLPHIN_SITES = ['Shimoni', 'Watamu'];

export async function buildBriefForPlace(placeId: string): Promise<SeaStoryBrief> {
  const site = siteById(placeId);
  if (!site) {
    throw new Error(`Unknown place: ${placeId}`);
  }
  const marine = await fetchMarineSnapshot(site.lat, site.lon);
  const advisory = scoreConditions(marine);
  const story = tellSeaStory(marine, advisory);
  const now = new Date();
  return {
    app: {
      name: 'Bahari Leo',
      editionDate: nairobiDate(now),
      greeting: greetingForNow(now),
      regionLabel: REGION_LABEL[site.region],
    },
    place: {
      id: site.id,
      name: site.name,
      county: site.county,
      watch: site.watch,
    },
    story: {
      mood: story.mood,
      headline: story.headline,
      swahili: story.swahili,
      blurb: story.blurb,
      waves: story.waves,
      wind: story.wind,
      water: story.water,
    },
    measurements: {
      waveHeightM: marine.waveHeightM,
      windKmh: marine.windKmh,
      sstC: marine.sstC,
    },
    activities: story.activities,
    wildlife: {
      whaleSeason: whaleSeasonNow(now),
      dolphinSites: [...DOLPHIN_SITES],
      note: 'Wildlife live in known areas year-round. Describe their home on the coast.',
    },
    approvedSwahili: [...APPROVED_SWAHILI],
    generatedAt: nairobiNowIso(now),
  };
}
