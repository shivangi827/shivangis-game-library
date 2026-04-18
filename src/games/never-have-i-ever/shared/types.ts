export type PlayerColor =
  | 'rose' | 'crimson' | 'coral' | 'plum' | 'peach'
  | 'gold' | 'lavender' | 'teal' | 'mint' | 'sky';

export const PLAYER_COLOR_PALETTE: PlayerColor[] = [
  'rose', 'crimson', 'coral', 'plum', 'peach',
  'gold', 'lavender', 'teal', 'mint', 'sky',
];

export interface PublicPlayer {
  id: string;
  name: string;
  color: PlayerColor;
  totalIHave: number;
}

export type GameState = 'lobby' | 'answering' | 'reveal' | 'finished';

export interface RoundResult {
  prompt: string;
  answers: { player: PublicPlayer; iHave: boolean }[];
  guiltyNames: string[];
  innocentNames: string[];
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
