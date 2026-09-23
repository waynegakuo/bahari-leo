import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { nairobiDate } from './sea/nairobi';
import { ComicEdition, ComicPanel } from './sea/types';

const COLLECTION = 'editions';
const IMAGES = 'images';

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

export function editionDocId(placeId: string, now = new Date()): string {
  return `${placeId}_${nairobiDate(now)}`;
}

function stripImages(edition: ComicEdition): ComicEdition {
  return {
    ...edition,
    panels: edition.panels.map(({ caption, imagePrompt }) => ({ caption, imagePrompt })),
  };
}

async function readPanelImages(docId: string): Promise<Map<number, string>> {
  const db = firestoreOrNull();
  const images = new Map<number, string>();
  if (!db) {
    return images;
  }
  const snap = await db.collection(COLLECTION).doc(docId).collection(IMAGES).get();
  snap.forEach((doc) => {
    const index = Number.parseInt(doc.id, 10);
    const url = doc.data()?.['imageUrl'];
    if (!Number.isNaN(index) && typeof url === 'string' && url.startsWith('data:')) {
      images.set(index, url);
    }
  });
  return images;
}

function mergeImages(edition: ComicEdition, images: Map<number, string>): ComicEdition {
  return {
    ...edition,
    panels: edition.panels.map((panel, index) => ({
      ...panel,
      imageUrl: images.get(index) ?? panel.imageUrl,
    })),
  };
}

export function editionHasAllImages(edition: ComicEdition): boolean {
  return edition.panels.length > 0 && edition.panels.every((panel) => Boolean(panel.imageUrl));
}

export async function readCachedEdition(placeId: string): Promise<ComicEdition | null> {
  const db = firestoreOrNull();
  if (!db) {
    return null;
  }
  try {
    const docId = editionDocId(placeId);
    const snap = await db.collection(COLLECTION).doc(docId).get();
    const data = snap.data();
    if (!data?.edition) {
      return null;
    }
    const edition = data.edition as ComicEdition;
    const images = await readPanelImages(docId);
    return mergeImages(edition, images);
  } catch (err) {
    console.warn('edition cache read skipped', err);
    return null;
  }
}

export async function writeCachedEdition(placeId: string, edition: ComicEdition): Promise<void> {
  const db = firestoreOrNull();
  if (!db) {
    return;
  }
  try {
    const docId = editionDocId(placeId);
    await db.collection(COLLECTION).doc(docId).set({
      placeId,
      date: nairobiDate(),
      edition: stripImages(edition),
      createdAt: new Date().toISOString(),
    });

    const batch = db.batch();
    edition.panels.forEach((panel, index) => {
      if (!panel.imageUrl) {
        return;
      }
      const ref = db.collection(COLLECTION).doc(docId).collection(IMAGES).doc(String(index));
      batch.set(ref, {
        imageUrl: panel.imageUrl,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  } catch (err) {
    console.warn('edition cache write skipped', err);
  }
}

export async function writePanelImages(placeId: string, panels: ComicPanel[]): Promise<void> {
  const db = firestoreOrNull();
  if (!db) {
    return;
  }
  try {
    const docId = editionDocId(placeId);
    const batch = db.batch();
    panels.forEach((panel, index) => {
      if (!panel.imageUrl) {
        return;
      }
      const ref = db.collection(COLLECTION).doc(docId).collection(IMAGES).doc(String(index));
      batch.set(ref, {
        imageUrl: panel.imageUrl,
        updatedAt: new Date().toISOString(),
      });
    });
    await batch.commit();
  } catch (err) {
    console.warn('panel image cache write skipped', err);
  }
}
