import { generateCoverArt } from './agents/cover-art-agent';
import { readCachedCoverArt, writeCachedCoverArt } from './cover-cache';
import { SeaMood } from './sea/types';

export interface CoverArtRequest {
  placeId: string;
  placeName: string;
  county: string;
  mood: SeaMood;
  headline: string;
  blurb: string;
}

export interface CoverArtResponse {
  imageUrl?: string;
  status: 'ready' | 'failed';
}

export async function generateCoverArtForPlace(input: CoverArtRequest): Promise<CoverArtResponse> {
  const cached = await readCachedCoverArt(input.placeId);
  if (cached) {
    return { imageUrl: cached, status: 'ready' };
  }

  const imageUrl = await generateCoverArt({
    placeName: input.placeName,
    county: input.county,
    mood: input.mood,
    headline: input.headline,
    blurb: input.blurb,
  });

  if (!imageUrl) {
    return { status: 'failed' };
  }

  await writeCachedCoverArt(input.placeId, imageUrl);
  return { imageUrl, status: 'ready' };
}
