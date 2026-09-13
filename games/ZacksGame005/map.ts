export const MAP_WIDTH = 128;
export const MAP_HEIGHT = 128;
export const TILE_SIZE = 32;
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE;
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE;

export enum Tile { Water = 0, Dirt = 1, Grass = 2, Mountain = 3, Road = 4, Building = 5, Decoration = 6 }
export type TileGrid = Tile[][];
export interface Point { x: number; y: number; }
export interface Camera { x: number; y: number; width: number; height: number; }
export interface Player { x: number; y: number; radius: number; speed: number; }

export const map: TileGrid = Array.from({ length: MAP_HEIGHT }, () => Array.from({ length: MAP_WIDTH }, () => Tile.Water));

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => { value += 0x6d2b79f5; let t = value; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const random = seededRandom(938271);
function insideMap(x: number, y: number): boolean { return x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT; }
function setTile(x: number, y: number, tile: Tile): void { if (insideMap(x, y)) map[y][x] = tile; }
function distance(x1: number, y1: number, x2: number, y2: number): number { const dx = x1 - x2, dy = y1 - y2; return Math.sqrt(dx * dx + dy * dy); }

const islandCenter = { x: 63, y: 63 };
const islandRadiusX = 48;
const islandRadiusY = 46;
function islandShape(x: number, y: number): number {
  const nx = (x - islandCenter.x) / islandRadiusX;
  const ny = (y - islandCenter.y) / islandRadiusY;
  return nx * nx + ny * ny + Math.sin(x * 0.31) * 0.035 + Math.sin(y * 0.23) * 0.03 + Math.sin((x + y) * 0.11) * 0.025;
}

for (let y = 0; y < MAP_HEIGHT; y++) for (let x = 0; x < MAP_WIDTH; x++) {
  const shape = islandShape(x, y);
  map[y][x] = shape < 0.86 ? Tile.Grass : shape < 1.03 ? Tile.Dirt : Tile.Water;
}

for (let y = 73; y < 84; y++) for (let x = 25; x < 103; x++) if (distance(x, y, 64, 73) < 39) map[y][x] = Tile.Dirt;
for (let y = 38; y < 82; y++) for (let x = 93; x < 106; x++) if (distance(x, y, 95, 60) < 18) map[y][x] = Tile.Dirt;
for (let y = 57; y < 72; y++) for (let x = 84; x < 101; x++) if (distance(x, y, 98, 65) < 11) map[y][x] = Tile.Water;
for (let y = 64; y < 75; y++) for (let x = 91; x < 101; x++) if (distance(x, y, 100, 69) < 7) map[y][x] = Tile.Dirt;

for (let y = 20; y < 48; y++) for (let x = 41; x < 86; x++) {
  const dx = (x - 63) / 23, dy = (y - 34) / 16;
  if (dx * dx + dy * dy < 1 && random() > 0.12) map[y][x] = Tile.Mountain;
}

const mountainFingers: Point[] = [{x:47,y:49},{x:53,y:47},{x:60,y:45},{x:69,y:46},{x:76,y:48},{x:82,y:51}];
for (const p of mountainFingers) for (let y = p.y - 5; y <= p.y + 7; y++) for (let x = p.x - 4; x <= p.x + 4; x++) if (distance(x, y, p.x, p.y) < 5.5) setTile(x, y, Tile.Mountain);

// Thicker forest.
for (let y = 40; y < 80; y++) for (let x = 23; x < 59; x++) {
  if (distance(x, y, 40, 59) < 20 && map[y][x] !== Tile.Water && map[y][x] !== Tile.Mountain) map[y][x] = Tile.Grass;
}
for (let i = 0; i < 220; i++) {
  const x = 23 + Math.floor(random() * 36), y = 40 + Math.floor(random() * 40);
  if (insideMap(x, y) && map[y][x] === Tile.Grass) map[y][x] = Tile.Decoration;
}

const village = { x: 69, y: 70, width: 24, height: 20 };
for (let y = village.y; y < village.y + village.height; y++) for (let x = village.x; x < village.x + village.width; x++) if (insideMap(x, y) && map[y][x] !== Tile.Water && map[y][x] !== Tile.Mountain) map[y][x] = Tile.Dirt;

function paintRoad(x1: number, y1: number, x2: number, y2: number, width = 1): void {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps, x = Math.round(x1 + (x2 - x1) * t), y = Math.round(y1 + (y2 - y1) * t);
    for (let oy = -width; oy <= width; oy++) for (let ox = -width; ox <= width; ox++) {
      if (Math.abs(ox) + Math.abs(oy) > width + 1) continue;
      if (insideMap(x + ox, y + oy) && map[y + oy][x + ox] !== Tile.Water) map[y + oy][x + ox] = Tile.Road;
    }
  }
}

// Thin roads.
paintRoad(80, 89, 80, 63, 1);
paintRoad(80, 73, 55, 73, 1);
paintRoad(80, 63, 67, 50, 1);
paintRoad(80, 89, 68, 98, 1);

function paintBuilding(x: number, y: number, width: number, height: number): void {
  for (let yy = y; yy < y + height; yy++) for (let xx = x; xx < x + width; xx++) if (insideMap(xx, yy) && map[yy][xx] !== Tile.Water && map[yy][xx] !== Tile.Mountain) map[yy][xx] = Tile.Building;
}
paintBuilding(76, 67, 7, 5);
paintBuilding(86, 68, 6, 5);
paintBuilding(75, 78, 8, 5);
paintBuilding(86, 78, 6, 4);
paintBuilding(72, 85, 6, 4);
paintBuilding(86, 86, 6, 4);

for (let y = 72; y < 79; y++) for (let x = 79; x < 87; x++) if (map[y][x] !== Tile.Building) map[y][x] = Tile.Road;
setTile(83, 75, Tile.Decoration);
paintRoad(55, 73, 43, 61, 1);
paintRoad(43, 61, 39, 50, 1);

const cave = { x: 38, y: 44 };
for (let y = 40; y <= 48; y++) for (let x = 34; x <= 43; x++) if (distance(x, y, cave.x, cave.y) < 5 && map[y][x] !== Tile.Water) map[y][x] = Tile.Mountain;
setTile(38,44,Tile.Dirt); setTile(39,44,Tile.Dirt); setTile(38,45,Tile.Dirt); setTile(39,45,Tile.Dirt);

for (let x = 33; x < 93; x++) {
  const y = Math.round(35 + Math.sin(x * 0.2) * 2);
  if (insideMap(x, y) && map[y][x] !== Tile.Water) map[y][x] = Tile.Mountain;
}
const cliffs: Point[] = [{x:25,y:67},{x:29,y:70},{x:96,y:42},{x:101,y:48},{x:22,y:56}];
for (const c of cliffs) for (let y = c.y - 2; y <= c.y + 2; y++) for (let x = c.x - 2; x <= c.x + 2; x++) if (distance(x,y,c.x,c.y) < 2.8) setTile(x,y,Tile.Mountain);

// Water border cleanup: never overwrite buildings.
for (let y = 0; y < MAP_HEIGHT; y++) for (let x = 0; x < MAP_WIDTH; x++) if (islandShape(x, y) > 1.12 && map[y][x] !== Tile.Building) map[y][x] = Tile.Water;

// Restore thin roads after border cleanup.
paintRoad(80, 89, 80, 63, 1);
paintRoad(80, 73, 55, 73, 1);
paintRoad(80, 63, 67, 50, 1);
paintRoad(55, 73, 43, 61, 1);
paintRoad(43, 61, 39, 50, 1);

export function isWalkableTile(tx: number, ty: number): boolean {
  if (!insideMap(tx, ty)) return false;
  const tile = map[ty][tx];
  return tile !== Tile.Water && tile !== Tile.Mountain && tile !== Tile.Building;
}
export function isWalkableWorld(x: number, y: number, radius = 8): boolean {
  for (const p of [{x:x-radius,y:y-radius},{x:x+radius,y:y-radius},{x:x-radius,y:y+radius},{x:x+radius,y:y+radius}]) if (!isWalkableTile(Math.floor(p.x / TILE_SIZE), Math.floor(p.y / TILE_SIZE))) return false;
  return true;
}
export const player: Player = { x: 80 * TILE_SIZE + TILE_SIZE / 2, y: 74 * TILE_SIZE + TILE_SIZE / 2, radius: 10, speed: 180 };
export const camera: Camera = { x: player.x, y: player.y, width: 960, height: 640 };
export function updateCamera(screenWidth: number, screenHeight: number): void {
  camera.width = screenWidth; camera.height = screenHeight;
  camera.x = Math.max(0, Math.min(player.x - screenWidth / 2, WORLD_WIDTH - screenWidth));
  camera.y = Math.max(0, Math.min(player.y - screenHeight / 2, WORLD_HEIGHT - screenHeight));
}
function tileColor(tile: Tile): string {
  switch (tile) {
    case Tile.Water: return '#16384a'; case Tile.Dirt: return '#6b4930'; case Tile.Grass: return '#31452f'; case Tile.Mountain: return '#302b29'; case Tile.Road: return '#806448'; case Tile.Building: return '#352823'; case Tile.Decoration: return '#4d5a43'; default: return '#000000';
  }
}
function drawTile(ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number): void {
  ctx.fillStyle = tileColor(tile); ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  if (tile === Tile.Grass) { ctx.fillStyle = 'rgba(255,255,255,0.025)'; ctx.fillRect(x+5,y+7,5,2); ctx.fillRect(x+19,y+20,4,2); }
  if (tile === Tile.Dirt) { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(x+7,y+12,10,3); }
  if (tile === Tile.Water) { ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.beginPath(); ctx.moveTo(x+5,y+15); ctx.lineTo(x+20,y+15); ctx.stroke(); }
  if (tile === Tile.Mountain) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.moveTo(x+6,y+26); ctx.lineTo(x+16,y+6); ctx.lineTo(x+28,y+26); ctx.closePath(); ctx.fill(); }
  if (tile === Tile.Building) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(x+3,y+3,TILE_SIZE-6,5); ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fillRect(x+8,y+11,6,7); }
  if (tile === Tile.Decoration) { ctx.fillStyle = 'rgba(15,15,15,0.35)'; ctx.beginPath(); ctx.arc(x+16,y+16,5,0,Math.PI*2); ctx.fill(); }
}
export function drawMap(ctx: CanvasRenderingContext2D): void {
  const startX = Math.floor(camera.x / TILE_SIZE), startY = Math.floor(camera.y / TILE_SIZE), endX = Math.ceil((camera.x + camera.width) / TILE_SIZE), endY = Math.ceil((camera.y + camera.height) / TILE_SIZE);
  for (let y = startY; y <= endY && y < MAP_HEIGHT; y++) for (let x = startX; x <= endX && x < MAP_WIDTH; x++) if (x >= 0 && y >= 0) drawTile(ctx, map[y][x], x*TILE_SIZE-camera.x, y*TILE_SIZE-camera.y);
}
export function drawPlayer(ctx: CanvasRenderingContext2D): void {
  const screenX = player.x-camera.x, screenY = player.y-camera.y;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(screenX,screenY+9,11,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#b6a58c'; ctx.beginPath(); ctx.arc(screenX,screenY,player.radius,0,Math.PI*2); ctx.fill(); ctx.strokeStyle = '#191919'; ctx.lineWidth = 2; ctx.stroke();
}
const keys = new Set<string>();
export function attachControls(canvas: HTMLCanvasElement): void {
  window.addEventListener('keydown', event => keys.add(event.key.toLowerCase()));
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('click', () => canvas.focus());
}
export function updatePlayer(deltaSeconds: number): void {
  let dx = 0, dy = 0;
  if (keys.has('w') || keys.has('arrowup')) dy--; if (keys.has('s') || keys.has('arrowdown')) dy++; if (keys.has('a') || keys.has('arrowleft')) dx--; if (keys.has('d') || keys.has('arrowright')) dx++;
  if (!dx && !dy) return;
  const length = Math.sqrt(dx*dx+dy*dy); dx /= length; dy /= length; const move = player.speed * deltaSeconds;
  const nextX = player.x + dx*move, nextY = player.y + dy*move;
  if (isWalkableWorld(nextX, player.y, player.radius)) player.x = nextX;
  if (isWalkableWorld(player.x, nextY, player.radius)) player.y = nextY;
}
export function createIslandGame(canvas: HTMLCanvasElement): { update: (deltaSeconds:number)=>void; render: ()=>void } {
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas 2D context unavailable.'); attachControls(canvas);
  function update(deltaSeconds:number):void { updatePlayer(deltaSeconds); updateCamera(canvas.width,canvas.height); }
  function render():void {
    ctx.clearRect(0,0,canvas.width,canvas.height); drawMap(ctx); drawPlayer(ctx);
    const gradient = ctx.createLinearGradient(0,0,0,canvas.height); gradient.addColorStop(0,'rgba(0,0,0,0.08)'); gradient.addColorStop(1,'rgba(0,0,0,0.20)'); ctx.fillStyle=gradient; ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  return { update, render };
}
export function startIslandGame(canvas: HTMLCanvasElement): void {
  const game = createIslandGame(canvas); let lastTime = performance.now();
  function frame(now:number):void { const delta=Math.min((now-lastTime)/1000,0.05); lastTime=now; game.update(delta); game.render(); requestAnimationFrame(frame); }
  requestAnimationFrame(frame);
}
