import { googleAI } from '@genkit-ai/google-genai';
import { STORY_MODEL } from './models';
import { STORY_AGENT_INSTRUCTION } from './prompts/story-agent';
import { getRuntime } from './runtime';
import { ComicEditionSchema, StoryEditionDraft } from './schemas';
import { SeaStoryBrief } from '../sea/types';

/** Text agent — gemini-3.5-flash, structured comic script from a sea brief. */
export async function generateStoryEdition(brief: SeaStoryBrief): Promise<StoryEditionDraft> {
  const ai = await getRuntime();
  const { output } = await ai.generate({
    model: googleAI.model(STORY_MODEL),
    system: STORY_AGENT_INSTRUCTION,
    prompt: JSON.stringify(brief),
    output: { schema: ComicEditionSchema },
    config: { temperature: 0.55 },
  });

  if (!output) {
    throw new Error('Story agent returned an empty edition');
  }

  return output;
}
