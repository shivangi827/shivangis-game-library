export type GameStateName =
  | 'lobby'
  | 'role_reveal'
  | 'round'
  | 'voting'
  | 'reveal_votes'
  | 'imposter_guess'
  | 'results';

export type PlayerColor =
  | 'blue'
  | 'red'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'green'
  | 'yellow'
  | 'teal';

export const PLAYER_COLOR_PALETTE: PlayerColor[] = [
  'blue',
  'red',
  'orange',
  'purple',
  'pink',
  'green',
  'yellow',
  'teal',
];

export interface PublicPlayer {
  id: string;
  name: string;
  score: number;
  color: PlayerColor;
}

export interface RoomSettings {
  numImposters: number;
}

export interface VoteRecord {
  voterId: string;
  voterName: string;
  votedId: string | null;
  votedName: string;
}

export interface ServerToClientEvents {
  joined: (data: {
    code: string;
    myId: string;
    players: PublicPlayer[];
    hostId: string;
    state: GameStateName;
    settings: RoomSettings;
  }) => void;
  'player-joined': (data: { players: PublicPlayer[]; hostId: string }) => void;
  'player-left': (data: { players: PublicPlayer[]; hostId: string }) => void;
  'settings-updated': (data: { settings: RoomSettings }) => void;
  'your-role': (
    data:
      | { role: 'civilian'; word: string }
      | { role: 'imposter'; hint: string }
  ) => void;
  'game-state': (data: {
    state: GameStateName;
    round?: number;
    hostId: string;
    players: PublicPlayer[];
    settings?: RoomSettings;
    votes?: VoteRecord[];
    imposterCaught?: boolean;
    imposterIds?: string[];
    imposterNames?: string[];
    word?: string | null;
    imposterGuessCorrect?: boolean | null;
    imposterGuess?: string | null;
  }) => void;
  'vote-update': (data: { votedCount: number; totalPlayers: number }) => void;
  'imposter-guess-prompt': (data: { hint: string }) => void;
  'error-msg': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'create-room': (data: { playerName: string; settings?: Partial<RoomSettings> }) => void;
  'join-room': (data: { code: string; playerName: string }) => void;
  'update-settings': (data: { numImposters: number }) => void;
  'start-game': () => void;
  'next-round': () => void;
  'submit-vote': (data: { votedId: string }) => void;
  'reveal-imposter': () => void;
  'imposter-guess': (data: { guess: string }) => void;
  'play-again': () => void;
}

export const MAX_PLAYERS_PER_ROOM = 8;
export const MIN_PLAYERS_TO_START = 3;
export const MAX_NAME_LENGTH = 20;
export const MAX_GUESS_LENGTH = 60;
export const MAX_ROOMS = 500;
