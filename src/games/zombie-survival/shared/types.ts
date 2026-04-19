export type PlayerColor =
  | 'blood' | 'toxic' | 'ash' | 'rust' | 'bone'
  | 'moss' | 'slate' | 'amber' | 'violet' | 'ice';

export const PLAYER_COLOR_PALETTE: PlayerColor[] = [
  'blood', 'toxic', 'ash', 'rust', 'bone',
  'moss', 'slate', 'amber', 'violet', 'ice',
];

export type PlayerStatus = 'human' | 'zombie';

export interface PublicPlayer {
  id: string;
  name: string;
  color: PlayerColor;
  status: PlayerStatus;
  lives: number;
  voted: boolean;
}

export type GameState =
  | 'lobby'
  | 'voting'
  | 'reveal'
  | 'finished';

export interface Scenario {
  situation: string;
  optionA: string;
  optionB: string;
}

export interface RoundResult {
  scenario: Scenario;
  votes: { name: string; color: PlayerColor; choice: 'A' | 'B'; status: PlayerStatus }[];
  majorityChoice: 'A' | 'B' | 'tie';
  bittenNames: string[];
  newZombieNames: string[];
  countA: number;
  countB: number;
}

export interface GameSnapshot {
  code: string;
  state: GameState;
  players: PublicPlayer[];
  hostId: string;
  currentRound: number;
  totalRounds: number;
  scenario?: Scenario;
  roundResult?: RoundResult;
  timeRemaining?: number;
  humansAlive: number;
  zombieCount: number;
  winner?: 'humans' | 'zombies';
}
