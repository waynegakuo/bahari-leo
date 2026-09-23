import { z } from 'genkit';

export const ComicPanelSchema = z.object({
  caption: z
    .string()
    .describe(
      'Comic dialogue or narration box — short, visual, present tense. Kenyan coastal voice; optional approved Swahili.',
    ),
  imagePrompt: z
    .string()
    .describe(
      'Required visual brief for the panel-art agent: Kenya coast scene, Kenyan characters where natural, editorial comic style.',
    ),
});

export const ComicEditionSchema = z.object({
  editionTitle: z.string().describe('e.g. Bahari Leo · Vanga · 2026-09-22'),
  panels: z.array(ComicPanelSchema).length(6),
  footer: z.string().describe('One-line reminder that this is a forecast, not live wildlife.'),
});

export type StoryEditionDraft = z.infer<typeof ComicEditionSchema>;

export const SeaStoryCopySchema = z.object({
  placeId: z.string(),
  headline: z.string(),
  swahili: z.string(),
  blurb: z.string(),
  waves: z.string(),
  wind: z.string(),
  water: z.string(),
});

export const BatchSeaStoryCopySchema = z.object({
  stories: z.array(SeaStoryCopySchema).min(1).max(24),
});

export type SeaStoryCopyDraft = z.infer<typeof SeaStoryCopySchema>;

export type SeaStoryCopy = Omit<SeaStoryCopyDraft, 'placeId'> & {
  mood: 'kind' | 'restless' | 'rough';
};
