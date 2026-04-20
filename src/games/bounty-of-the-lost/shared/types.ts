export type RoomType = 'empty' | 'enemy' | 'trap' | 'treasure' | 'shard' | 'hub' | 'wall';
export type EnemyTier = 'minion' | 'elite' | 'guardian';
export type GamePhase =
  | 'title'
  | 'exploring'
  | 'combat'
  | 'trap-encounter'
  | 'treasure-found'
  | 'shard-collected'
  | 'victory'
  | 'defeat';

export interface Enemy {
  name: string;
  icon: string;
  tier: EnemyTier;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  goldReward: number;
}

export interface TrapData {
  name: string;
  icon: string;
  damage: number;
  disarmDC: number;
}

export interface TreasureData {
  gold: number;
  healAmount: number;
  description: string;
  icon: string;
}

export interface Room {
  row: number;
  col: number;
  type: RoomType;
  revealed: boolean;
  visited: boolean;
  enemy?: Enemy;
  trap?: TrapData;
  treasure?: TreasureData;
  shardIndex?: number;
  adjacentEnemyCount: number;
}

export interface Player {
  hp: number;
  maxHp: number;
  attack: number;
  visionRange: number;
  shardsCollected: number;
  gold: number;
  roomsExplored: number;
  enemiesDefeated: number;
}

export interface CombatState {
  enemy: Enemy;
  playerRoll: number | null;
  enemyRoll: number | null;
  log: string[];
  phase: 'player-turn' | 'enemy-turn' | 'victory' | 'defeat';
}

export interface DailyModifier {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GameState {
  phase: GamePhase;
  grid: Room[][];
  gridSize: number;
  player: Player;
  playerPos: { row: number; col: number };
  hubPos: { row: number; col: number };
  shardPositions: { row: number; col: number }[];
  combat: CombatState | null;
  activeTrap: TrapData | null;
  activeTreasure: TreasureData | null;
  dailySeed: string;
  dailyModifier: DailyModifier;
  turnCount: number;
  startTime: number;
  endTime: number | null;
}

export interface RunResult {
  date: string;
  shardsExtracted: number;
  gold: number;
  roomsExplored: number;
  enemiesDefeated: number;
  turnCount: number;
  timeSeconds: number;
  perfectClear: boolean;
  modifier: string;
}

export interface SaveData {
  runs: RunResult[];
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string;
}
