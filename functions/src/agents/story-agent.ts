import { googleAI } from '@genkit-ai/google-genai';
import { withGeminiRetry } from '../gemini-retry';
import { STORY_MODEL } from './models';
import { STORY_AGENT_INSTRUCTION } from './prompts/story-agent';
import { getRuntime } from './runtime';
import { ComicEditionSchema, StoryEditionDraft } from './schemas';
import { SeaStoryBrief } from '../sea/types';

const STOCK_SWAHILI = [
  'bahari ni shwari',
  'bahari inachachamaa',
  'kaa pwani leo',
  'mawimbi ni laini',
  'upepo mzuri leo',
] as const;

/** Panel 4 must not recycle app-wide mood taglines. */
export function recyclesStockSwahili(draft: StoryEditionDraft, brief: SeaStoryBrief): boolean {
  const panel4 = draft.panels[3]?.caption?.trim().toLowerCase() ?? '';
  if (!panel4) {
    return true;
  }

  const banned = [brief.story.swahili.trim().toLowerCase(), ...STOCK_SWAHILI].filter(Boolean);

  return banned.some((phrase) => panel4 === phrase || panel4.startsWith(`${phrase}.`) || panel4.startsWith(`${phrase}!`));
}

/** Text agent — gemini-3.5-flash, structured comic script from a sea brief. */
export async function generateStoryEdition(brief: SeaStoryBrief): Promise<StoryEditionDraft> {
  const ai = await getRuntime();

  for (let attempt = 0; attempt < 2; attempt++) {
    const { output } = await withGeminiRetry(
      () =>
        ai.generate({
          model: googleAI.model(STORY_MODEL),
          system: STORY_AGENT_INSTRUCTION,
          prompt: JSON.stringify(brief),
          output: { schema: ComicEditionSchema },
          config: { temperature: attempt === 0 ? 0.72 : 0.85 },
        }),
      'story agent',
    );

    if (!output) {
      throw new Error('Story agent returned an empty edition');
    }

    if (!recyclesStockSwahili(output, brief) || attempt === 1) {
      if (recyclesStockSwahili(output, brief)) {
        console.warn('story agent still recycled stock Swahili in panel 4 after retry', {
          placeId: brief.place.id,
        });
      }
      return output;
    }

    console.warn('story agent recycled stock Swahili in panel 4; retrying', {
      placeId: brief.place.id,
      attempt,
    });
  }

  throw new Error('Story agent returned an empty edition');
}
