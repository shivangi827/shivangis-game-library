import { Namespace } from 'socket.io';
import {
  PlayerColor,
  PLAYER_COLOR_PALETTE,
  PublicPlayer,
  GameState,
  RoundResult,
  GameSnapshot,
} from './shared/types';
import { PROMPTS } from './shared/prompts';

interface Player {
  id: string;
  name: string;
  score: number;
  color: PlayerColor;
  answer: number | null;
}

interface Room {
  code: string;
  hostId: string;
  players: Player[];
  state: GameState;
  currentRound: number;
  totalRounds: number;
  currentPrompt: string;
  usedPromptIndices: Set<number>;
}

export function setupVibeCheck(ns: Namespace): void {
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
    return { id: p.id, name: p.name, score: p.score, color: p.color };
  }

  function pickPrompt(room: Room): string {
    const available = PROMPTS.map((_, i) => i).filter(
      (i) => !room.usedPromptIndices.has(i)
    );
    if (available.length === 0) {
      room.usedPromptIndices.clear();
      return PROMPTS[Math.floor(Math.random() * PROMPTS.length)]!;
    }
    const idx = available[Math.floor(Math.random() * available.length)]!;
    room.usedPromptIndices.add(idx);
    return PROMPTS[idx]!;
  }

  function snapshot(room: Room, forId?: string): GameSnapshot {
    return {
      code: room.code,
      state: room.state,
      players: room.players.map(safePlayer),
      hostId: room.hostId,
      currentRound: room.currentRound,
      totalRounds: room.totalRounds,
      currentPrompt: room.state === 'answering' || room.state === 'reveal'
        ? room.currentPrompt
        : undefined,
      answeredCount:
        room.state === 'answering'
          ? room.players.filter((p) => p.answer !== null).length
          : undefined,
      myId: forId,
    };
  }

  function calculateResults(room: Room): RoundResult {
    const answered = room.players.filter((p) => p.answer !== null);
    const sum = answered.reduce((s, p) => s + p.answer!, 0);
    const average = answered.length > 0 ? sum / answered.length : 5;

    const answerCounts = new Map<number, number>();
    for (const p of answered) {
      answerCounts.set(p.answer!, (answerCounts.get(p.answer!) ?? 0) + 1);
    }

    const answers: { player: PublicPlayer; answer: number }[] = [];
    const pointsAwarded: Record<string, number> = {};

    let outlierId = '';
    let outlierName = '';
    let bestDist = -1;
    let bestCount = Infinity;

    for (const p of room.players) {
      const ans = p.answer ?? Math.round(average);
      answers.push({ player: safePlayer(p), answer: ans });

      const dist = Math.abs(ans - average);
      const points = Math.max(0, Math.round(10 - dist));
      p.score += points;
      pointsAwarded[p.id] = points;

      const count = answerCounts.get(ans) ?? 1;
      if (count < bestCount || (count === bestCount && dist > bestDist)) {
        bestDist = dist;
        bestCount = count;
        outlierId = p.id;
        outlierName = p.name;
      }
    }

    return {
      prompt: room.currentPrompt,
      answers,
      average: Math.round(average * 10) / 10,
      outlierId,
      outlierName,
      pointsAwarded,
    };
  }

  function broadcastState(room: Room): void {
    for (const p of room.players) {
      ns.to(p.id).emit('state', snapshot(room, p.id));
    }
  }

  ns.on('connection', (socket) => {
    let currentRoom: Room | null = null;

    socket.on('create-room', (name: string) => {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        socket.emit('error-msg', 'Name is required');
        return;
      }
      const code = generateCode();
      const player: Player = {
        id: socket.id,
        name: name.trim().slice(0, 20),
        score: 0,
        color: PLAYER_COLOR_PALETTE[0]!,
        answer: null,
      };
      const room: Room = {
        code,
        hostId: socket.id,
        players: [player],
        state: 'lobby',
        currentRound: 0,
        totalRounds: 10,
        currentPrompt: '',
        usedPromptIndices: new Set(),
      };
      rooms.set(code, room);
      currentRoom = room;
      socket.join(code);
      socket.emit('room-created', code);
      broadcastState(room);
    });

    socket.on('join-room', (data: { code: string; name: string }) => {
      const code = data.code?.toUpperCase().trim();
      const name = data.name?.trim().slice(0, 20);
      if (!code || !name) {
        socket.emit('error-msg', 'Code and name are required');
        return;
      }
      const room = rooms.get(code);
      if (!room) {
        socket.emit('error-msg', 'Room not found');
        return;
      }
      if (room.state !== 'lobby') {
        socket.emit('error-msg', 'Game already in progress');
        return;
      }
      if (room.players.length >= 10) {
        socket.emit('error-msg', 'Room is full (max 10 players)');
        return;
      }
      if (room.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        socket.emit('error-msg', 'Name already taken');
        return;
      }

      const taken = new Set(room.players.map((p) => p.color));
      const player: Player = {
        id: socket.id,
        name,
        score: 0,
        color: pickColor(taken),
        answer: null,
      };
      room.players.push(player);
      currentRoom = room;
      socket.join(code);
      broadcastState(room);
    });

    socket.on('update-settings', (data: { totalRounds: number }) => {
      if (!currentRoom || currentRoom.hostId !== socket.id) return;
      if (currentRoom.state !== 'lobby') return;
      const rounds = Math.min(20, Math.max(5, data.totalRounds || 10));
      currentRoom.totalRounds = rounds;
      broadcastState(currentRoom);
    });

    socket.on('start-game', () => {
      if (!currentRoom || currentRoom.hostId !== socket.id) return;
      if (currentRoom.state !== 'lobby') return;
      if (currentRoom.players.length < 2) {
        socket.emit('error-msg', 'Need at least 2 players');
        return;
      }

      currentRoom.state = 'answering';
      currentRoom.currentRound = 1;
      currentRoom.currentPrompt = pickPrompt(currentRoom);
      for (const p of currentRoom.players) p.answer = null;
      broadcastState(currentRoom);
    });

    socket.on('submit-answer', (answer: number) => {
      if (!currentRoom || currentRoom.state !== 'answering') return;
      const player = currentRoom.players.find((p) => p.id === socket.id);
      if (!player || player.answer !== null) return;

      const val = Math.min(10, Math.max(1, Math.round(answer)));
      player.answer = val;

      const answeredCount = currentRoom.players.filter((p) => p.answer !== null).length;
      ns.to(currentRoom.code).emit('answer-count', {
        count: answeredCount,
        total: currentRoom.players.length,
      });

      if (answeredCount === currentRoom.players.length) {
        const result = calculateResults(currentRoom);
        currentRoom.state = 'reveal';
        for (const p of currentRoom.players) {
          const snap = snapshot(currentRoom, p.id);
          snap.roundResult = result;
          ns.to(p.id).emit('state', snap);
        }
      }
    });

    socket.on('next-round', () => {
      if (!currentRoom || currentRoom.hostId !== socket.id) return;
      if (currentRoom.state !== 'reveal') return;

      if (currentRoom.currentRound >= currentRoom.totalRounds) {
        currentRoom.state = 'finished';
        broadcastState(currentRoom);
        return;
      }

      currentRoom.currentRound += 1;
      currentRoom.state = 'answering';
      currentRoom.currentPrompt = pickPrompt(currentRoom);
      for (const p of currentRoom.players) p.answer = null;
      broadcastState(currentRoom);
    });

    socket.on('play-again', () => {
      if (!currentRoom || currentRoom.hostId !== socket.id) return;
      currentRoom.state = 'lobby';
      currentRoom.currentRound = 0;
      currentRoom.currentPrompt = '';
      currentRoom.usedPromptIndices.clear();
      for (const p of currentRoom.players) {
        p.score = 0;
        p.answer = null;
      }
      broadcastState(currentRoom);
    });

    socket.on('disconnect', () => {
      if (!currentRoom) return;
      const idx = currentRoom.players.findIndex((p) => p.id === socket.id);
      if (idx === -1) return;
      currentRoom.players.splice(idx, 1);

      if (currentRoom.players.length === 0) {
        rooms.delete(currentRoom.code);
        return;
      }

      if (currentRoom.hostId === socket.id) {
        currentRoom.hostId = currentRoom.players[0]!.id;
      }

      if (currentRoom.state === 'answering') {
        const answeredCount = currentRoom.players.filter((p) => p.answer !== null).length;
        if (answeredCount === currentRoom.players.length && currentRoom.players.length > 0) {
          const result = calculateResults(currentRoom);
          currentRoom.state = 'reveal';
          for (const p of currentRoom.players) {
            const snap = snapshot(currentRoom, p.id);
            snap.roundResult = result;
            ns.to(p.id).emit('state', snap);
          }
          return;
        }
      }

      broadcastState(currentRoom);
    });
  });
}
