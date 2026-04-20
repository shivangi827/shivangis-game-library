import { Enemy, EnemyTier, TrapData, TreasureData, DailyModifier, Room, RoomType } from './types';

// ── Seeded PRNG ───────────────────────────────────

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dateSeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function makeRng(seed: string): () => number {
  return mulberry32(hashString(seed));
}

function rngInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function rngPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Enemy Templates ───────────────────────────────

const MINIONS: Omit<Enemy, 'hp'>[] = [
  { name: 'Rat Swarm', icon: '\u{1F400}', tier: 'minion', maxHp: 3, attack: 1, defense: 8, goldReward: 3 },
  { name: 'Shadow Wisp', icon: '\u{1F47B}', tier: 'minion', maxHp: 2, attack: 2, defense: 10, goldReward: 4 },
  { name: 'Skeleton', icon: '\u{1F480}', tier: 'minion', maxHp: 4, attack: 2, defense: 9, goldReward: 5 },
  { name: 'Cave Bat', icon: '\u{1F987}', tier: 'minion', maxHp: 2, attack: 1, defense: 7, goldReward: 2 },
];

const ELITES: Omit<Enemy, 'hp'>[] = [
  { name: 'Wraith', icon: '\u{1F9DB}', tier: 'elite', maxHp: 6, attack: 3, defense: 12, goldReward: 10 },
  { name: 'Bone Knight', icon: '\u{2694}\u{FE0F}', tier: 'elite', maxHp: 8, attack: 3, defense: 11, goldReward: 12 },
  { name: 'Cursed Scholar', icon: '\u{1F9D9}', tier: 'elite', maxHp: 5, attack: 4, defense: 13, goldReward: 15 },
];

const GUARDIANS: Omit<Enemy, 'hp'>[] = [
  { name: 'Abyssal Sentinel', icon: '\u{1F608}', tier: 'guardian', maxHp: 10, attack: 4, defense: 14, goldReward: 25 },
  { name: 'Shard Warden', icon: '\u{1F6E1}\u{FE0F}', tier: 'guardian', maxHp: 12, attack: 3, defense: 13, goldReward: 30 },
  { name: 'Void Herald', icon: '\u{1F525}', tier: 'guardian', maxHp: 8, attack: 5, defense: 15, goldReward: 20 },
];

function spawnEnemy(rng: () => number, tier: EnemyTier): Enemy {
  const pool = tier === 'minion' ? MINIONS : tier === 'elite' ? ELITES : GUARDIANS;
  const template = rngPick(rng, pool);
  return { ...template, hp: template.maxHp };
}

// ── Trap Templates ────────────────────────────────

const TRAPS: TrapData[] = [
  { name: 'Spike Pit', icon: '\u{1F4A5}', damage: 3, disarmDC: 10 },
  { name: 'Poison Dart', icon: '\u{1F3AF}', damage: 2, disarmDC: 8 },
  { name: 'Cave-In', icon: '\u{1FAA8}', damage: 4, disarmDC: 14 },
  { name: 'Rune Blast', icon: '\u{2728}', damage: 5, disarmDC: 16 },
];

function spawnTrap(rng: () => number): TrapData {
  return { ...rngPick(rng, TRAPS) };
}

// ── Treasure Templates ────────────────────────────

const TREASURES: TreasureData[] = [
  { gold: 8, healAmount: 0, description: 'A small chest of coins', icon: '\u{1F4B0}' },
  { gold: 0, healAmount: 4, description: 'A glowing healing font', icon: '\u{1F49A}' },
  { gold: 20, healAmount: 0, description: 'An ancient coffer', icon: '\u{1F3C6}' },
  { gold: 5, healAmount: 2, description: 'A potion cache', icon: '\u{1F9EA}' },
];

function spawnTreasure(rng: () => number): TreasureData {
  return { ...rngPick(rng, TREASURES) };
}

// ── Daily Modifiers ───────────────────────────────

export const MODIFIERS: DailyModifier[] = [
  { id: 'spectral', name: 'Spectral', description: 'Enemy hints hidden until adjacent', icon: '\u{1F47B}' },
  { id: 'horde', name: 'Horde', description: 'More enemies, but weaker', icon: '\u{1F9DF}' },
  { id: 'fortified', name: 'Fortified', description: 'Traps are harder, treasure is doubled', icon: '\u{1F6E1}\u{FE0F}' },
  { id: 'cursed', name: 'Cursed', description: 'Start with 15 HP but +2 attack', icon: '\u{1F480}' },
  { id: 'barren', name: 'Barren', description: 'Less treasure, enemies drop double gold', icon: '\u{1F3DC}\u{FE0F}' },
  { id: 'twilight', name: 'Twilight', description: 'Vision starts at 1 instead of 2', icon: '\u{1F311}' },
];

export function pickModifier(rng: () => number): DailyModifier {
  return rngPick(rng, MODIFIERS);
}

// ── Grid Generation ───────────────────────────────

const GRID_SIZE = 9;
const HUB_POS = { row: 4, col: 4 };
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function createEmptyGrid(): Room[][] {
  const grid: Room[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = {
        row: r, col: c, type: 'wall',
        revealed: false, visited: false,
        adjacentEnemyCount: 0,
      };
    }
  }
  return grid;
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

function carvePath(
  grid: Room[][],
  rng: () => number,
  startR: number,
  startC: number,
  preferDir: number[],
  length: number,
): { row: number; col: number }[] {
  const path: { row: number; col: number }[] = [];
  let r = startR;
  let c = startC;

  for (let i = 0; i < length; i++) {
    const candidates: number[][] = [];
    for (const d of DIRS) {
      const nr = r + d[0];
      const nc = c + d[1];
      if (!inBounds(nr, nc)) continue;
      if (nr === HUB_POS.row && nc === HUB_POS.col) continue;
      if (path.some(p => p.row === nr && p.col === nc)) continue;
      candidates.push(d);
    }
    if (candidates.length === 0) break;

    const weighted = candidates.map(d => {
      const dot = d[0] * preferDir[0] + d[1] * preferDir[1];
      return { d, w: dot > 0 ? 3 : 1 };
    });
    const total = weighted.reduce((s, x) => s + x.w, 0);
    let roll = rng() * total;
    let chosen = weighted[0].d;
    for (const w of weighted) {
      roll -= w.w;
      if (roll <= 0) { chosen = w.d; break; }
    }

    r += chosen[0];
    c += chosen[1];
    path.push({ row: r, col: c });
    if (grid[r][c].type === 'wall') {
      grid[r][c].type = 'empty';
    }
  }

  return path;
}

function populateRoom(
  grid: Room[][],
  rng: () => number,
  r: number,
  c: number,
  modifier: DailyModifier,
) {
  if (grid[r][c].type !== 'empty') return;

  const roll = rng();
  const isHorde = modifier.id === 'horde';
  const isBarren = modifier.id === 'barren';

  const enemyChance = isHorde ? 0.40 : 0.25;
  const trapChance = 0.15;
  const treasureChance = isBarren ? 0.08 : 0.18;

  let type: RoomType = 'empty';
  if (roll < enemyChance) {
    type = 'enemy';
    const enemy = spawnEnemy(rng, rng() < 0.2 ? 'elite' : 'minion');
    if (isHorde) { enemy.maxHp = Math.max(1, Math.floor(enemy.maxHp / 2)); enemy.hp = enemy.maxHp; }
    if (isBarren) { enemy.goldReward *= 2; }
    grid[r][c].enemy = enemy;
  } else if (roll < enemyChance + trapChance) {
    type = 'trap';
    const trap = spawnTrap(rng);
    if (modifier.id === 'fortified') trap.disarmDC += 3;
    grid[r][c].trap = trap;
  } else if (roll < enemyChance + trapChance + treasureChance) {
    type = 'treasure';
    const t = spawnTreasure(rng);
    if (modifier.id === 'fortified') { t.gold *= 2; t.healAmount *= 2; }
    grid[r][c].treasure = t;
  }

  grid[r][c].type = type;
}

function computeAdjacencyCounts(grid: Room[][]) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].type === 'wall') continue;
      let count = 0;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && grid[nr][nc].type === 'enemy') count++;
      }
      grid[r][c].adjacentEnemyCount = count;
    }
  }
}

export interface GeneratedDungeon {
  grid: Room[][];
  shardPositions: { row: number; col: number }[];
  modifier: DailyModifier;
}

export function generateDungeon(seed: string): GeneratedDungeon {
  const rng = makeRng(seed);
  const modifier = pickModifier(rng);
  const grid = createEmptyGrid();

  grid[HUB_POS.row][HUB_POS.col].type = 'hub';

  const branchDirs = [
    [-1, 0],
    [0, 1],
    [1, 0],
  ];

  // shuffle branch dirs for variety
  for (let i = branchDirs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [branchDirs[i], branchDirs[j]] = [branchDirs[j], branchDirs[i]];
  }

  const shardPositions: { row: number; col: number }[] = [];

  for (let b = 0; b < 3; b++) {
    const pathLen = rngInt(rng, 5, 7);
    const path = carvePath(grid, rng, HUB_POS.row, HUB_POS.col, branchDirs[b], pathLen);

    if (path.length < 3) {
      const fallbackDirs = [[0, -1], [-1, -1], [1, 1]];
      const retry = carvePath(grid, rng, HUB_POS.row, HUB_POS.col, fallbackDirs[b], pathLen);
      path.push(...retry);
    }

    if (path.length > 0) {
      const shardRoom = path[path.length - 1];
      grid[shardRoom.row][shardRoom.col].type = 'shard';
      grid[shardRoom.row][shardRoom.col].shardIndex = b;
      grid[shardRoom.row][shardRoom.col].enemy = spawnEnemy(rng, 'guardian');
      shardPositions.push(shardRoom);

      if (path.length >= 3) {
        const guardPos = path[path.length - 2];
        if (grid[guardPos.row][guardPos.col].type === 'empty') {
          grid[guardPos.row][guardPos.col].type = 'enemy';
          grid[guardPos.row][guardPos.col].enemy = spawnEnemy(rng, 'elite');
        }
      }

      for (let i = 0; i < path.length - 2; i++) {
        populateRoom(grid, rng, path[i].row, path[i].col, modifier);
      }

      // add 1-2 side branches
      const sideBranches = rngInt(rng, 1, 2);
      for (let s = 0; s < sideBranches; s++) {
        const branchFrom = rngPick(rng, path.slice(0, -1));
        const sideLen = rngInt(rng, 1, 3);
        const sideDir = rngPick(rng, DIRS);
        const sidePath = carvePath(grid, rng, branchFrom.row, branchFrom.col, sideDir, sideLen);
        for (const sp of sidePath) {
          populateRoom(grid, rng, sp.row, sp.col, modifier);
        }
      }
    }
  }

  computeAdjacencyCounts(grid);

  return { grid, shardPositions, modifier };
}

export { GRID_SIZE, HUB_POS, DIRS, inBounds };
