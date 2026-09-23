import { generateBatchSeaStoryCopy } from './agents/sea-copy-agent';
import { buildBriefForPlace } from './sea/brief';
import { SeaStoryCopy } from './sea/types';

export async function generateStoryCopiesForPlaces(placeIds: string[]): Promise<Record<string, SeaStoryCopy>> {
  const uniqueIds = [...new Set(placeIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return {};
  }

  const briefs = await Promise.all(uniqueIds.map((placeId) => buildBriefForPlace(placeId)));
  const copies = await generateBatchSeaStoryCopy(briefs);
  return Object.fromEntries(briefs.map((brief, index) => [brief.place.id, copies[index]!]));
}
