const DEFAULT_DISCOVERY_URL = '/api/rooms';

// Safely access VITE_ROOM_DISCOVERY_URL, defaulting to DEFAULT_DISCOVERY_URL
// if import.meta.env is unavailable (e.g., outside Vite build context)
const VITE_ROOM_DISCOVERY_URL =
    (typeof import.meta?.env !== 'undefined'
        ? import.meta?.env.VITE_ROOM_DISCOVERY_URL
        : undefined) || DEFAULT_DISCOVERY_URL;

const DISCOVERY_URL = (VITE_ROOM_DISCOVERY_URL || DEFAULT_DISCOVERY_URL).replace(
    /\/$/,
    ''
);

/**
 * Fetch currently live public worlds.
 *
 * A transport error is intentionally allowed to throw. An unavailable
 * discovery service is NOT the same thing as an empty world list.
 */
export async function fetchRoomList() {
    const response = await fetch(DISCOVERY_URL, {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(
            `Room discovery failed: HTTP ${response.status}`
        );
    }

    const data = await response.json();

    const servers = Array.isArray(data)
        ? data
        : Array.isArray(data?.servers)
            ? data.servers
            : [];

    return servers
        .map(normalizeRoom)
        .filter(Boolean)
        .filter(room => room.players < room.maxPlayers)
        .sort((a, b) => b.players - a.players);
}

/**
 * Publish a host's PeerJS room through the trusted room bridge.
 */
export async function registerRoom(room) {
    validateRoom(room);

    const response = await fetch(`${DISCOVERY_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(room)
    });

    if (!response.ok) {
        throw new Error(
            `Room registration failed: HTTP ${response.status}`
        );
    }

    return true;
}

/**
 * Refresh a live room's player count/world metadata.
 */
export async function heartbeat(room) {
    validateRoom(room);

    const response = await fetch(`${DISCOVERY_URL}/heartbeat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(room)
    });

    if (!response.ok) {
        throw new Error(
            `Room heartbeat failed: HTTP ${response.status}`
        );
    }

    return true;
}

/**
 * Remove a host room immediately when the host leaves cleanly.
 */
export async function removeRoomFromDiscovery(roomId) {
    if (!roomId) {
        return false;
    }

    const response = await fetch(
        `${DISCOVERY_URL}/${encodeURIComponent(roomId)}`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json'
            }
        }
    );

    if (!response.ok && response.status !== 404) {
        throw new Error(
            `Room removal failed: HTTP ${response.status}`
        );
    }

    return true;
}

/**
 * Retrieve one room from the latest live registry data.
 */
export async function getRoom(roomId) {
    if (!roomId) {
        return null;
    }

    const rooms = await fetchRoomList();

    return rooms.find(
        room => room.roomId === roomId
    ) || null;
}

export function getCachedRooms() {
    return [];
}

/**
 * Normalize a server object into a room format.
 */
function normalizeRoom(server) {
    if (!server || typeof server !== 'object') {
        return null;
    }

    const hostPeerId = String(
        server.hostPeerId ||
        server.host_peer_id ||
        server.peer_id ||
        server.server_id ||
        ''
    ).trim();

    const roomId = String(
        server.roomId ||
        server.room_id ||
        server.server_id ||
        hostPeerId
    ).trim();

    if (!hostPeerId || !roomId) {
        return null;
    }

    const players = Number(
        server.players ??
        server.player_count ??
        0
    );

    const maxPlayers = Number(
        server.maxPlayers ??
        server.max_players ??
        8
    );

    return {
        roomId,
        roomName:
            server.roomName ||
            server.name ||
            'Unnamed World',
        hostPeerId,
        players: Number.isFinite(players) ? players : 0,
        maxPlayers: Number.isFinite(maxPlayers) && maxPlayers > 0
            ? maxPlayers
            : 8,
        world:
            server.world ||
            server.map_name ||
            'overworld',
        region:
            server.region ||
            null,
        gameMode:
            server.gameMode ||
            server.game_mode ||
            'zacksgame005',
        serverVersion:
            server.serverVersion ||
            server.server_version ||
            null
    };
}

/**
 * Validate a room object.
 */
function validateRoom(room) {
    if (!room || typeof room !== 'object') {
        throw new TypeError('A room object is required.');
    }

    if (!room.roomId && !room.hostPeerId) {
        throw new TypeError(
            'Room requires roomId or hostPeerId.'
        );
    }
}