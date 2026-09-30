import { initializeApp } from 'firebase-admin/app';
import { getFirestore, type DocumentReference } from 'firebase-admin/firestore';
import {
  chunkBase64,
  isPanelImageRef,
  joinDataUrl,
  MAX_INLINE_IMAGE_CHARS,
  splitDataUrl,
} from './panel-image-store';
import { nairobiDate } from './sea/nairobi';
import { ComicEdition, ComicPanel } from './sea/types';

const COLLECTION = 'editions';
const IMAGES = 'images';
const CHUNKS = 'chunks';

/** Bump when comic script prompts change so stale editions are not reused. */
export const EDITION_PROMPT_VERSION = 3;

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

async function deleteChunkDocs(ref: DocumentReference): Promise<void> {
  const db = firestoreOrNull();
  if (!db) {
    return;
  }
  const snap = await ref.collection(CHUNKS).get();
  if (snap.empty) {
    return;
  }
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function decodePanelImage(ref: DocumentReference): Promise<string | undefined> {
  const snap = await ref.get();
  if (!snap.exists) {
    return undefined;
  }

  const data = snap.data() ?? {};
  const kind = data['kind'] as string | undefined;
  const legacyUrl = data['imageUrl'];

  if (kind === 'url' || kind === 'inline') {
    return typeof legacyUrl === 'string' && isPanelImageRef(legacyUrl) ? legacyUrl : undefined;
  }

  if (kind === 'chunked') {
    const header = data['dataUrlHeader'];
    const chunkCount = data['chunkCount'];
    if (typeof header !== 'string' || typeof chunkCount !== 'number' || chunkCount < 1) {
      return undefined;
    }

    const parts: string[] = [];
    for (let i = 0; i < chunkCount; i++) {
      const chunkSnap = await ref.collection(CHUNKS).doc(String(i)).get();
      const chunk = chunkSnap.data()?.['data'];
      if (typeof chunk !== 'string') {
        return undefined;
      }
      parts.push(chunk);
    }
    return joinDataUrl(header, parts.join(''));
  }

  return typeof legacyUrl === 'string' && isPanelImageRef(legacyUrl) ? legacyUrl : undefined;
}

async function writeOnePanelImage(docId: string, index: number, imageUrl: string): Promise<void> {
  const db = firestoreOrNull();
  if (!db) {
    return;
  }

  const ref = db.collection(COLLECTION).doc(docId).collection(IMAGES).doc(String(index));
  const updatedAt = new Date().toISOString();

  if (imageUrl.startsWith('https://')) {
    await deleteChunkDocs(ref);
    await ref.set({ kind: 'url', imageUrl, updatedAt });
    return;
  }

  if (imageUrl.length <= MAX_INLINE_IMAGE_CHARS) {
    await deleteChunkDocs(ref);
    await ref.set({ kind: 'inline', imageUrl, updatedAt });
    return;
  }

  const { header, base64 } = splitDataUrl(imageUrl);
  const chunks = chunkBase64(base64);
  await deleteChunkDocs(ref);

  const batch = db.batch();
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    batch.set(ref.collection(CHUNKS).doc(String(chunkIndex)), {
      order: chunkIndex,
      data: chunks[chunkIndex],
    });
  }
  batch.set(ref, {
    kind: 'chunked',
    dataUrlHeader: header,
    chunkCount: chunks.length,
    updatedAt,
  });
  await batch.commit();
}

async function readPanelImages(docId: string): Promise<Map<number, string>> {
  const db = firestoreOrNull();
  const images = new Map<number, string>();
  if (!db) {
    return images;
  }

  const snap = await db.collection(COLLECTION).doc(docId).collection(IMAGES).get();
  await Promise.all(
    snap.docs.map(async (doc) => {
      const index = Number.parseInt(doc.id, 10);
      if (Number.isNaN(index)) {
        return;
      }
      const url = await decodePanelImage(doc.ref);
      if (url) {
        images.set(index, url);
      }
    }),
  );
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

/** Comic editions are 6 panels — older 3-panel caches must be upgraded. */
export const EDITION_PANEL_COUNT = 6;

export function editionHasAllImages(edition: ComicEdition): boolean {
  return edition.panels.length > 0 && edition.panels.every((panel) => Boolean(panel.imageUrl));
}

export function editionIsComplete(edition: ComicEdition): boolean {
  return edition.panels.length === EDITION_PANEL_COUNT && editionHasAllImages(edition);
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
    if (!data?.edition || data['promptVersion'] !== EDITION_PROMPT_VERSION) {
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
      promptVersion: EDITION_PROMPT_VERSION,
      edition: stripImages(edition),
      createdAt: new Date().toISOString(),
    });

    await Promise.all(
      edition.panels.map((panel, index) =>
        panel.imageUrl ? writeOnePanelImage(docId, index, panel.imageUrl) : Promise.resolve(),
      ),
    );
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
    await Promise.all(
      panels.map((panel, index) =>
        panel.imageUrl ? writeOnePanelImage(docId, index, panel.imageUrl) : Promise.resolve(),
      ),
    );
  } catch (err) {
    console.warn('panel image cache write skipped', err);
  }
}
