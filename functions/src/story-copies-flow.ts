import { generateBatchSeaStoryCopy } from './agents/sea-copy-agent';
import {
  readCachedStoryCopies,
  writeCachedStoryCopies,
} from './story-copy-cache';
import { buildBriefForPlace } from './sea/brief';
import { SeaStoryCopy } from './sea/types';

/** Smaller batches with pauses — smooths spend-rate spikes on first load. */
const COPY_BATCH_SIZE = 6;
const COPY_BATCH_GAP_MS = 3_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateStoryCopiesForPlaces(placeIds: string[]): Promise<Record<string, SeaStoryCopy>> {
  const uniqueIds = [...new Set(placeIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return {};
  }

  const cached = await readCachedStoryCopies(uniqueIds);
  const missing = uniqueIds.filter((placeId) => !cached[placeId]);
  if (missing.length === 0) {
    return cached;
  }

  const fresh: Record<string, SeaStoryCopy> = {};

  for (let offset = 0; offset < missing.length; offset += COPY_BATCH_SIZE) {
    const chunk = missing.slice(offset, offset + COPY_BATCH_SIZE);
    const briefs = await Promise.all(chunk.map((placeId) => buildBriefForPlace(placeId)));
    const copies = await generateBatchSeaStoryCopy(briefs);
    chunk.forEach((placeId, index) => {
      fresh[placeId] = copies[index]!;
    });

    if (offset + COPY_BATCH_SIZE < missing.length) {
      await sleep(COPY_BATCH_GAP_MS);
    }
  }

  await writeCachedStoryCopies(fresh);
  return { ...cached, ...fresh };
}
