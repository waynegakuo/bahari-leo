/** Firestore documents max out at 1 MiB — Gemini panel PNGs often exceed that. */
export const FIRESTORE_IMAGE_MAX_BYTES = 1_048_576;

/** Keep inline base64 under the Firestore doc limit (field name + metadata overhead). */
export const MAX_INLINE_IMAGE_CHARS = 780_000;

/** Chunk size for split panel images stored in a subcollection. */
export const IMAGE_CHUNK_CHARS = 750_000;

export function isPanelImageRef(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('data:');
}

export function splitDataUrl(dataUrl: string): { header: string; base64: string } {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) {
    throw new Error('Invalid panel data URL');
  }
  return {
    header: dataUrl.slice(0, comma + 1),
    base64: dataUrl.slice(comma + 1),
  };
}

export function joinDataUrl(header: string, base64: string): string {
  return `${header}${base64}`;
}

export function chunkBase64(base64: string): string[] {
  if (base64.length <= IMAGE_CHUNK_CHARS) {
    return [base64];
  }
  const chunks: string[] = [];
  for (let offset = 0; offset < base64.length; offset += IMAGE_CHUNK_CHARS) {
    chunks.push(base64.slice(offset, offset + IMAGE_CHUNK_CHARS));
  }
  return chunks;
}
