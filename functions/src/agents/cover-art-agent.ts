import { googleAI } from '@genkit-ai/google-genai';
import type { GenerateResponse } from 'genkit';
import { runImageJob } from '../gemini-image-queue';
import { isRateLimitError } from '../gemini-retry';
import { PANEL_ART_MODEL } from './models';
import { COVER_ART_AGENT_INSTRUCTION } from './prompts/cover-art-agent';
import { getRuntime } from './runtime';
import { SeaMood } from '../sea/types';

/** Landscape cover frames — must stay in sync with CSS and cover-cache validation. */
export const COVER_ART_ASPECT_RATIO = '16:9' as const;

export interface CoverArtInput {
  placeName: string;
  county: string;
  mood: SeaMood;
  headline: string;
  blurb: string;
}

function extractMediaDataUrl(response: GenerateResponse): string | undefined {
  const top = response.media?.url;
  if (typeof top === 'string' && top.startsWith('data:')) {
    return top;
  }
  const image = (response as GenerateResponse & { image?: { url?: string } }).image?.url;
  if (typeof image === 'string' && image.startsWith('data:')) {
    return image;
  }
  const parts = response.message?.content;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      const url = part.media?.url;
      if (typeof url === 'string' && url.startsWith('data:')) {
        return url;
      }
    }
  }
  return undefined;
}

function buildCoverPrompt(input: CoverArtInput): string {
  return [
    `Place: ${input.placeName}, ${input.county}, Kenya coast.`,
    `Mood: ${input.mood}.`,
    `Headline: ${input.headline}.`,
    `Scene to illustrate: ${input.blurb}`,
    `Frame: landscape ${COVER_ART_ASPECT_RATIO} — horizontal composition only.`,
  ].join('\n');
}

/** Cover-art agent — one editorial illustration as a base64 data URL. */
export async function generateCoverArt(input: CoverArtInput): Promise<string | undefined> {
  try {
    return await runImageJob('cover-art agent', async () => {
      const ai = await getRuntime();
      const response = await ai.generate({
        model: googleAI.model(PANEL_ART_MODEL),
        system: COVER_ART_AGENT_INSTRUCTION,
        prompt: buildCoverPrompt(input),
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: COVER_ART_ASPECT_RATIO,
            imageSize: '1K',
          },
        },
      });
      return extractMediaDataUrl(response);
    });
  } catch (err) {
    if (isRateLimitError(err)) {
      throw err;
    }
    console.warn('cover-art agent failed', err);
    return undefined;
  }
}
