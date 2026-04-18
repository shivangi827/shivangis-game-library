import { Namespace, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  PublicPlayer,
  PlayerColor,
  PLAYER_COLOR_PALETTE,
  RoomSettings,
  GameStateName,
  MAX_PLAYERS_PER_ROOM,
  MIN_PLAYERS_TO_START,
  MAX_NAME_LENGTH,
  MAX_GUESS_LENGTH,
  MAX_ROOMS,
} from './shared/types';
import { WORD_LIST } from './shared/words';

interface Player {
  id: string;
  name: string;
  score: number;
  vote: string | null;
  isImposter: boolean;
  color: PlayerColor;
}

interface Room {
  code: string;
  hostId: string;
  players: Player[];
  state: GameStateName;
  round: number;
  word: string | null;
  hint: string | null;
  imposterId: string | null;
  imposterIds: string[];
  settings: RoomSettings;
  lastCaught: boolean;
  lastActivityAt: number;
}

interface SocketData {
  roomCode?: string;
  eventTimestamps: number[];
}

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const EVENT_WINDOW_MS = 1000;
const EVENT_LIMIT_PER_WINDOW = 15;

export function setupImposter(rawNs: Namespace): void {
  const ns = rawNs as Namespace<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
  const rooms = new Map<string, Room>();

  function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function safePlayer(p: Player): PublicPlayer {
    return { id: p.id, name: p.name, score: p.score, color: p.color };
  }

  function pickColor(taken: Set<PlayerColor>): PlayerColor {
    for (const c of PLAYER_COLOR_PALETTE) {
      if (!taken.has(c)) return c;
    }
    return PLAYER_COLOR_PALETTE[0]!;
  }

  function sanitizeName(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH) return null;
    return trimmed;
  }

  function sanitizeCode(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const upper = raw.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,8}$/.test(upper)) return null;
    return upper;
  }

  function touch(room: Room): void {
    room.lastActivityAt = Date.now();
  }

  function getMostVotedId(players: Player[]): { mostVotedId: string | null; tie: boolean } {
    const counts: Record<string, number> = {};
    for (const p of players) {
      if (p.vote) counts[p.vote] = (counts[p.vote] || 0) + 1;
    }
    let maxVotes = 0;
    let mostVotedId: string | null = null;
    let tie = false;
    for (const [id, count] of Object.entries(counts)) {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = id;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    }
    return { mostVotedId, tie };
  }

  function checkEventRate(socket: GameSocket): boolean {
    const now = Date.now();
    const stamps = socket.data.eventTimestamps ?? [];
    const recent = stamps.filter((t) => now - t < EVENT_WINDOW_MS);
    recent.push(now);
    socket.data.eventTimestamps = recent;
    if (recent.length > EVENT_LIMIT_PER_WINDOW) {
      socket.emit('error-msg', { message: 'Slow down.' });
      return false;
    }
    return true;
  }

  ns.on('connection', (socket: GameSocket) => {
    socket.data.eventTimestamps = [];

    socket.on('create-room', ({ playerName, settings }) => {
      if (!checkEventRate(socket)) return;
      const name = sanitizeName(playerName);
      if (!name) {
        socket.emit('error-msg', { message: 'Invalid name.' });
        return;
      }
      if (rooms.size >= MAX_ROOMS) {
        socket.emit('error-msg', { message: 'Server is at capacity. Try again later.' });
        return;
      }

      let code: string;
      do {
        code = generateRoomCode();
      } while (rooms.has(code));

      const numImposters = Math.max(1, Math.min(3, Number(settings?.numImposters) || 1));

      const room: Room = {
        code,
        hostId: socket.id,
        players: [
          {
            id: socket.id,
            name,
            score: 0,
            vote: null,
            isImposter: false,
            color: PLAYER_COLOR_PALETTE[0]!,
          },
        ],
        state: 'lobby',
        round: 0,
        word: null,
        hint: null,
        imposterId: null,
        imposterIds: [],
        settings: { numImposters },
        lastCaught: false,
        lastActivityAt: Date.now(),
      };
      rooms.set(code, room);

      socket.join(code);
      socket.data.roomCode = code;
      socket.emit('joined', {
        code,
        myId: socket.id,
        players: room.players.map(safePlayer),
        hostId: room.hostId,
        state: 'lobby',
        settings: room.settings,
      });
    });

    socket.on('join-room', ({ code, playerName }) => {
      if (!checkEventRate(socket)) return;
      const cleanCode = sanitizeCode(code);
      const name = sanitizeName(playerName);
      if (!cleanCode) {
        socket.emit('error-msg', { message: 'Invalid room code.' });
        return;
      }
      if (!name) {
        socket.emit('error-msg', { message: 'Invalid name.' });
        return;
      }
      const room = rooms.get(cleanCode);
      if (!room) {
        socket.emit('error-msg', { message: 'Room not found. Check the code and try again.' });
        return;
      }
      if (room.state !== 'lobby') {
        socket.emit('error-msg', { message: 'Game already in progress.' });
        return;
      }
      if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
        socket.emit('error-msg', { message: `Room is full (max ${MAX_PLAYERS_PER_ROOM} players).` });
        return;
      }
      if (room.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        socket.emit('error-msg', { message: 'That name is already taken.' });
        return;
      }

      const taken = new Set(room.players.map((p) => p.color));
      const color = pickColor(taken);
      room.players.push({ id: socket.id, name, score: 0, vote: null, isImposter: false, color });
      socket.join(room.code);
      socket.data.roomCode = room.code;

      socket.emit('joined', {
        code: room.code,
        myId: socket.id,
        players: room.players.map(safePlayer),
        hostId: room.hostId,
        state: 'lobby',
        settings: room.settings,
      });

      touch(room);
      socket.to(room.code).emit('player-joined', {
        players: room.players.map(safePlayer),
        hostId: room.hostId,
      });
    });

    socket.on('update-settings', ({ numImposters }) => {
      if (!checkEventRate(socket)) return;
      const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
      if (!room || room.hostId !== socket.id || room.state !== 'lobby') return;
      touch(room);
      room.settings.numImposters = Math.max(1, Math.min(3, Number(numImposters) || 1));
      ns.to(room.code).emit('settings-updated', { settings: room.settings });
    });

    socket.on('start-game', () => {
      if (!checkEventRate(socket)) return;
      const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
      if (!room || room.hostId !== socket.id) return;
      touch(room);
      if (room.players.length < MIN_PLAYERS_TO_START) {
        socket.emit('error-msg', { message: `Need at least ${MIN_PLAYERS_TO_START} players to start.` });
        return;
      }

      const maxImposters =
        Math.floor(room.players.length / 2) - (room.players.length % 2 === 0 ? 1 : 0);
      const numImposters = Math.max(1, Math.min(room.settings.numImposters, maxImposters));

      const wordData = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]!;
      room.word = wordData.word;
      room.hint = wordData.hint;

      room.players.forEach((p) => {
        p.isImposter = false;
        p.vote = null;
      });
      const shuffled = [...room.players].sort(() => Math.random() - 0.5);
      const imposters = shuffled.slice(0, numImposters);
      imposters.forEach((imp) => {
        const p = room.players.find((p) => p.id === imp.id);
        if (p) p.isImposter = true;
      });
      room.imposterId = imposters[0]!.id;
      room.imposterIds = imposters.map((p) => p.id);

      room.state = 'role_reveal';
      room.round = 0;

      for (const player of room.players) {
        const sock = ns.sockets.get(player.id) as GameSocket | undefined;
        if (!sock) continue;
        if (player.isImposter) {
          sock.emit('your-role', { role: 'imposter', hint: room.hint! });
        } else {
          sock.emit('your-role', { role: 'civilian', word: room.word! });
        }
      }

      ns.to(room.code).emit('game-state', {
        state: 'role_reveal',
        round: 0,
        hostId: room.hostId,
        players: room.players.map(safePlayer),
      });
    });

    socket.on('next-round', () => {
      if (!checkEventRate(socket)) return;
      const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
      if (!room || room.hostId !== socket.id) return;
      touch(room);

      if (room.state === 'role_reveal') {
        room.round = 1;
        room.state = 'round';
      } else if (room.state === 'round') {
        room.round++;
        if (room.round > 3) {
          room.state = 'voting';
          room.players.forEach((p) => {
            p.vote = null;
          });
          ns.to(room.code).emit('game-state', {
            state: 'voting',
            round: room.round,
            hostId: room.hostId,
            players: room.players.map(safePlayer),
          });
          return;
        }
      }

      ns.to(room.code).emit('game-state', {
        state: room.state,
        round: room.round,
        hostId: room.hostId,
        players: room.players.map(safePlayer),
      });
    });

    socket.on('submit-vote', ({ votedId }) => {
      if (!checkEventRate(socket)) return;
      if (typeof votedId !== 'string') return;
      const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
      if (!room || room.state !== 'voting') return;
      touch(room);
      const player = room.players.find((p) => p.id === socket.id);
      if (!player || player.vote !== null) return;
      if (votedId === socket.id) return;
      if (!room.players.find((p) => p.id === votedId)) return;

      player.vote = votedId;

      const votedCount = room.players.filter((p) => p.vote !== null).length;
      const totalPlayers = room.players.length;

      ns.to(room.code).emit('vote-update', { votedCount, totalPlayers });

      if (votedCount === totalPlayers) {
        room.state = 'reveal_votes';
        const votes = room.players.map((p) => ({
          voterId: p.id,
          voterName: p.name,
          votedId: p.vote,
          votedName: room.players.find((pl) => pl.id === p.vote)?.name || '?',
        }));
        ns.to(room.code).emit('game-state', {
          state: 'reveal_votes',
          round: room.round,
          hostId: room.hostId,
          players: room.players.map(safePlayer),
          votes,
        });
      }
    });

    socket.on('reveal-imposter', () => {
      if (!checkEventRate(socket)) return;
      const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
      if (!room || room.hostId !== socket.id) return;
      touch(room);

      const { mostVotedId, tie } = getMostVotedId(room.players);
      const caught = !tie && !!mostVotedId && room.imposterIds.includes(mostVotedId);
      room.lastCaught = caught;

      const imposterNames = room.players.filter((p) => p.isImposter).map((p) => p.name);

      room.state = 'imposter_guess';
      ns.to(room.code).emit('game-state', {
        state: 'imposter_guess',
        hostId: room.hostId,
        imposterCaught: caught,
        imposterIds: room.imposterIds,
        imposterNames,
        word: null,
        players: room.players.map(safePlayer),
      });

      if (room.imposterId) {
        const imposterSock = ns.sockets.get(room.imposterId) as GameSocket | undefined;
        if (imposterSock && room.hint) {
          imposterSock.emit('imposter-guess-prompt', { hint: room.hint });
        }
      }
    });

    socket.on('imposter-guess', ({ guess }) => {
      if (!checkEventRate(socket)) return;
      if (typeof guess !== 'string' || guess.length > MAX_GUESS_LENGTH) return;
      const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
      if (!room || room.state !== 'imposter_guess') return;
      if (!room.imposterIds.includes(socket.id)) return;
      if (!room.word) return;
      touch(room);

      const trimmed = guess.trim();
      const correct = trimmed.toLowerCase() === room.word.toLowerCase();

      if (room.lastCaught) {
        room.players.forEach((p) => {
          if (!p.isImposter) p.score++;
        });
      }
      if (correct) {
        const imp = room.players.find((p) => p.id === socket.id);
        if (imp) imp.score++;
      }

      const imposterNames = room.players.filter((p) => p.isImposter).map((p) => p.name);
      room.state = 'results';

      ns.to(room.code).emit('game-state', {
        state: 'results',
        hostId: room.hostId,
        imposterCaught: room.lastCaught,
        imposterIds: room.imposterIds,
        imposterNames,
        word: room.word,
        imposterGuessCorrect: correct,
        imposterGuess: trimmed,
        players: room.players.map(safePlayer),
      });
    });

    socket.on('play-again', () => {
      if (!checkEventRate(socket)) return;
      const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
      if (!room || room.hostId !== socket.id) return;
      touch(room);

      room.state = 'lobby';
      room.round = 0;
      room.word = null;
      room.hint = null;
      room.imposterId = null;
      room.imposterIds = [];
      room.lastCaught = false;
      room.players.forEach((p) => {
        p.vote = null;
        p.isImposter = false;
      });

      ns.to(room.code).emit('game-state', {
        state: 'lobby',
        hostId: room.hostId,
        players: room.players.map(safePlayer),
        settings: room.settings,
      });
    });

    socket.on('disconnect', () => {
      const code = socket.data.roomCode;
      if (!code) return;
      const room = rooms.get(code);
      if (!room) return;

      room.players = room.players.filter((p) => p.id !== socket.id);

      if (room.players.length === 0) {
        rooms.delete(code);
        return;
      }

      if (room.hostId === socket.id) {
        room.hostId = room.players[0]!.id;
      }

      ns.to(room.code).emit('player-left', {
        players: room.players.map(safePlayer),
        hostId: room.hostId,
      });
    });
  });

  const ROOM_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
  setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms.entries()) {
      if (room.state !== 'lobby' && room.state !== 'results') continue;
      if (now - room.lastActivityAt <= ROOM_IDLE_TIMEOUT_MS) continue;
      ns.in(code).disconnectSockets(true);
      rooms.delete(code);
    }
  }, 60_000).unref();
}
