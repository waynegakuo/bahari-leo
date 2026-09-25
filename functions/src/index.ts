import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/https';

const googleAIapiKey = defineSecret('GEMINI_API_KEY');

export const generateStoryCopies = onRequest(
  {
    cors: true,
    timeoutSeconds: 120,
    memory: '512MiB',
    secrets: [googleAIapiKey],
    region: 'africa-south1',
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST JSON with placeIds[]' });
      return;
    }

    const placeIds = Array.isArray(req.body?.placeIds)
      ? req.body.placeIds.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
      : [];
    if (!placeIds.length) {
      res.status(400).json({ error: 'placeIds[] is required' });
      return;
    }
    if (placeIds.length > 24) {
      res.status(400).json({ error: 'At most 24 places per request' });
      return;
    }

    try {
      const { generateStoryCopiesForPlaces } = await import('./story-copies-flow');
      const stories = await generateStoryCopiesForPlaces(placeIds);
      res.json({ stories });
    } catch (err) {
      const { respondGeminiError } = await import('./http-errors');
      respondGeminiError(res, err, 'Could not write fresh sea stories');
    }
  },
);

export const generateCoverArt = onRequest(
  {
    cors: true,
    timeoutSeconds: 120,
    memory: '512MiB',
    secrets: [googleAIapiKey],
    region: 'africa-south1',
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST JSON with placeId and story fields' });
      return;
    }

    const body = req.body ?? {};
    const placeId = typeof body.placeId === 'string' ? body.placeId.trim() : '';
    const placeName = typeof body.placeName === 'string' ? body.placeName.trim() : '';
    const county = typeof body.county === 'string' ? body.county.trim() : '';
    const mood = body.mood;
    const headline = typeof body.headline === 'string' ? body.headline.trim() : '';
    const blurb = typeof body.blurb === 'string' ? body.blurb.trim() : '';

    if (!placeId || !placeName || !county || !headline || !blurb) {
      res.status(400).json({ error: 'placeId, placeName, county, headline, and blurb are required' });
      return;
    }
    if (mood !== 'kind' && mood !== 'restless' && mood !== 'rough') {
      res.status(400).json({ error: 'mood must be kind, restless, or rough' });
      return;
    }

    try {
      const { generateCoverArtForPlace } = await import('./cover-art-flow');
      const result = await generateCoverArtForPlace({
        placeId,
        placeName,
        county,
        mood,
        headline,
        blurb,
      });
      res.json(result);
    } catch (err) {
      const { respondGeminiError } = await import('./http-errors');
      respondGeminiError(res, err, 'Could not paint today’s cover');
    }
  },
);

export const generateEdition = onRequest(
  {
    cors: true,
    timeoutSeconds: 300,
    memory: '1GiB',
    secrets: [googleAIapiKey],
    region: 'africa-south1',
    invoker: 'public',
  },
  async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method === 'GET') {
      res.status(200).json({ ok: true, service: 'bahari-leo-edition' });
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'POST JSON with placeId' });
      return;
    }

    const placeId = typeof req.body?.placeId === 'string' ? req.body.placeId.trim() : '';
    if (!placeId) {
      res.status(400).json({ error: 'placeId is required' });
      return;
    }

    try {
      const { generateCoastalEdition } = await import('./flow');
      const edition = await generateCoastalEdition({ placeId });
      res.json(edition);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not write today’s edition';
      if (message.startsWith('Unknown place')) {
        res.status(404).json({ error: message });
        return;
      }
      const { respondGeminiError } = await import('./http-errors');
      respondGeminiError(res, err, 'Could not write today’s edition');
    }
  },
);
