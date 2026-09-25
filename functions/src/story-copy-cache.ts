import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { nairobiDate } from './sea/nairobi';
import { SeaStoryCopy } from './sea/types';

const COLLECTION = 'storyCopies';

let appReady = false;

function firestoreOrNull() {
  try {
    if (!appReady) {
      initializeApp();
      appReady = true;
    }
    return getFirestore();
  } catch {
    return null;
  }
}

export function storyCopyDocId(placeId: string, now = new Date()): string {
  return `${placeId}_${nairobiDate(now)}`;
}

export async function readCachedStoryCopy(placeId: string): Promise<SeaStoryCopy | null> {
  const db = firestoreOrNull();
  if (!db) {
    return null;
  }
  try {
    const snap = await db.collection(COLLECTION).doc(storyCopyDocId(placeId)).get();
    const data = snap.data()?.['copy'];
    if (!data || typeof data !== 'object') {
      return null;
    }
    return data as SeaStoryCopy;
  } catch (err) {
    console.warn('story copy cache read skipped', err);
    return null;
  }
}

export async function readCachedStoryCopies(
  placeIds: string[],
): Promise<Record<string, SeaStoryCopy>> {
  const entries = await Promise.all(
    placeIds.map(async (placeId) => {
      const copy = await readCachedStoryCopy(placeId);
      return copy ? ([placeId, copy] as const) : null;
    }),
  );
  return Object.fromEntries(entries.filter(Boolean) as [string, SeaStoryCopy][]);
}

export async function writeCachedStoryCopy(placeId: string, copy: SeaStoryCopy): Promise<void> {
  const db = firestoreOrNull();
  if (!db) {
    return;
  }
  try {
    await db.collection(COLLECTION).doc(storyCopyDocId(placeId)).set({
      placeId,
      date: nairobiDate(),
      copy,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('story copy cache write skipped', err);
  }
}

export async function writeCachedStoryCopies(copies: Record<string, SeaStoryCopy>): Promise<void> {
  await Promise.all(Object.entries(copies).map(([placeId, copy]) => writeCachedStoryCopy(placeId, copy)));
}
