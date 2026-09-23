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
      const message = err instanceof Error ? err.message : 'Could not write fresh sea stories';
      console.error('generateStoryCopies failed', err);
      res.status(500).json({ error: message });
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
      const status = message.startsWith('Unknown place') ? 404 : 500;
      console.error('generateEdition failed', err);
      res.status(status).json({ error: message });
    }
  },
);
