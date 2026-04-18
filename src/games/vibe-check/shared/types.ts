export type PlayerColor =
  | 'coral' | 'teal' | 'purple' | 'green'
  | 'amber' | 'blue' | 'rose' | 'navy'
  | 'mint' | 'gold';

export const PLAYER_COLOR_PALETTE: PlayerColor[] = [
  'coral', 'teal', 'purple', 'green', 'amber',
  'blue', 'rose', 'navy', 'mint', 'gold',
];

export interface PublicPlayer {
  id: string;
  name: string;
  score: number;
  color: PlayerColor;
}

export type GameState = 'lobby' | 'answering' | 'reveal' | 'finished';

export interface RoundResult {
  prompt: string;
  answers: { player: PublicPlayer; answer: number }[];
  average: number;
  outlierId: string;
  outlierName: string;
  pointsAwarded: Record<string, number>;
}

export interface GameSnapshot {
  code: string;
  state: GameState;
  players: PublicPlayer[];
  hostId: string;
  currentRound: number;
  totalRounds: number;
  currentPrompt?: string;
  answeredCount?: number;
  roundResult?: RoundResult;
  myId?: string;
}
