import { SeaStory, SiteBoardRow } from './models';

export type SeaStoryCopy = Pick<SeaStory, 'headline' | 'swahili' | 'blurb' | 'waves' | 'wind' | 'water'>;

export function mergeStoryCopy(row: SiteBoardRow, copy?: SeaStoryCopy | null): SiteBoardRow {
  if (!copy || !row.story) {
    return row;
  }
  return {
    ...row,
    story: {
      ...row.story,
      ...copy,
    },
  };
}

export function mergeStoryCopies(
  rows: SiteBoardRow[],
  copies: Record<string, SeaStoryCopy>,
): SiteBoardRow[] {
  return rows.map((row) => mergeStoryCopy(row, copies[row.site.id]));
}
