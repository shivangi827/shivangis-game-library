import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  PublicPlayer,
  RoomSettings,
  GameStateName,
  VoteRecord,
} from '../shared/types';

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('/imposter');

interface ClientState {
  myId: string | null;
  myName: string | null;
  roomCode: string | null;
  hostId: string | null;
  players: PublicPlayer[];
  gameState: GameStateName | null;
  myRole: 'civilian' | 'imposter' | null;
  myWord: string | null;
  myHint: string | null;
  round: number;
  settings: RoomSettings;
  selectedVote: string | null;
  hasVoted: boolean;
  pendingAction: 'create' | 'join' | null;
  joinCode: string | null;
}

const state: ClientState = {
  myId: null,
  myName: null,
  roomCode: null,
  hostId: null,
  players: [],
  gameState: null,
  myRole: null,
  myWord: null,
  myHint: null,
  round: 0,
  settings: { numImposters: 1 },
  selectedVote: null,
  hasVoted: false,
  pendingAction: null,
  joinCode: null,
};

function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el as T;
}

function showScreen(name: string): void {
  document.querySelectorAll('.screen').forEach((s) => {
    s.classList.remove('active', 'visible');
    s.classList.add('hidden');
  });
  const el = document.getElementById(`screen-${name}`);
  if (el) {
    el.classList.remove('hidden');
    el.classList.add('active');
  }
}

function showModal(id: string): void {
  $(id).classList.remove('hidden');
}
function hideModal(id: string): void {
  $(id).classList.add('hidden');
}

function setError(msg: string): void {
  const el = $('modal-error');
  if (msg) {
    el.textContent = msg;
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

function playerAvatar(p: { name: string; color: string }): string {
  return `<div class="player-avatar pcolor-${escHtml(p.color)}">${escHtml(
    p.name.charAt(0).toUpperCase()
  )}</div>`;
}

function rankClass(i: number): string {
  if (i === 0) return 'gold';
  if (i === 1) return 'silver';
  if (i === 2) return 'bronze';
  return '';
}

function escHtml(str: unknown): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLobby(): void {
  $('lobby-code').textContent = state.roomCode;
  const list = $('lobby-player-list');
  list.innerHTML = state.players
    .map(
      (p) => `
    <li>
      ${playerAvatar(p)}
      <span class="player-name">${escHtml(p.name)}</span>
      ${p.id === state.hostId ? '<span class="host-badge">HOST</span>' : ''}
      ${p.id === state.myId ? '<span class="you-tag">(you)</span>' : ''}
    </li>
  `
    )
    .join('');
  $('lobby-player-count').textContent = `${state.players.length}/8`;

  const isHost = state.myId === state.hostId;

  $('host-settings').classList.toggle('hidden', !isHost);
  $('host-start-area').classList.toggle('hidden', !isHost);
  $('guest-waiting').classList.toggle('hidden', isHost);

  if (isHost) {
    ($('setting-imposters') as HTMLSelectElement).value = String(state.settings.numImposters);
    const canStart = state.players.length >= 3;
    ($('btn-start-game') as HTMLButtonElement).disabled = !canStart;
    $('lobby-waiting-msg').classList.toggle('hidden', canStart);
  }
}

function renderRound(round: number): void {
  $('round-badge').textContent = `Round ${round}`;
  const img = $('round-image') as HTMLImageElement;
  const byRound: Record<number, string> = {
    1: 'images/happy.png',
    2: 'images/confused.png',
    3: 'images/waiting.png',
  };
  img.src = byRound[round] ?? 'images/happy.png';
  $('round-player-list').innerHTML = state.players
    .map(
      (p) => `<div class="turn-chip pcolor-${escHtml(p.color)}">${escHtml(p.name)}</div>`
    )
    .join('');

  const isHost = state.myId === state.hostId;
  $('round-host-area').classList.toggle('hidden', !isHost);
  $('round-guest-area').classList.toggle('hidden', isHost);

  if (isHost) {
    const btn = $('btn-round-done');
    btn.textContent =
      round < 3
        ? `Round ${round} Done  →  Start Round ${round + 1}`
        : 'Round 3 Done  →  Go to Voting';
  }

  showScreen('round');
}

function renderVoting(): void {
  state.selectedVote = null;
  state.hasVoted = false;

  ($('vote-image') as HTMLImageElement).src = 'images/clock-waiting.png';
  $('vote-status').textContent = `0 / ${state.players.length} voted`;
  $('vote-submitted-msg').classList.add('hidden');

  const grid = $('vote-buttons');
  grid.classList.remove('hidden');
  grid.innerHTML = state.players
    .filter((p) => p.id !== state.myId)
    .map(
      (p) => `
      <button class="vote-btn" data-id="${escHtml(p.id)}">
        ${playerAvatar(p)}
        <span>${escHtml(p.name)}</span>
      </button>
    `
    )
    .join('');

  grid.querySelectorAll<HTMLButtonElement>('.vote-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (state.hasVoted) return;
      grid.querySelectorAll('.vote-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.selectedVote = btn.dataset.id ?? null;
      if (!state.selectedVote) return;

      state.hasVoted = true;
      btn.classList.add('submitted');
      grid.querySelectorAll<HTMLButtonElement>('.vote-btn').forEach((b) => {
        b.disabled = true;
        b.classList.add('submitted');
      });
      ($('vote-image') as HTMLImageElement).src = 'images/voted.png';
      $('vote-submitted-msg').classList.remove('hidden');
      grid.classList.add('hidden');
      socket.emit('submit-vote', { votedId: state.selectedVote });
    });
  });

  showScreen('voting');
}

function renderRevealVotes(votes: VoteRecord[]): void {
  const table = $('votes-table');
  table.innerHTML = votes
    .map(
      (v) => `
    <div class="vote-row">
      <span class="voter">${escHtml(v.voterName)}</span>
      <span class="arrow">→</span>
      <span class="voted-for">${escHtml(v.votedName)}</span>
    </div>
  `
    )
    .join('');

  const isHost = state.myId === state.hostId;
  $('reveal-votes-host-area').classList.toggle('hidden', !isHost);
  $('reveal-votes-guest-area').classList.toggle('hidden', isHost);

  showScreen('reveal-votes');
}

function renderImposterGuess(data: {
  imposterNames?: string[];
  imposterIds?: string[];
}): void {
  const names = (data.imposterNames ?? []).join(' & ');
  $('imposter-names-escaped').textContent = names;

  const isImposter = (data.imposterIds ?? []).includes(state.myId ?? '');
  $('guess-form').classList.toggle('hidden', !isImposter);
  $('guess-waiting').classList.toggle('hidden', isImposter);

  ($('btn-submit-guess') as HTMLButtonElement).disabled = false;

  if (isImposter) {
    $('guess-hint').textContent = state.myHint;
    const input = $('input-guess') as HTMLInputElement;
    input.value = '';
    input.focus();
  }

  showScreen('imposter-guess');
}

function renderResults(data: {
  players: PublicPlayer[];
  imposterIds?: string[];
  imposterNames?: string[];
  imposterCaught?: boolean;
  imposterGuessCorrect?: boolean | null;
  imposterGuess?: string | null;
  word?: string | null;
}): void {
  const sorted = [...data.players].sort((a, b) => b.score - a.score);
  const imposterSet = new Set(data.imposterIds ?? []);
  $('results-scoreboard').innerHTML = sorted
    .map(
      (p, i) => `
    <li>
      <div class="score-rank ${rankClass(i)}">${i + 1}</div>
      ${playerAvatar(p)}
      <span class="score-name">${escHtml(p.name)}</span>
      ${imposterSet.has(p.id) ? '<span class="score-imp-tag">imposter</span>' : ''}
      <span class="score-pts">${p.score} pt${p.score !== 1 ? 's' : ''}</span>
    </li>
  `
    )
    .join('');

  for (const id of [
    'result-caught',
    'result-caught-correct',
    'result-escaped-correct',
    'result-escaped-wrong',
  ]) {
    $(id).classList.add('hidden');
  }

  const names = (data.imposterNames ?? []).join(' & ');
  const word = data.word ?? '';
  const guess = data.imposterGuess ?? '';
  const caught = !!data.imposterCaught;
  const correct = !!data.imposterGuessCorrect;

  if (caught && !correct) {
    $('result-caught').classList.remove('hidden');
    $('result-imposter-name-caught').textContent = names;
    $('result-word-caught').textContent = word;
    $('result-guess-caught-val').textContent = guess;
  } else if (caught && correct) {
    $('result-caught-correct').classList.remove('hidden');
    $('result-imposter-name-cc').textContent = names;
    $('result-word-cc').textContent = word;
    $('result-guess-cc-val').textContent = guess;
  } else if (!caught && correct) {
    $('result-escaped-correct').classList.remove('hidden');
    $('result-imposter-name-escaped').textContent = names;
    $('result-word-escaped-correct').textContent = word;
    $('result-guess-correct-val').textContent = guess;
    ($('result-escaped-correct-img') as HTMLImageElement).src =
      state.myRole === 'imposter' ? 'images/excited.png' : 'images/disappointed.png';
  } else {
    $('result-escaped-wrong').classList.remove('hidden');
    $('result-imposter-name-wrong').textContent = names;
    $('result-word-escaped-wrong').textContent = word;
    $('result-guess-wrong-val').textContent = guess;
  }

  const isHost = state.myId === state.hostId;
  $('results-host-area').classList.toggle('hidden', !isHost);
  $('results-guest-area').classList.toggle('hidden', isHost);

  showScreen('results');
}

socket.on('joined', (data) => {
  state.myId = data.myId;
  state.roomCode = data.code;
  state.hostId = data.hostId;
  state.players = data.players;
  state.settings = data.settings || { numImposters: 1 };

  hideModal('modal-name');
  showScreen('lobby');
  renderLobby();
});

socket.on('player-joined', (data) => {
  state.players = data.players;
  state.hostId = data.hostId;
  renderLobby();
});

socket.on('player-left', (data) => {
  state.players = data.players;
  state.hostId = data.hostId;
  if (state.gameState === 'lobby') renderLobby();
});

socket.on('settings-updated', (data) => {
  state.settings = data.settings;
  if (state.gameState === 'lobby') renderLobby();
});

socket.on('your-role', (data) => {
  state.myRole = data.role;
  if (data.role === 'civilian') {
    state.myWord = data.word;
    state.myHint = null;
  } else {
    state.myHint = data.hint;
    state.myWord = null;
  }
});

socket.on('game-state', (data) => {
  state.gameState = data.state;
  state.hostId = data.hostId;
  if (data.players) state.players = data.players;
  if (data.settings) state.settings = data.settings;

  const isHost = state.myId === state.hostId;

  switch (data.state) {
    case 'lobby':
      state.myRole = null;
      state.myWord = null;
      state.myHint = null;
      state.round = 0;
      state.selectedVote = null;
      state.hasVoted = false;
      renderLobby();
      showScreen('lobby');
      break;

    case 'role_reveal': {
      const civDiv = $('role-civilian');
      const impDiv = $('role-imposter');
      if (state.myRole === 'civilian') {
        civDiv.classList.remove('hidden');
        impDiv.classList.add('hidden');
        $('role-word').textContent = state.myWord;
      } else {
        impDiv.classList.remove('hidden');
        civDiv.classList.add('hidden');
        $('role-hint').textContent = state.myHint;
      }
      $('host-start-round1').classList.toggle('hidden', !isHost);
      $('guest-role-wait').classList.toggle('hidden', isHost);
      showScreen('role');
      break;
    }

    case 'round':
      state.round = data.round ?? state.round;
      renderRound(state.round);
      break;

    case 'voting':
      renderVoting();
      break;

    case 'reveal_votes':
      renderRevealVotes(data.votes ?? []);
      break;

    case 'imposter_guess':
      renderImposterGuess({
        imposterNames: data.imposterNames,
        imposterIds: data.imposterIds,
      });
      break;

    case 'results':
      renderResults({
        players: data.players,
        imposterIds: data.imposterIds,
        imposterNames: data.imposterNames,
        imposterCaught: data.imposterCaught,
        imposterGuessCorrect: data.imposterGuessCorrect,
        imposterGuess: data.imposterGuess,
        word: data.word,
      });
      break;
  }
});

socket.on('vote-update', (data) => {
  $('vote-status').textContent = `${data.votedCount} / ${data.totalPlayers} voted`;
});

socket.on('imposter-guess-prompt', (data) => {
  if (data.hint) state.myHint = data.hint;
});

socket.on('error-msg', (data) => {
  setError(data.message);
});

$('btn-create').addEventListener('click', () => {
  state.pendingAction = 'create';
  $('modal-name-title').textContent = 'Enter Your Name';
  ($('input-name') as HTMLInputElement).value = '';
  setError('');
  showModal('modal-name');
  setTimeout(() => ($('input-name') as HTMLInputElement).focus(), 50);
});

$('btn-join').addEventListener('click', () => {
  const code = ($('input-join-code') as HTMLInputElement).value.trim().toUpperCase();
  if (!code || code.length < 3) {
    alert('Enter a room code first.');
    return;
  }
  state.pendingAction = 'join';
  state.joinCode = code;
  $('modal-name-title').textContent = 'Enter Your Name';
  ($('input-name') as HTMLInputElement).value = '';
  setError('');
  showModal('modal-name');
  setTimeout(() => ($('input-name') as HTMLInputElement).focus(), 50);
});

$('input-join-code').addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') $('btn-join').click();
});

$('btn-name-confirm').addEventListener('click', () => {
  const name = ($('input-name') as HTMLInputElement).value.trim();
  if (!name) {
    setError('Please enter a name.');
    return;
  }
  if (name.length > 20) {
    setError('Name is too long.');
    return;
  }
  setError('');

  state.myName = name;

  if (state.pendingAction === 'create') {
    socket.emit('create-room', {
      playerName: name,
      settings: state.settings,
    });
  } else if (state.pendingAction === 'join' && state.joinCode) {
    socket.emit('join-room', { code: state.joinCode, playerName: name });
  }
});

$('input-name').addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') $('btn-name-confirm').click();
});

$('btn-copy-code').addEventListener('click', () => {
  if (!state.roomCode) return;
  navigator.clipboard.writeText(state.roomCode).then(() => {
    const btn = $('btn-copy-code');
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = 'Copy';
    }, 1500);
  });
});

$('btn-copy-link').addEventListener('click', () => {
  if (!state.roomCode) return;
  const url = `${window.location.origin}/imposter?code=${state.roomCode}`;
  navigator.clipboard.writeText(url).then(() => {
    const btn = $('btn-copy-link');
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = 'Copy Link';
    }, 1500);
  });
});

$('setting-imposters').addEventListener('change', (e) => {
  const target = e.target as HTMLSelectElement;
  socket.emit('update-settings', { numImposters: parseInt(target.value, 10) });
});

$('btn-start-game').addEventListener('click', () => {
  socket.emit('start-game');
});

$('btn-start-round1').addEventListener('click', () => {
  socket.emit('next-round');
});

$('btn-round-done').addEventListener('click', () => {
  socket.emit('next-round');
});

$('btn-reveal-imposter').addEventListener('click', () => {
  socket.emit('reveal-imposter');
});

$('btn-submit-guess').addEventListener('click', () => {
  const guess = ($('input-guess') as HTMLInputElement).value.trim();
  if (!guess) return;
  ($('btn-submit-guess') as HTMLButtonElement).disabled = true;
  socket.emit('imposter-guess', { guess });
});

$('input-guess').addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') $('btn-submit-guess').click();
});

$('btn-play-again').addEventListener('click', () => {
  const btn = $('btn-play-again') as HTMLButtonElement;
  btn.disabled = true;
  socket.emit('play-again');
  setTimeout(() => {
    btn.disabled = false;
  }, 2000);
});

showScreen('home');

const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) {
  ($('input-join-code') as HTMLInputElement).value = urlCode.toUpperCase();
  $('btn-join').click();
}
