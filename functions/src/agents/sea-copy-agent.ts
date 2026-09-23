import { googleAI } from '@genkit-ai/google-genai';
import { STORY_MODEL } from './models';
import { SEA_COPY_AGENT_INSTRUCTION } from './prompts/sea-copy-agent';
import { getRuntime } from './runtime';
import { BatchSeaStoryCopySchema, SeaStoryCopy } from './schemas';
import { SeaStoryBrief } from '../sea/types';

export async function generateSeaStoryCopy(brief: SeaStoryBrief): Promise<SeaStoryCopy> {
  const copies = await generateBatchSeaStoryCopy([brief]);
  return copies[0]!;
}

export async function generateBatchSeaStoryCopy(briefs: SeaStoryBrief[]): Promise<SeaStoryCopy[]> {
  if (briefs.length === 0) {
    return [];
  }

  const ai = await getRuntime();
  const { output } = await ai.generate({
    model: googleAI.model(STORY_MODEL),
    system: SEA_COPY_AGENT_INSTRUCTION,
    prompt: JSON.stringify({
      editionDate: briefs[0]?.app.editionDate,
      places: briefs.map((brief) => ({
        placeId: brief.place.id,
        place: brief.place,
        mood: brief.story.mood,
        measurements: brief.measurements,
        template: brief.story,
        activities: brief.activities,
        approvedSwahili: brief.approvedSwahili,
      })),
    }),
    output: { schema: BatchSeaStoryCopySchema },
    config: { temperature: 0.88 },
  });

  if (!output) {
    throw new Error('Sea-copy agent returned empty output');
  }

  const byId = new Map(output.stories.map((story) => [story.placeId, story]));
  return briefs.map((brief) => {
    const story = byId.get(brief.place.id);
    if (!story) {
      throw new Error(`Sea-copy agent missing story for ${brief.place.id}`);
    }
    return normalizeCopy(story, brief);
  });
}

function normalizeCopy(
  copy: Omit<SeaStoryCopy, 'mood'> & { placeId: string },
  brief: SeaStoryBrief,
): SeaStoryCopy {
  return {
    mood: brief.story.mood,
    headline: copy.headline.trim(),
    swahili: copy.swahili.trim(),
    blurb: copy.blurb.trim(),
    waves: copy.waves.trim(),
    wind: copy.wind.trim(),
    water: copy.water.trim(),
  };
}
