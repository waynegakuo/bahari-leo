import { generatePanelArt } from './agents/panel-art-agent';
import { generateStoryEdition } from './agents/story-agent';
import {
  editionHasAllImages,
  readCachedEdition,
  writeCachedEdition,
  writePanelImages,
} from './cache';
import { buildBriefForPlace } from './sea/brief';
import { ComicEdition, ComicPanel, SeaStoryBrief } from './sea/types';

async function attachPanelArt(
  panels: ComicPanel[],
  brief: SeaStoryBrief,
): Promise<ComicPanel[]> {
  return Promise.all(
    panels.map(async (panel) => {
      if (panel.imageUrl) {
        return panel;
      }
      const prompt = panel.imagePrompt.trim() || panel.caption;
      const imageUrl = await generatePanelArt(prompt, brief.story.mood);
      return { ...panel, imageUrl };
    }),
  );
}

export async function generateCoastalEdition({ placeId }: { placeId: string }): Promise<ComicEdition> {
  const cached = await readCachedEdition(placeId);
  if (cached && editionHasAllImages(cached)) {
    return cached;
  }

  const brief = await buildBriefForPlace(placeId);

  if (cached) {
    const panels = await attachPanelArt(cached.panels, brief);
    const edition: ComicEdition = { ...cached, panels };
    await writePanelImages(placeId, panels);
    return edition;
  }

  const story = await generateStoryEdition(brief);
  const panels = await attachPanelArt(story.panels, brief);
  const edition: ComicEdition = { ...story, panels };
  await writeCachedEdition(placeId, edition);
  return edition;
}
