import { io, Socket } from 'socket.io-client';
import { GameSnapshot, RoundResult, PublicPlayer } from '../shared/types';

const socket: Socket = io('/never-have-i-ever');

let state: GameSnapshot | null = null;
let pendingAction: 'create' | 'join' | null = null;
let joinCode = '';

function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function escHtml(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showScreen(id: string): void {
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.remove('active');
    el.classList.add('hidden');
  });
  const target = $(id);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
}

function playerAvatar(p: { name: string; color: string }): string {
  return `<div class="player-avatar pcolor-${escHtml(p.color)}">${escHtml(
    p.name.charAt(0).toUpperCase()
  )}</div>`;
}

$('btn-create')?.addEventListener('click', () => {
  pendingAction = 'create';
  const title = $('modal-name-title');
  if (title) title.textContent = 'Enter Your Name';
  const input = $('input-name') as HTMLInputElement | null;
  if (input) input.value = '';
  $('modal-name')?.classList.remove('hidden');
  input?.focus();
});

$('btn-join')?.addEventListener('click', () => {
  const code = ($('input-join-code') as HTMLInputElement | null)?.value.trim();
  if (!code) return;
  joinCode = code;
  pendingAction = 'join';
  const title = $('modal-name-title');
  if (title) title.textContent = 'Enter Your Name';
  const input = $('input-name') as HTMLInputElement | null;
  if (input) input.value = '';
  $('modal-name')?.classList.remove('hidden');
  input?.focus();
});

$('btn-name-confirm')?.addEventListener('click', submitName);
$('input-name')?.addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') submitName();
});
$('input-join-code')?.addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') $('btn-join')?.click();
});

function submitName(): void {
  const input = $('input-name') as HTMLInputElement | null;
  const name = input?.value.trim();
  if (!name) return;
  const errEl = $('modal-error');
  if (errEl) errEl.classList.add('hidden');

  if (pendingAction === 'create') {
    socket.emit('create-room', name);
  } else if (pendingAction === 'join') {
    socket.emit('join-room', { code: joinCode, name });
  }
}

$('btn-copy-code')?.addEventListener('click', () => {
  if (!state) return;
  navigator.clipboard.writeText(state.code).catch(() => {});
  const btn = $('btn-copy-code');
  if (btn) {
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy'), 1500);
  }
});

$('btn-copy-link')?.addEventListener('click', () => {
  if (!state) return;
  const url = `${window.location.origin}/never-have-i-ever?code=${state.code}`;
  navigator.clipboard.writeText(url).catch(() => {});
  const btn = $('btn-copy-link');
  if (btn) {
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy Link'), 1500);
  }
});

$('btn-start-game')?.addEventListener('click', () => socket.emit('start-game'));

$('setting-rounds')?.addEventListener('change', (e) => {
  const val = parseInt((e.target as HTMLSelectElement).value, 10);
  socket.emit('update-settings', { totalRounds: val });
});

$('btn-i-have')?.addEventListener('click', () => {
  socket.emit('submit-answer', true);
  $('btn-i-have')?.classList.add('selected');
  $('btn-never')?.classList.add('faded');
  $('answer-buttons-row')?.classList.add('locked');
  $('answer-submitted')?.classList.remove('hidden');
});

$('btn-never')?.addEventListener('click', () => {
  socket.emit('submit-answer', false);
  $('btn-never')?.classList.add('selected');
  $('btn-i-have')?.classList.add('faded');
  $('answer-buttons-row')?.classList.add('locked');
  $('answer-submitted')?.classList.remove('hidden');
});

function renderReveal(result: RoundResult): void {
  const guiltyEl = $('guilty-list');
  const innocentEl = $('innocent-list');
  const flavorEl = $('reveal-flavor');

  if (guiltyEl) {
    guiltyEl.innerHTML = result.answers
      .filter((a) => a.iHave)
      .map((a) => `<li>${playerAvatar(a.player)} <span>${escHtml(a.player.name)}</span></li>`)
      .join('');
  }

  if (innocentEl) {
    innocentEl.innerHTML = result.answers
      .filter((a) => !a.iHave)
      .map((a) => `<li>${playerAvatar(a.player)} <span>${escHtml(a.player.name)}</span></li>`)
      .join('');
  }

  if (flavorEl) {
    const total = result.answers.length;
    const guiltyCount = result.guiltyNames.length;
    if (guiltyCount === 0) {
      flavorEl.textContent = 'Nobody? Really?! You\'re all saints.';
    } else if (guiltyCount === total) {
      flavorEl.textContent = 'Everyone\'s guilty! No judgment here...';
    } else if (guiltyCount === 1) {
      flavorEl.textContent = `Only ${result.guiltyNames[0]} has done this. All eyes on you!`;
    } else {
      flavorEl.textContent = `${guiltyCount} out of ${total} have done this!`;
    }
  }

  const promptEl = $('reveal-prompt');
  if (promptEl) promptEl.textContent = `Never have I ever ${result.prompt}`;
}

$('btn-next-round')?.addEventListener('click', () => socket.emit('next-round'));

function renderFinal(players: PublicPlayer[], totalRounds: number): void {
  const sorted = [...players].sort((a, b) => b.totalIHave - a.totalIHave);
  const list = $('final-scoreboard');
  if (list) {
    list.innerHTML = sorted
      .map((p, i) => {
        let badge = '';
        if (i === 0) badge = '<span class="title-badge wild">The Wild One</span>';
        if (i === sorted.length - 1 && sorted.length > 1)
          badge = '<span class="title-badge pure">Pure Innocent</span>';
        return `<li class="score-row ${i === 0 ? 'winner' : ''}">
          <span class="rank">${i + 1}</span>
          ${playerAvatar(p)}
          <span class="score-name">${escHtml(p.name)} ${badge}</span>
          <span class="score-pts">${p.totalIHave} / ${totalRounds}</span>
        </li>`;
      })
      .join('');
  }

  const wildEl = $('wild-name');
  if (wildEl && sorted[0]) wildEl.textContent = sorted[0].name;
}

$('btn-play-again')?.addEventListener('click', () => socket.emit('play-again'));

function render(): void {
  if (!state) return;
  const isHost = state.myId === state.hostId;

  switch (state.state) {
    case 'lobby':
      showScreen('screen-lobby');
      const codeEl = $('lobby-code');
      if (codeEl) codeEl.textContent = state.code;
      const countEl = $('lobby-player-count');
      if (countEl) countEl.textContent = String(state.players.length);
      const listEl = $('lobby-player-list');
      if (listEl) {
        listEl.innerHTML = state.players
          .map(
            (p) =>
              `<li class="player-row">${playerAvatar(p)} <span>${escHtml(p.name)}</span>${
                p.id === state!.hostId ? '<span class="host-tag">Host</span>' : ''
              }</li>`
          )
          .join('');
      }

      if (isHost) {
        $('host-settings')?.classList.remove('hidden');
        $('host-start-area')?.classList.remove('hidden');
        $('guest-waiting')?.classList.add('hidden');
        const btn = $('btn-start-game') as HTMLButtonElement | null;
        if (btn) btn.disabled = state.players.length < 2;
        $('lobby-waiting-msg')?.classList.toggle('hidden', state.players.length >= 2);
      } else {
        $('host-settings')?.classList.add('hidden');
        $('host-start-area')?.classList.add('hidden');
        $('guest-waiting')?.classList.remove('hidden');
        $('lobby-waiting-msg')?.classList.add('hidden');
      }
      break;

    case 'answering': {
      showScreen('screen-round');
      const badge = $('round-badge');
      if (badge) badge.textContent = `Round ${state.currentRound} / ${state.totalRounds}`;
      const prompt = $('round-prompt');
      if (prompt) prompt.textContent = state.currentPrompt ?? '';

      $('btn-i-have')?.classList.remove('selected', 'faded');
      $('btn-never')?.classList.remove('selected', 'faded');
      $('answer-buttons-row')?.classList.remove('locked');
      $('answer-submitted')?.classList.add('hidden');

      const status = $('answer-status');
      if (status) status.textContent = `0 / ${state.players.length} answered`;
      break;
    }

    case 'reveal':
      showScreen('screen-reveal');
      const revBadge = $('reveal-round-badge');
      if (revBadge) revBadge.textContent = `Round ${state.currentRound} / ${state.totalRounds}`;
      if (state.roundResult) renderReveal(state.roundResult);

      if (isHost) {
        $('reveal-host-area')?.classList.remove('hidden');
        $('reveal-guest-area')?.classList.add('hidden');
        const btn = $('btn-next-round');
        if (btn) btn.textContent = state.currentRound >= state.totalRounds ? 'See Final Results' : 'Next Round';
      } else {
        $('reveal-host-area')?.classList.add('hidden');
        $('reveal-guest-area')?.classList.remove('hidden');
      }
      break;

    case 'finished':
      showScreen('screen-final');
      renderFinal(state.players, state.totalRounds);
      if (isHost) {
        $('final-host-area')?.classList.remove('hidden');
        $('final-guest-area')?.classList.add('hidden');
      } else {
        $('final-host-area')?.classList.add('hidden');
        $('final-guest-area')?.classList.remove('hidden');
      }
      break;
  }
}

socket.on('room-created', () => $('modal-name')?.classList.add('hidden'));

socket.on('state', (snap: GameSnapshot) => {
  const wasNull = state === null;
  state = snap;
  if (wasNull) $('modal-name')?.classList.add('hidden');
  render();
});

socket.on('answer-count', (data: { count: number; total: number }) => {
  const el = $('answer-status');
  if (el) el.textContent = `${data.count} / ${data.total} answered`;
});

socket.on('error-msg', (msg: string) => {
  const errEl = $('modal-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }
});

const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) {
  ($('input-join-code') as HTMLInputElement).value = urlCode.toUpperCase();
  $('btn-join')?.click();
}
