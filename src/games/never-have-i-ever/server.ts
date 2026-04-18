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
  color: PlayerColor;
  answer: boolean | null;
  totalIHave: number;
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

export function setupNeverHaveIEver(ns: Namespace): void {
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
    return { id: p.id, name: p.name, color: p.color, totalIHave: p.totalIHave };
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
      currentPrompt:
        room.state === 'answering' || room.state === 'reveal'
          ? room.currentPrompt
          : undefined,
      answeredCount:
        room.state === 'answering'
          ? room.players.filter((p) => p.answer !== null).length
          : undefined,
      myId: forId,
    };
  }

  function buildResult(room: Room): RoundResult {
    const answers: RoundResult['answers'] = [];
    const guiltyNames: string[] = [];
    const innocentNames: string[] = [];

    for (const p of room.players) {
      const iHave = p.answer === true;
      answers.push({ player: safePlayer(p), iHave });
      if (iHave) {
        p.totalIHave += 1;
        guiltyNames.push(p.name);
      } else {
        innocentNames.push(p.name);
      }
    }

    return {
      prompt: room.currentPrompt,
      answers,
      guiltyNames,
      innocentNames,
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
        color: PLAYER_COLOR_PALETTE[0]!,
        answer: null,
        totalIHave: 0,
      };
      const room: Room = {
        code,
        hostId: socket.id,
        players: [player],
        state: 'lobby',
        currentRound: 0,
        totalRounds: 15,
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
        socket.emit('error-msg', 'Room is full (max 10)');
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
        color: pickColor(taken),
        answer: null,
        totalIHave: 0,
      };
      room.players.push(player);
      currentRoom = room;
      socket.join(code);
      broadcastState(room);
    });

    socket.on('update-settings', (data: { totalRounds: number }) => {
      if (!currentRoom || currentRoom.hostId !== socket.id) return;
      if (currentRoom.state !== 'lobby') return;
      currentRoom.totalRounds = Math.min(25, Math.max(5, data.totalRounds || 15));
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

    socket.on('submit-answer', (iHave: boolean) => {
      if (!currentRoom || currentRoom.state !== 'answering') return;
      const player = currentRoom.players.find((p) => p.id === socket.id);
      if (!player || player.answer !== null) return;

      player.answer = iHave === true;

      const answeredCount = currentRoom.players.filter((p) => p.answer !== null).length;
      ns.to(currentRoom.code).emit('answer-count', {
        count: answeredCount,
        total: currentRoom.players.length,
      });

      if (answeredCount === currentRoom.players.length) {
        const result = buildResult(currentRoom);
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
        p.totalIHave = 0;
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
          const result = buildResult(currentRoom);
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
