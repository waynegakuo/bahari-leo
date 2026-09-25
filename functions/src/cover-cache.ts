import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { COVER_ART_ASPECT_RATIO } from './agents/cover-art-agent';
import { nairobiDate } from './sea/nairobi';

const COLLECTION = 'coverArt';

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

export function coverDocId(placeId: string, now = new Date()): string {
  return `${placeId}_${nairobiDate(now)}`;
}

export async function readCachedCoverArt(placeId: string): Promise<string | null> {
  const db = firestoreOrNull();
  if (!db) {
    return null;
  }
  try {
    const snap = await db.collection(COLLECTION).doc(coverDocId(placeId)).get();
    const data = snap.data();
    const url = data?.['imageUrl'];
    const aspectRatio = data?.['aspectRatio'];
    if (aspectRatio !== COVER_ART_ASPECT_RATIO) {
      return null;
    }
    return typeof url === 'string' && url.startsWith('data:') ? url : null;
  } catch (err) {
    console.warn('cover art cache read skipped', err);
    return null;
  }
}

export async function writeCachedCoverArt(placeId: string, imageUrl: string): Promise<void> {
  const db = firestoreOrNull();
  if (!db) {
    return;
  }
  try {
    await db.collection(COLLECTION).doc(coverDocId(placeId)).set({
      placeId,
      date: nairobiDate(),
      aspectRatio: COVER_ART_ASPECT_RATIO,
      imageUrl,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('cover art cache write skipped', err);
  }
}
