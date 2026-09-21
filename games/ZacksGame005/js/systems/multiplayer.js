import { gameState } from '../state/gameState.js';

import {
    fetchRoomList,
    registerRoom,
    heartbeat,
    removeRoomFromDiscovery,
    getRoom
} from './room-discovery.js';

let peer = null;

const activeConnections = new Map();

const BROADCAST_INTERVAL = 100;
const PEER_TIMEOUT = 5000;
const HEARTBEAT_INTERVAL = 15000;

let lastBroadcastTime = 0;
let heartbeatTimer = null;

let currentRoom = null;
let isHost = false;

// Check if multiplayer is enabled - if not, provide stub functions
const isMultiplayerEnabled = true; // This can be toggled based on main menu state

export function initMultiplayer() {
    // Multiplayer is blocked per user request - return early without initializing
    gameState.multiplayer.status = 'disabled';
    gameState.multiplayer.notification =
        'Multiplayer functionality is currently disabled.';
    return false;
}

function loadPeerJS() {
    // Stub - multiplayer disabled
}

// Keep the rest of the functions as stubs to prevent errors
// but they won't actually do anything since multiplayer is disabled

export async function refreshRooms() {
    gameState.multiplayer.availableRooms = [];
    gameState.multiplayer.notification = 'Multiplayer is disabled.';
    return [];
}

export async function hostWorld() {
    gameState.multiplayer.status = 'error';
    gameState.multiplayer.notification = 'Multiplayer is disabled.';
    return false;
}

export async function joinWorld(hostPeerIdOrRoom) {
    gameState.multiplayer.status = 'error';
    gameState.multiplayer.notification = 'Multiplayer is disabled.';
    return false;
}

export function leaveWorld() {
    gameState.multiplayer.status = 'disconnected';
    gameState.multiplayer.notification = '';
}

export function shutdownMultiplayer() {
    gameState.multiplayer.status = 'disconnected';
    gameState.multiplayer.notification = '';
}

// Stub functions for the remaining multiplayer features
export function broadcastImmediateAttack(attackAngle) {
    // Multiplayer disabled - no-op
}

export function updateMultiplayer(dt) {
    // Multiplayer disabled - no-op
}

function applyRoomState() {
    // Stub
}

function startHeartbeat() {
    // Stub
}

function stopHeartbeat() {
    // Stub
}