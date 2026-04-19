import { io, Socket } from 'socket.io-client';
import { GameSnapshot, RoundResult, PublicPlayer } from '../shared/types';

const socket: Socket = io('/vibe-check');

let state: GameSnapshot | null = null;
let pendingAction: 'create' | 'join' | null = null;
let joinCode = '';
let lastResult: RoundResult | null = null;

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
  ($('modal-name-title') as HTMLElement).textContent = 'Enter Your Name';
  ($('input-name') as HTMLInputElement).value = '';
  $('modal-name')?.classList.remove('hidden');
  ($('input-name') as HTMLInputElement).focus();
});

$('btn-join')?.addEventListener('click', () => {
  const code = ($('input-join-code') as HTMLInputElement).value.trim();
  if (!code) return;
  joinCode = code;
  pendingAction = 'join';
  ($('modal-name-title') as HTMLElement).textContent = 'Enter Your Name';
  ($('input-name') as HTMLInputElement).value = '';
  $('modal-name')?.classList.remove('hidden');
  ($('input-name') as HTMLInputElement).focus();
});

$('btn-name-confirm')?.addEventListener('click', submitName);
$('input-name')?.addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') submitName();
});

$('input-join-code')?.addEventListener('keydown', (e) => {
  if ((e as KeyboardEvent).key === 'Enter') $('btn-join')?.click();
});

function submitName(): void {
  const name = ($('input-name') as HTMLInputElement).value.trim();
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
  const url = `${window.location.origin}/vibe-check?code=${state.code}`;
  navigator.clipboard.writeText(url).catch(() => {});
  const btn = $('btn-copy-link');
  if (btn) {
    btn.textContent = 'Copied!';
    setTimeout(() => (btn.textContent = 'Copy Link'), 1500);
  }
});

$('btn-start-game')?.addEventListener('click', () => {
  socket.emit('start-game');
});

$('setting-rounds')?.addEventListener('change', (e) => {
  const val = parseInt((e.target as HTMLSelectElement).value, 10);
  socket.emit('update-settings', { totalRounds: val });
});

function buildAnswerButtons(): void {
  const container = $('answer-buttons');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn-answer';
    btn.textContent = String(i);
    btn.addEventListener('click', () => {
      socket.emit('submit-answer', i);
      container.querySelectorAll('.btn-answer').forEach((b) =>
        b.classList.remove('selected')
      );
      btn.classList.add('selected');
      $('answer-submitted')?.classList.remove('hidden');
      container.classList.add('locked');
    });
    container.appendChild(btn);
  }
}

function renderReveal(result: RoundResult): void {
  const numberLine = $('number-line');
  if (numberLine) {
    numberLine.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.textContent = String(i);
      numberLine.appendChild(tick);
    }

    const avgMarker = document.createElement('div');
    avgMarker.className = 'avg-marker';
    avgMarker.style.left = `${((result.average - 1) / 9) * 100}%`;
    avgMarker.textContent = `avg: ${result.average}`;
    numberLine.appendChild(avgMarker);

    for (const a of result.answers) {
      const dot = document.createElement('div');
      dot.className = `answer-dot pcolor-${a.player.color}${a.player.id === result.outlierId ? ' outlier-dot' : ''}`;
      dot.style.left = `${((a.answer - 1) / 9) * 100}%`;
      dot.textContent = a.player.name.charAt(0).toUpperCase();
      dot.title = `${a.player.name}: ${a.answer}`;
      numberLine.appendChild(dot);
    }
  }

  const table = $('reveal-table');
  if (table) {
    const sorted = [...result.answers].sort(
      (a, b) => (result.pointsAwarded[b.player.id] ?? 0) - (result.pointsAwarded[a.player.id] ?? 0)
    );
    table.innerHTML = sorted
      .map((a) => {
        const pts = result.pointsAwarded[a.player.id] ?? 0;
        const isOutlier = a.player.id === result.outlierId;
        return `<tr class="${isOutlier ? 'outlier-row' : ''}">
          <td>${playerAvatar(a.player)} <span>${escHtml(a.player.name)}</span></td>
          <td class="answer-cell">${a.answer}</td>
          <td class="pts-cell">+${pts}</td>
        </tr>`;
      })
      .join('');
  }

  const outlierMsg = $('outlier-msg');
  if (outlierMsg) {
    outlierMsg.innerHTML = `<strong>${escHtml(result.outlierName)}</strong> is the outlier! Defend your answer!`;
  }
}

$('btn-next-round')?.addEventListener('click', () => {
  socket.emit('next-round');
});

function renderFinal(players: PublicPlayer[]): void {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const list = $('final-scoreboard');
  if (list) {
    list.innerHTML = sorted
      .map(
        (p, i) =>
          `<li class="score-row ${i === 0 ? 'winner' : ''}">
            <span class="rank">${i + 1}</span>
            ${playerAvatar(p)}
            <span class="score-name">${escHtml(p.name)}</span>
            <span class="score-pts">${p.score} pts</span>
          </li>`
      )
      .join('');
  }

  const winnerEl = $('winner-name');
  if (winnerEl && sorted[0]) {
    winnerEl.textContent = sorted[0].name;
  }
}

$('btn-play-again')?.addEventListener('click', () => {
  socket.emit('play-again');
});

function render(): void {
  if (!state) return;

  const isHost = state.myId === state.hostId;

  switch (state.state) {
    case 'lobby':
      showScreen('screen-lobby');
      ($('lobby-code') as HTMLElement).textContent = state.code;
      ($('lobby-player-count') as HTMLElement).textContent = String(state.players.length);
      ($('lobby-player-list') as HTMLElement).innerHTML = state.players
        .map(
          (p) =>
            `<li class="player-row">${playerAvatar(p)} <span>${escHtml(p.name)}</span>${
              p.id === state!.hostId ? '<span class="host-tag">Host</span>' : ''
            }</li>`
        )
        .join('');

      if (isHost) {
        $('host-settings')?.classList.remove('hidden');
        $('host-start-area')?.classList.remove('hidden');
        $('guest-waiting')?.classList.add('hidden');
        const startBtn = $('btn-start-game') as HTMLButtonElement;
        if (startBtn) startBtn.disabled = state.players.length < 2;
        ($('lobby-waiting-msg') as HTMLElement)?.classList.toggle(
          'hidden',
          state.players.length >= 2
        );
      } else {
        $('host-settings')?.classList.add('hidden');
        $('host-start-area')?.classList.add('hidden');
        $('guest-waiting')?.classList.remove('hidden');
        ($('lobby-waiting-msg') as HTMLElement)?.classList.add('hidden');
      }
      break;

    case 'answering':
      showScreen('screen-round');
      ($('round-badge') as HTMLElement).textContent = `Round ${state.currentRound} / ${state.totalRounds}`;
      ($('round-prompt') as HTMLElement).textContent = state.currentPrompt ?? '';
      $('answer-submitted')?.classList.add('hidden');
      const container = $('answer-buttons');
      if (container) container.classList.remove('locked');
      buildAnswerButtons();
      ($('answer-status') as HTMLElement).textContent = `0 / ${state.players.length} answered`;
      break;

    case 'reveal':
      showScreen('screen-reveal');
      ($('reveal-round-badge') as HTMLElement).textContent = `Round ${state.currentRound} / ${state.totalRounds}`;
      if (state.roundResult) {
        lastResult = state.roundResult;
        renderReveal(state.roundResult);
      }
      if (isHost) {
        $('reveal-host-area')?.classList.remove('hidden');
        $('reveal-guest-area')?.classList.add('hidden');
        const btnText = state.currentRound >= state.totalRounds ? 'See Final Results' : 'Next Round';
        ($('btn-next-round') as HTMLElement).textContent = btnText;
      } else {
        $('reveal-host-area')?.classList.add('hidden');
        $('reveal-guest-area')?.classList.remove('hidden');
      }
      break;

    case 'finished':
      showScreen('screen-final');
      renderFinal(state.players);
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

socket.on('room-created', () => {
  $('modal-name')?.classList.add('hidden');
});

socket.on('state', (snap: GameSnapshot) => {
  const wasNull = state === null;
  state = snap;
  if (wasNull) {
    $('modal-name')?.classList.add('hidden');
  }
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
