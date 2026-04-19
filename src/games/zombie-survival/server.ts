import { Namespace, Socket } from 'socket.io';
import {
  PlayerColor,
  PLAYER_COLOR_PALETTE,
  PublicPlayer,
  PlayerStatus,
  GameState,
  GameSnapshot,
  RoundResult,
  Scenario,
} from './shared/types';
import { SCENARIOS } from './shared/prompts';

interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  status: PlayerStatus;
  lives: number;
  vote: 'A' | 'B' | null;
}

interface Room {
  code: string;
  hostId: string;
  players: Player[];
  state: GameState;
  currentRound: number;
  totalRounds: number;
  currentScenario: Scenario | null;
  usedPromptIndices: Set<number>;
  roundResult: RoundResult | null;
  voteTimer: ReturnType<typeof setInterval> | null;
  voteDeadline: number;
  winner: 'humans' | 'zombies' | null;
  lastActivity: number;
}

const MAX_PLAYERS = 10;
const MIN_PLAYERS = 4;
const MAX_ROOMS = 200;
const VOTE_DURATION = 30;
const ZOMBIE_INTEL_DELAY = 15;
const STARTING_LIVES = 1;

export function setupZombieSurvival(rawNs: Namespace): void {
  const ns = rawNs as Namespace;
  const rooms = new Map<string, Room>();

  function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = Array.from({ length: 5 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    } while (rooms.has(code));
    return code;
  }

  function pickColor(taken: Set<PlayerColor>): PlayerColor {
    for (const c of PLAYER_COLOR_PALETTE) {
      if (!taken.has(c)) return c;
    }
    return PLAYER_COLOR_PALETTE[0]!;
  }

  function safePlayer(p: Player): PublicPlayer {
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      status: p.status,
      lives: p.lives,
      voted: p.vote !== null,
    };
  }

  function humansAlive(room: Room): number {
    return room.players.filter(p => p.status === 'human').length;
  }

  function zombieCount(room: Room): number {
    return room.players.filter(p => p.status === 'zombie').length;
  }

  function snapshot(room: Room, forSocket?: Socket): GameSnapshot {
    const snap: GameSnapshot = {
      code: room.code,
      state: room.state,
      players: room.players.map(safePlayer),
      hostId: room.hostId,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      humansAlive: humansAlive(room),
      zombieCount: zombieCount(room),
      winner: room.winner ?? undefined,
    };
    if (room.currentScenario && (room.state === 'voting' || room.state === 'reveal')) {
      snap.scenario = room.currentScenario;
    }
    if (room.state === 'voting') {
      const remaining = Math.max(0, Math.ceil((room.voteDeadline - Date.now()) / 1000));
      snap.timeRemaining = remaining;
    }
    if (room.state === 'reveal' && room.roundResult) {
      snap.roundResult = room.roundResult;
    }
    return snap;
  }

  function broadcastState(room: Room): void {
    for (const p of room.players) {
      const sock = ns.sockets.get(p.id);
      if (sock) sock.emit('state', snapshot(room, sock));
    }
  }

  function pickScenario(room: Room): Scenario {
    const available = SCENARIOS.filter((_, i) => !room.usedPromptIndices.has(i));
    const pool = available.length > 0 ? available : SCENARIOS;
    if (available.length === 0) room.usedPromptIndices.clear();
    const idx = Math.floor(Math.random() * pool.length);
    const realIdx = SCENARIOS.indexOf(pool[idx]!);
    room.usedPromptIndices.add(realIdx);
    return pool[idx]!;
  }

  function clearTimer(room: Room): void {
    if (room.voteTimer) {
      clearInterval(room.voteTimer);
      room.voteTimer = null;
    }
  }

  function resolveVotes(room: Room): void {
    clearTimer(room);

    const humanPlayers = room.players.filter(p => p.status === 'human');
    for (const p of humanPlayers) {
      if (p.vote === null) {
        p.vote = 'B';
      }
    }

    let countA = 0;
    let countB = 0;
    for (const p of room.players) {
      if (p.vote === 'A') countA++;
      else if (p.vote === 'B') countB++;
    }

    let majorityChoice: 'A' | 'B' | 'tie';
    if (countA > countB) majorityChoice = 'A';
    else if (countB > countA) majorityChoice = 'B';
    else majorityChoice = 'tie';

    const bittenNames: string[] = [];
    const newZombieNames: string[] = [];

    if (majorityChoice === 'tie') {
      const unlucky = humanPlayers[Math.floor(Math.random() * humanPlayers.length)];
      if (unlucky) {
        unlucky.lives--;
        bittenNames.push(unlucky.name);
        if (unlucky.lives <= 0) {
          unlucky.status = 'zombie';
          unlucky.lives = 0;
          newZombieNames.push(unlucky.name);
        }
      }
    } else {
      for (const p of humanPlayers) {
        if (p.vote !== majorityChoice) {
          p.lives--;
          bittenNames.push(p.name);
          if (p.lives <= 0) {
            p.status = 'zombie';
            p.lives = 0;
            newZombieNames.push(p.name);
          }
        }
      }
    }

    room.roundResult = {
      scenario: room.currentScenario!,
      votes: room.players.map(p => ({
        name: p.name,
        color: p.color,
        choice: p.vote || 'A',
        status: p.status,
      })),
      majorityChoice,
      bittenNames,
      newZombieNames,
      countA,
      countB,
    };

    room.state = 'reveal';

    if (humansAlive(room) < 2) {
      room.winner = 'zombies';
      room.state = 'finished';
    } else if (room.currentRound >= room.totalRounds) {
      room.winner = 'humans';
      room.state = 'finished';
    }

    broadcastState(room);
  }

  function startVoting(room: Room): void {
    room.currentScenario = pickScenario(room);
    for (const p of room.players) p.vote = null;
    room.state = 'voting';
    room.voteDeadline = Date.now() + VOTE_DURATION * 1000;

    broadcastState(room);

    room.voteTimer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.voteDeadline - Date.now()) / 1000));

      ns.to(room.code).emit('timer', { secondsLeft: remaining });

      if (remaining <= VOTE_DURATION - ZOMBIE_INTEL_DELAY) {
        let cA = 0, cB = 0;
        for (const p of room.players) {
          if (p.vote === 'A') cA++;
          else if (p.vote === 'B') cB++;
        }
        for (const p of room.players) {
          if (p.status === 'zombie') {
            const sock = ns.sockets.get(p.id);
            if (sock) sock.emit('zombie-tally', { countA: cA, countB: cB });
          }
        }
      }

      if (remaining <= 0) {
        resolveVotes(room);
      }
    }, 1000);
  }

  function checkAllVoted(room: Room): void {
    const allVoted = room.players.every(p => p.vote !== null);
    if (allVoted) resolveVotes(room);
  }

  function getRoomForSocket(socket: Socket): Room | undefined {
    for (const room of rooms.values()) {
      if (room.players.some(p => p.id === socket.id)) return room;
    }
    return undefined;
  }

  setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms) {
      if (now - room.lastActivity > 30 * 60 * 1000) {
        clearTimer(room);
        rooms.delete(code);
      }
    }
  }, 60_000);

  ns.on('connection', (socket: Socket) => {
    socket.on('create-room', (name: string) => {
      if (typeof name !== 'string') return;
      const trimmed = name.trim().slice(0, 20);
      if (!trimmed) return socket.emit('error-msg', 'Name is required.');
      if (rooms.size >= MAX_ROOMS) return socket.emit('error-msg', 'Server is full.');

      const code = generateCode();
      const room: Room = {
        code,
        hostId: socket.id,
        players: [{
          id: socket.id,
          name: trimmed,
          color: PLAYER_COLOR_PALETTE[0]!,
          status: 'human',
          lives: STARTING_LIVES,
          vote: null,
        }],
        state: 'lobby',
        currentRound: 0,
        totalRounds: 3,
        currentScenario: null,
        usedPromptIndices: new Set(),
        roundResult: null,
        voteTimer: null,
        voteDeadline: 0,
        winner: null,
        lastActivity: Date.now(),
      };
      rooms.set(code, room);
      socket.join(code);
      socket.emit('room-created', code);
      broadcastState(room);
    });

    socket.on('join-room', (data: { code: string; name: string }) => {
      if (!data || typeof data.code !== 'string' || typeof data.name !== 'string') return;
      const code = data.code.trim().toUpperCase();
      const name = data.name.trim().slice(0, 20);
      if (!name) return socket.emit('error-msg', 'Name is required.');

      const room = rooms.get(code);
      if (!room) return socket.emit('error-msg', 'Room not found.');
      if (room.state !== 'lobby') return socket.emit('error-msg', 'Game already in progress.');
      if (room.players.length >= MAX_PLAYERS) return socket.emit('error-msg', 'Room is full.');
      if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase()))
        return socket.emit('error-msg', 'Name already taken.');

      const taken = new Set(room.players.map(p => p.color));
      room.players.push({
        id: socket.id,
        name,
        color: pickColor(taken),
        status: 'human',
        lives: STARTING_LIVES,
        vote: null,
      });
      room.lastActivity = Date.now();
      socket.join(code);
      broadcastState(room);
    });

    socket.on('update-settings', (data: { totalRounds?: number }) => {
      const room = getRoomForSocket(socket);
      if (!room || room.hostId !== socket.id || room.state !== 'lobby') return;
      if (data.totalRounds && [3, 5, 8, 10, 12, 15, 20].includes(data.totalRounds)) {
        room.totalRounds = data.totalRounds;
        broadcastState(room);
      }
    });

    socket.on('start-game', () => {
      const room = getRoomForSocket(socket);
      if (!room || room.hostId !== socket.id || room.state !== 'lobby') return;
      if (room.players.length < MIN_PLAYERS) return socket.emit('error-msg', `Need at least ${MIN_PLAYERS} players.`);

      room.currentRound = 1;
      room.lastActivity = Date.now();
      startVoting(room);
    });

    socket.on('submit-vote', (choice: 'A' | 'B') => {
      if (choice !== 'A' && choice !== 'B') return;
      const room = getRoomForSocket(socket);
      if (!room || room.state !== 'voting') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.vote !== null) return;

      player.vote = choice;
      room.lastActivity = Date.now();

      const votedCount = room.players.filter(p => p.vote !== null).length;
      ns.to(room.code).emit('vote-count', { count: votedCount, total: room.players.length });

      checkAllVoted(room);
    });

    socket.on('next-round', () => {
      const room = getRoomForSocket(socket);
      if (!room || room.hostId !== socket.id || room.state !== 'reveal') return;

      room.currentRound++;
      room.roundResult = null;
      room.lastActivity = Date.now();
      startVoting(room);
    });

    socket.on('play-again', () => {
      const room = getRoomForSocket(socket);
      if (!room || room.hostId !== socket.id) return;

      clearTimer(room);
      room.state = 'lobby';
      room.currentRound = 0;
      room.currentScenario = null;
      room.roundResult = null;
      room.usedPromptIndices.clear();
      room.winner = null;
      room.lastActivity = Date.now();
      for (const p of room.players) {
        p.status = 'human';
        p.lives = STARTING_LIVES;
        p.vote = null;
      }
      broadcastState(room);
    });

    socket.on('disconnect', () => {
      const room = getRoomForSocket(socket);
      if (!room) return;

      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) {
        clearTimer(room);
        rooms.delete(room.code);
        return;
      }

      if (room.hostId === socket.id) {
        room.hostId = room.players[0]!.id;
      }

      if (room.state === 'voting') {
        const votedCount = room.players.filter(p => p.vote !== null).length;
        ns.to(room.code).emit('vote-count', { count: votedCount, total: room.players.length });
        checkAllVoted(room);
      }

      broadcastState(room);
    });
  });
}
