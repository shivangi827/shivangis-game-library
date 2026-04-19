import { io } from 'socket.io-client';
import { GameSnapshot, PublicPlayer, RoundResult } from '../shared/types';

const socket = io('/zombie-survival');

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function showScreen(id: string): void {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });
  const target = $(id);
  target.classList.remove('hidden');
  target.classList.add('active');
}

let state: GameSnapshot | null = null;
let myId: string | null = null;
let pendingAction: 'create' | 'join' | null = null;
let joinCode = '';

function livesDisplay(lives: number): string {
  const full = lives;
  const lost = 3 - lives;
  return '\u2764'.repeat(full) + '\u2661'.repeat(lost);
}

function renderLobby(): void {
  if (!state) return;
  $('lobby-code').textContent = state.code;
  $('lobby-player-count').textContent = String(state.players.length);

  const list = $('lobby-player-list');
  list.innerHTML = '';
  for (const p of state.players) {
    const li = document.createElement('li');
    li.className = 'player-chip';
    li.innerHTML = `<span class="chip-dot pcolor-${p.color}"></span>${p.name}${p.id === state.hostId ? ' <span class="host-tag">HOST</span>' : ''}`;
    list.appendChild(li);
  }

  const isHost = myId === state.hostId;
  $('host-settings').classList.toggle('hidden', !isHost);
  $('host-start-area').classList.toggle('hidden', !isHost);
  $('guest-waiting').classList.toggle('hidden', isHost);

  const canStart = state.players.length >= 4;
  ($('btn-start-game') as HTMLButtonElement).disabled = !canStart;
  $('lobby-waiting-msg').classList.toggle('hidden', canStart);
}

function renderVoting(): void {
  if (!state || !state.scenario) return;
  $('round-badge').textContent = `Round ${state.currentRound} / ${state.totalRounds}`;
  $('vote-situation').textContent = state.scenario.situation;
  $('btn-option-a').textContent = state.scenario.optionA;
  $('btn-option-b').textContent = state.scenario.optionB;

  const myPlayer = state.players.find(p => p.id === myId);
  const isZombie = myPlayer?.status === 'zombie';

  $('zombie-intel').classList.add('hidden');
  $('vote-zombie-badge').classList.toggle('hidden', !isZombie);

  $('vote-buttons').classList.remove('hidden');
  $('vote-submitted').classList.add('hidden');
  ($('btn-option-a') as HTMLButtonElement).disabled = false;
  ($('btn-option-b') as HTMLButtonElement).disabled = false;

  $('vote-humans').textContent = `${state.humansAlive} humans`;
  $('vote-zombies').textContent = `${state.zombieCount} zombies`;
}

function renderReveal(): void {
  if (!state || !state.roundResult) return;
  const r = state.roundResult;
  $('reveal-badge').textContent = `Round ${state.currentRound} / ${state.totalRounds}`;
  $('reveal-situation').textContent = r.scenario.situation;

  const colA = $('reveal-col-a');
  const colB = $('reveal-col-b');
  $('reveal-option-a').textContent = r.scenario.optionA;
  $('reveal-option-b').textContent = r.scenario.optionB;

  const isMajorityA = r.majorityChoice === 'A';
  const isMajorityB = r.majorityChoice === 'B';
  const isTie = r.majorityChoice === 'tie';

  colA.className = `reveal-col ${isTie ? 'col-tie' : isMajorityA ? 'col-safe' : 'col-bitten'}`;
  colB.className = `reveal-col ${isTie ? 'col-tie' : isMajorityB ? 'col-safe' : 'col-bitten'}`;

  const listA = $('reveal-list-a');
  const listB = $('reveal-list-b');
  listA.innerHTML = '';
  listB.innerHTML = '';

  for (const v of r.votes) {
    const li = document.createElement('li');
    const wasBitten = r.bittenNames.includes(v.name);
    const turned = r.newZombieNames.includes(v.name);
    const isZ = v.status === 'zombie';
    li.className = `reveal-player${wasBitten ? ' was-bitten' : ''}${turned ? ' just-turned' : ''}`;
    li.innerHTML = `<span class="chip-dot pcolor-${v.color}"></span>${v.name}${isZ ? ' <span class="zombie-tag">ZOMBIE</span>' : ''}${wasBitten ? ' <span class="bite-tag">BITTEN</span>' : ''}${turned ? ' <span class="turned-tag">TURNED</span>' : ''}`;
    if (v.choice === 'A') listA.appendChild(li);
    else listB.appendChild(li);
  }

  $('reveal-count-a').textContent = `${r.countA} vote${r.countA !== 1 ? 's' : ''}`;
  $('reveal-count-b').textContent = `${r.countB} vote${r.countB !== 1 ? 's' : ''}`;

  if (isTie && r.bittenNames.length > 0) {
    $('reveal-flavor').textContent = `A tie! The horde attacks in the chaos — ${r.bittenNames.join(', ')} was bitten!`;
  } else if (r.bittenNames.length === 0) {
    $('reveal-flavor').textContent = 'Unanimous decision — everyone survives!';
  } else {
    $('reveal-flavor').textContent = `${r.bittenNames.join(', ')} ${r.bittenNames.length === 1 ? 'was' : 'were'} bitten!`;
  }

  if (r.newZombieNames.length > 0) {
    $('reveal-turned').textContent = `${r.newZombieNames.join(', ')} turned into ${r.newZombieNames.length === 1 ? 'a zombie' : 'zombies'}!`;
    $('reveal-turned').classList.remove('hidden');
  } else {
    $('reveal-turned').classList.add('hidden');
  }

  const statusList = $('reveal-status-list');
  statusList.innerHTML = '';
  for (const p of state.players) {
    const li = document.createElement('li');
    li.className = `status-player ${p.status}`;
    li.innerHTML = `<span class="chip-dot pcolor-${p.color}"></span>${p.name} <span class="lives">${p.status === 'zombie' ? 'UNDEAD' : livesDisplay(p.lives)}</span>`;
    statusList.appendChild(li);
  }

  const isHost = myId === state.hostId;
  const isFinished = state.state === 'finished';
  $('reveal-host-area').classList.toggle('hidden', !isHost || isFinished);
  $('reveal-guest-area').classList.toggle('hidden', isHost || isFinished);
}

function renderFinal(): void {
  if (!state) return;
  const isZombieWin = state.winner === 'zombies';
  $('final-title').textContent = isZombieWin ? 'The Horde Wins' : 'Humans Survived';
  $('final-subtitle').textContent = isZombieWin
    ? 'The infection has consumed everyone...'
    : 'Against all odds, humanity endures!';

  $('final-card').className = `card final-card ${isZombieWin ? 'zombie-win' : 'human-win'}`;
  ($('final-img') as HTMLImageElement).src = isZombieWin ? 'images/zombie-cheering.png' : 'images/human-winner.png';

  const board = $('final-scoreboard');
  board.innerHTML = '';
  const sorted = [...state.players].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'human' ? -1 : 1;
    return b.lives - a.lives;
  });
  for (const p of sorted) {
    const li = document.createElement('li');
    li.className = `score-row ${p.status}`;
    li.innerHTML = `<span class="chip-dot pcolor-${p.color}"></span><span class="score-name">${p.name}</span><span class="score-status">${p.status === 'zombie' ? 'UNDEAD' : livesDisplay(p.lives)}</span>`;
    board.appendChild(li);
  }

  const isHost = myId === state.hostId;
  $('final-host-area').classList.toggle('hidden', !isHost);
  $('final-guest-area').classList.toggle('hidden', isHost);
}

function render(): void {
  if (!state) return;
  switch (state.state) {
    case 'lobby':
      showScreen('screen-lobby');
      renderLobby();
      break;
    case 'voting':
      showScreen('screen-voting');
      renderVoting();
      break;
    case 'reveal':
      showScreen('screen-reveal');
      renderReveal();
      break;
    case 'finished':
      if (state.roundResult) {
        showScreen('screen-reveal');
        renderReveal();
        const isHost = myId === state.hostId;
        $('reveal-host-area').classList.add('hidden');
        $('reveal-guest-area').classList.add('hidden');
        $('final-from-reveal').classList.toggle('hidden', !isHost);
        $('final-from-reveal-guest').classList.toggle('hidden', isHost);
      } else {
        showScreen('screen-final');
        renderFinal();
      }
      break;
  }
}

// ── Socket events ──────────────────────────────

socket.on('connect', () => {
  myId = socket.id ?? null;
});

socket.on('room-created', (code: string) => {
  joinCode = code;
});

socket.on('state', (snap: GameSnapshot) => {
  const wasLobby = !state || state.state === 'lobby';
  state = snap;
  if (wasLobby && snap.state === 'lobby') {
    $('modal-name')?.classList.add('hidden');
  }
  render();
});

socket.on('vote-count', (data: { count: number; total: number }) => {
  $('vote-status').textContent = `${data.count} / ${data.total} voted`;
});

socket.on('timer', (data: { secondsLeft: number }) => {
  $('vote-timer').textContent = String(data.secondsLeft);
  const pct = (data.secondsLeft / 30) * 100;
  $('timer-bar-fill').style.width = `${pct}%`;
  if (data.secondsLeft <= 10) {
    $('timer-bar-fill').classList.add('urgent');
  } else {
    $('timer-bar-fill').classList.remove('urgent');
  }
});

socket.on('zombie-tally', (data: { countA: number; countB: number }) => {
  $('zombie-intel').classList.remove('hidden');
  $('intel-count-a').textContent = String(data.countA);
  $('intel-count-b').textContent = String(data.countB);
});

socket.on('error-msg', (msg: string) => {
  const errEl = $('modal-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }
});

// ── UI event listeners ─────────────────────────

$('btn-create').addEventListener('click', () => {
  pendingAction = 'create';
  $('modal-name-title').textContent = 'Enter Your Name';
  ($('input-name') as HTMLInputElement).value = '';
  $('modal-error').classList.add('hidden');
  $('modal-name').classList.remove('hidden');
  setTimeout(() => ($('input-name') as HTMLInputElement).focus(), 50);
});

$('btn-join').addEventListener('click', () => {
  const code = ($('input-join-code') as HTMLInputElement).value.trim().toUpperCase();
  if (!code || code.length < 3) return alert('Enter a room code first.');
  pendingAction = 'join';
  joinCode = code;
  $('modal-name-title').textContent = 'Enter Your Name';
  ($('input-name') as HTMLInputElement).value = '';
  $('modal-error').classList.add('hidden');
  $('modal-name').classList.remove('hidden');
  setTimeout(() => ($('input-name') as HTMLInputElement).focus(), 50);
});

$('input-join-code').addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') $('btn-join').click();
});

$('btn-name-confirm').addEventListener('click', () => {
  const name = ($('input-name') as HTMLInputElement).value.trim();
  if (!name) {
    $('modal-error').textContent = 'Please enter a name.';
    $('modal-error').classList.remove('hidden');
    return;
  }
  $('modal-error').classList.add('hidden');
  if (pendingAction === 'create') {
    socket.emit('create-room', name);
  } else if (pendingAction === 'join') {
    socket.emit('join-room', { code: joinCode, name });
  }
});

$('input-name').addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') $('btn-name-confirm').click();
});

$('btn-copy-code').addEventListener('click', () => {
  if (!state) return;
  navigator.clipboard.writeText(state.code).catch(() => {});
  const btn = $('btn-copy-code');
  btn.textContent = 'Copied!';
  setTimeout(() => (btn.textContent = 'Copy'), 1500);
});

$('btn-copy-link').addEventListener('click', () => {
  if (!state) return;
  const url = `${window.location.origin}/zombie-survival?code=${state.code}`;
  navigator.clipboard.writeText(url).catch(() => {});
  const btn = $('btn-copy-link');
  btn.textContent = 'Copied!';
  setTimeout(() => (btn.textContent = 'Copy Link'), 1500);
});

$('btn-start-game').addEventListener('click', () => socket.emit('start-game'));

$('setting-rounds').addEventListener('change', (e) => {
  const val = parseInt((e.target as HTMLSelectElement).value, 10);
  socket.emit('update-settings', { totalRounds: val });
});

$('btn-option-a').addEventListener('click', () => {
  socket.emit('submit-vote', 'A');
  $('vote-buttons').classList.add('hidden');
  $('vote-submitted').classList.remove('hidden');
});

$('btn-option-b').addEventListener('click', () => {
  socket.emit('submit-vote', 'B');
  $('vote-buttons').classList.add('hidden');
  $('vote-submitted').classList.remove('hidden');
});

$('btn-next-round').addEventListener('click', () => socket.emit('next-round'));
$('btn-play-again').addEventListener('click', () => socket.emit('play-again'));
$('btn-play-again-reveal').addEventListener('click', () => socket.emit('play-again'));

showScreen('screen-home');

const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) {
  ($('input-join-code') as HTMLInputElement).value = urlCode.toUpperCase();
  $('btn-join').click();
}
