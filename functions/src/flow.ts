import { generatePanelArt } from './agents/panel-art-agent';
import { generateSeaStoryCopy } from './agents/sea-copy-agent';
import { generateStoryEdition } from './agents/story-agent';
import {
  editionIsComplete,
  EDITION_PANEL_COUNT,
  readCachedEdition,
  writeCachedEdition,
  writePanelImages,
} from './cache';
import { readCachedStoryCopy, writeCachedStoryCopy } from './story-copy-cache';
import { buildBriefForPlace } from './sea/brief';
import { ComicEdition, ComicPanel, SeaStoryBrief, SeaStoryCopy } from './sea/types';

async function resolveStoryCopy(brief: SeaStoryBrief): Promise<SeaStoryCopy> {
  const cached = await readCachedStoryCopy(brief.place.id);
  if (cached) {
    return cached;
  }
  const copy = await generateSeaStoryCopy(brief);
  await writeCachedStoryCopy(brief.place.id, copy);
  return copy;
}

async function attachPanelArt(
  panels: ComicPanel[],
  brief: SeaStoryBrief,
  placeId: string,
): Promise<ComicPanel[]> {
  const filled: ComicPanel[] = [];

  for (const panel of panels) {
    if (panel.imageUrl) {
      filled.push(panel);
      continue;
    }
    const prompt = panel.imagePrompt.trim() || panel.caption;
    const imageUrl = await generatePanelArt(prompt, brief.story.mood);
    const next = { ...panel, imageUrl };
    filled.push(next);
    await writePanelImages(placeId, filled);
  }

  return filled;
}

export async function generateCoastalEdition({ placeId }: { placeId: string }): Promise<ComicEdition> {
  const brief = await buildBriefForPlace(placeId);
  const cached = await readCachedEdition(placeId);

  if (cached && editionIsComplete(cached)) {
    const storyCopy = await resolveStoryCopy(brief);
    return { ...cached, story: storyCopy };
  }

  const storyCopy = await resolveStoryCopy(brief);

  let draft: Pick<ComicEdition, 'editionTitle' | 'panels' | 'footer'>;

  if (cached?.panels.length === EDITION_PANEL_COUNT) {
    draft = cached;
  } else {
    const generated = await generateStoryEdition(brief);
    draft = {
      editionTitle: generated.editionTitle,
      footer: generated.footer,
      panels: generated.panels.map((panel, index) => ({
        ...panel,
        imageUrl: cached?.panels[index]?.imageUrl,
      })),
    };
    await writeCachedEdition(placeId, { ...draft, panels: draft.panels, story: storyCopy });
  }

  const panels = await attachPanelArt(draft.panels, brief, placeId);
  const edition: ComicEdition = { ...draft, panels, story: storyCopy };
  await writeCachedEdition(placeId, edition);
  return edition;
}
