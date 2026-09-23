import { generatePanelArt } from './agents/panel-art-agent';
import { generateSeaStoryCopy } from './agents/sea-copy-agent';
import { generateStoryEdition } from './agents/story-agent';
import {
  editionIsComplete,
  EDITION_PANEL_COUNT,
  readCachedEdition,
  writeCachedEdition,
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
  const brief = await buildBriefForPlace(placeId);
  const storyCopy = await generateSeaStoryCopy(brief);
  const cached = await readCachedEdition(placeId);

  if (cached && editionIsComplete(cached)) {
    return { ...cached, story: storyCopy };
  }

  let draft: Pick<ComicEdition, 'editionTitle' | 'panels' | 'footer'>;

  if (cached?.panels.length === EDITION_PANEL_COUNT) {
    // Six-panel script cached but some images missing — fill gaps only.
    draft = cached;
  } else {
    // Stale or missing cache (e.g. old 3-panel editions) — new 6-panel script.
    const generated = await generateStoryEdition(brief);
    draft = {
      editionTitle: generated.editionTitle,
      footer: generated.footer,
      panels: generated.panels.map((panel, index) => ({
        ...panel,
        imageUrl: cached?.panels[index]?.imageUrl,
      })),
    };
  }

  const panels = await attachPanelArt(draft.panels, brief);
  const edition: ComicEdition = { ...draft, panels, story: storyCopy };
  await writeCachedEdition(placeId, edition);
  return edition;
}
