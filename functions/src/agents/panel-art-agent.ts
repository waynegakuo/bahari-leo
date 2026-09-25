import { googleAI } from '@genkit-ai/google-genai';
import type { GenerateResponse } from 'genkit';
import { runImageJob } from '../gemini-image-queue';
import { isRateLimitError } from '../gemini-retry';
import { PANEL_ART_MODEL } from './models';
import { PANEL_ART_AGENT_INSTRUCTION } from './prompts/panel-art-agent';
import { getRuntime } from './runtime';
import { SeaMood } from '../sea/types';

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

/** Image agent — gemini-3.1-flash-image (Nano Banana 2), one comic panel as a base64 data URL. */
export async function generatePanelArt(scenePrompt: string, mood: SeaMood): Promise<string | undefined> {
  try {
    return await runImageJob('panel-art agent', async () => {
      const ai = await getRuntime();
      const response = await ai.generate({
        model: googleAI.model(PANEL_ART_MODEL),
        system: PANEL_ART_AGENT_INSTRUCTION,
        prompt: `Mood: ${mood}. Scene: ${scenePrompt}`,
        config: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '4:3',
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
    console.warn('panel-art agent failed', err);
    return undefined;
  }
}
