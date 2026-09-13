import http from 'node:http';
import { createHash } from 'node:crypto';

const PORT = Number(process.env.ROOM_REGISTRY_PORT || 8787);
const CRUX_BASE_URL = 'https://crux.supercraft.host/v1';

function getCruxToken() {
  const token = process.env.CRUX_TOKEN || process.env.CRUX_API_KEY;
  return token ? token.trim() : null;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1024 * 1024) throw new Error('Request body too large.');
  }
  if (!body.trim()) return {};
  return JSON.parse(body);
}

async function cruxRequest(path, options = {}) {
  const token = getCruxToken();
  if (!token) throw new Error('CRUX token is not configured on the server.');

  const response = await fetch(CRUX_BASE_URL + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
      payload?.message ||
      'Crux request failed (' + response.status + ').'
    );
  }
  return payload;
}

function normalizeRoom(room) {
  return {
    id: room?.id ?? room?.roomId ?? room?.key ?? null,
    name: room?.name ?? room?.roomName ?? 'Unnamed Room',
    players: Number(room?.players ?? room?.playerCount ?? 0),
    maxPlayers: Number(room?.maxPlayers ?? 0),
    createdAt: room?.createdAt ?? null,
    updatedAt: room?.updatedAt ?? null,
    metadata: room?.metadata ?? {}
  };
}

function publicRoom(room) {
  const normalized = normalizeRoom(room);
  return {
    ...normalized,
    joinCode: normalized.id
      ? createHash('sha256').update(String(normalized.id)).digest('hex').slice(0, 8).toUpperCase()
      : null
  };
}

async function listRooms() {
  const payload = await cruxRequest('/rooms');
  const rooms = Array.isArray(payload) ? payload : (payload.rooms || payload.data || []);
  return rooms.map(publicRoom);
}

async function createRoom(input) {
  const payload = await cruxRequest('/rooms', {
    method: 'POST',
    body: JSON.stringify(input || {})
  });
  return publicRoom(payload.room || payload.data || payload);
}

async function deleteRoom(id) {
  await cruxRequest('/rooms/' + encodeURIComponent(id), { method: 'DELETE' });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  try {
    const requestUrl = new URL(req.url || '/', 'http://localhost');
    const pathname = requestUrl.pathname;

    if (req.method === 'GET' && pathname === '/health') {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && pathname === '/api/rooms') {
      return sendJson(res, 200, { rooms: await listRooms() });
    }

    if (req.method === 'POST' && pathname === '/api/rooms') {
      return sendJson(res, 201, { room: await createRoom(await readJson(req)) });
    }

    const prefix = '/api/rooms/';
    if (req.method === 'DELETE' && pathname.startsWith(prefix)) {
      const id = pathname.slice(prefix.length);
      if (!id) return sendJson(res, 400, { error: 'Room id is required.' });
      await deleteRoom(id);
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 404, { error: 'Not found.' });
  } catch (error) {
    console.error('[crux-room-registry]', error);
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Internal server error.'
    });
  }
});

server.listen(PORT, () => {
  console.log('[crux-room-registry] listening on http://localhost:' + PORT);
});
