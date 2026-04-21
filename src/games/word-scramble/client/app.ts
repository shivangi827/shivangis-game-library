import { GameMode, TimeMode, wordsByMode, MODE_LABELS, Word } from '../shared/words';

interface LeaderboardEntry {
  name: string;
  score: number;
  words: number;
  streak: number;
  date: string;
}

interface GameState {
  gameMode: GameMode;
  timeMode: TimeMode;
  words: Word[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  wordsCompleted: number;
  timeLeft: number;
  timerInterval: number | null;
  scrambled: string;
  hintRevealed: boolean;
}

const STORAGE_KEY = 'gramble.leaderboard';
const NAME_KEY = 'gramble.name';
const MIGRATED_KEY = 'gramble.migrated_v2';
const MAX_ENTRIES = 10;
const HINT_PENALTY = 25;
let useApi = false;

let activeGameMode: GameMode = 'regular';
let activeLbTab: TimeMode = 60;

function migrateLocalScores() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { localStorage.setItem(MIGRATED_KEY, '1'); return; }
    const lb = JSON.parse(raw);
    let changed = false;
    for (const oldKey of ['60', '90', '120']) {
      if (lb[oldKey] && !lb[`regular-${oldKey}`]) {
        lb[`regular-${oldKey}`] = lb[oldKey];
        changed = true;
      }
    }
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
  } catch { /* ignore */ }
  localStorage.setItem(MIGRATED_KEY, '1');
}

async function checkApi() {
  try {
    const res = await fetch('/api/gramble/configured');
    const data = await res.json();
    useApi = data.configured === true;
  } catch {
    useApi = false;
  }
}

function lbKey(gameMode: GameMode, timeMode: TimeMode): string {
  return `${gameMode}-${timeMode}`;
}

async function fetchScores(gameMode: GameMode, timeMode: TimeMode): Promise<LeaderboardEntry[]> {
  if (!useApi) return getLocalScores(gameMode, timeMode);

  try {
    const res = await fetch(`/api/gramble/scores/${gameMode}/${timeMode}`);
    if (!res.ok) return getLocalScores(gameMode, timeMode);
    const scores: LeaderboardEntry[] = await res.json();
    cacheScores(gameMode, timeMode, scores);
    return scores;
  } catch {
    return getLocalScores(gameMode, timeMode);
  }
}

async function submitScore(gameMode: GameMode, timeMode: TimeMode, entry: LeaderboardEntry): Promise<void> {
  addLocalScore(gameMode, timeMode, entry);

  if (!useApi) return;

  try {
    await fetch('/api/gramble/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameMode, timeMode, ...entry }),
    });
  } catch { /* score saved locally at least */ }
}

function getLocalScores(gameMode: GameMode, timeMode: TimeMode): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const lb = JSON.parse(raw);
      return lb[lbKey(gameMode, timeMode)] || [];
    }
  } catch { /* ignore */ }
  return [];
}

function addLocalScore(gameMode: GameMode, timeMode: TimeMode, entry: LeaderboardEntry) {
  let lb: Record<string, LeaderboardEntry[]>;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    lb = raw ? JSON.parse(raw) : {};
  } catch {
    lb = {};
  }
  const key = lbKey(gameMode, timeMode);
  if (!lb[key]) lb[key] = [];
  lb[key].push(entry);
  lb[key].sort((a, b) => b.score - a.score);
  lb[key] = lb[key].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
}

function cacheScores(gameMode: GameMode, timeMode: TimeMode, scores: LeaderboardEntry[]) {
  let lb: Record<string, LeaderboardEntry[]>;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    lb = raw ? JSON.parse(raw) : {};
  } catch {
    lb = {};
  }
  lb[lbKey(gameMode, timeMode)] = scores.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrambleWord(word: string): string {
  const letters = word.split('');
  let scrambled: string;
  let attempts = 0;
  do {
    scrambled = shuffle(letters).join('');
    attempts++;
  } while (scrambled === word && attempts < 20);
  return scrambled;
}

function isValidAnswer(guess: string, word: Word): boolean {
  const lower = guess.toLowerCase();
  if (lower === word.word.toLowerCase()) return true;
  if (word.alts && word.alts.some(a => a.toLowerCase() === lower)) return true;
  return false;
}

function getSavedName(): string {
  return localStorage.getItem(NAME_KEY) || '';
}

function saveName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const screenHome = $('screen-home');
const screenGame = $('screen-game');
const screenOver = $('screen-over');

const modeBtns = document.querySelectorAll<HTMLButtonElement>('.mode-btn');
const btn60 = $('btn-60');
const btn90 = $('btn-90');
const btn120 = $('btn-120');

const homeTabs = document.querySelectorAll<HTMLButtonElement>('.lb-tab');
const homeLbList = $('home-lb-list');
const homeLbEmpty = $('home-lb-empty');

const gameScrambled = $('game-scrambled');
const gameInput = $<HTMLInputElement>('game-input');
const gameHint = $('game-hint');
const btnHint = $('btn-hint');
const gameCountdown = $('game-countdown');
const countdownFill = $('countdown-fill');
const gameScore = $('game-score');
const gameStreak = $('game-streak');
const gameWords = $('game-words');
const gameFeedback = $('game-feedback');
const btnSkip = $('btn-skip');
const gameModeLabel = $('game-mode-label');

const modalName = $('modal-name');
const nameInput = $<HTMLInputElement>('input-name');
const btnNameConfirm = $('btn-name-confirm');

const overTitle = $('over-title');
const overScore = $('over-score');
const overStreak = $('over-streak');
const overWordsCount = $('over-words-count');
const overLbList = $('over-lb-list');
const overNewBest = $('over-new-best');
const btnPlayAgain = $('btn-play-again');

let state: GameState;

const MODE_FLOATERS: Record<GameMode, string[]> = {
  regular: ['\u{1F343}', '\u{1F33F}', '\u{1F340}', '\u{1F343}', '\u{1F33F}', '\u{1F340}', '\u{1F343}', '\u{1F33F}', '\u{1F340}', '\u{1F343}', '\u{1F33F}', '\u{1F340}'],
  french:  ['\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}', '\u{1F1EB}\u{1F1F7}'],
  dev:     ['\u{1F4BB}', '\u{2328}\u{FE0F}', '\u{1F41B}', '\u{1F4BB}', '\u{2328}\u{FE0F}', '\u{1F41B}', '\u{1F4BB}', '\u{2328}\u{FE0F}', '\u{1F41B}', '\u{1F4BB}', '\u{2328}\u{FE0F}', '\u{1F41B}'],
};

const FLOATER_POSITIONS = [
  { left: '3%',  dur: '22s', delay: '0s',  size: '1.6rem' },
  { left: '10%', dur: '18s', delay: '4s',  size: '1.2rem' },
  { left: '18%', dur: '26s', delay: '1s',  size: '1.8rem' },
  { left: '26%', dur: '20s', delay: '6s',  size: '1.4rem' },
  { left: '34%', dur: '24s', delay: '3s',  size: '2rem' },
  { left: '42%', dur: '19s', delay: '8s',  size: '1.3rem' },
  { left: '50%', dur: '23s', delay: '2s',  size: '1.7rem' },
  { left: '58%', dur: '17s', delay: '5s',  size: '1.1rem' },
  { left: '66%', dur: '25s', delay: '0s',  size: '1.9rem' },
  { left: '74%', dur: '21s', delay: '7s',  size: '1.5rem' },
  { left: '82%', dur: '16s', delay: '3s',  size: '1.3rem' },
  { left: '90%', dur: '22s', delay: '9s',  size: '1.6rem' },
];

function updateFloaters(mode: GameMode) {
  const container = document.querySelector('.floating-bg');
  if (!container) return;
  const emojis = MODE_FLOATERS[mode];
  container.innerHTML = emojis.map((emoji, i) => {
    const p = FLOATER_POSITIONS[i];
    return `<span class="floater" style="left:${p.left};animation-duration:${p.dur};animation-delay:${p.delay};font-size:${p.size}">${emoji}</span>`;
  }).join('');
}

function applyModeTheme(mode: GameMode) {
  document.body.classList.remove('mode-regular', 'mode-french', 'mode-dev');
  document.body.classList.add(`mode-${mode}`);
  updateFloaters(mode);
}

function selectMode(mode: GameMode) {
  activeGameMode = mode;
  modeBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  applyModeTheme(mode);
  renderHomeLb(activeLbTab);
}

function showScreen(screen: HTMLElement) {
  [screenHome, screenGame, screenOver].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function escapeHtml(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderLbEntries(target: HTMLElement, scores: LeaderboardEntry[], highlightEntry?: LeaderboardEntry) {
  target.innerHTML = scores.map((s, i) => {
    const isCurrent = highlightEntry &&
      s.score === highlightEntry.score &&
      s.words === highlightEntry.words &&
      s.name === highlightEntry.name &&
      s.date === highlightEntry.date;
    return `
      <li class="lb-entry ${i === 0 ? 'lb-gold' : ''} ${isCurrent ? 'lb-current' : ''}">
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-name">${escapeHtml(s.name || 'Anonymous')}</span>
        <span class="lb-score">${s.score}</span>
        <span class="lb-detail">${s.words} words</span>
        <span class="lb-date">${s.date}</span>
      </li>
    `;
  }).join('');
}

async function renderHomeLb(mode: TimeMode) {
  activeLbTab = mode;
  homeTabs.forEach(tab => {
    tab.classList.toggle('active', Number(tab.dataset.mode) === mode);
  });

  const scores = await fetchScores(activeGameMode, mode);
  if (scores.length === 0) {
    homeLbList.innerHTML = '';
    homeLbEmpty.classList.remove('hidden');
    return;
  }

  homeLbEmpty.classList.add('hidden');
  renderLbEntries(homeLbList, scores);
}

function promptName(callback: () => void) {
  const saved = getSavedName();
  if (saved) {
    nameInput.value = saved;
  }
  modalName.classList.remove('hidden');
  nameInput.focus();

  function confirm() {
    const name = nameInput.value.trim();
    if (!name) return;
    saveName(name);
    modalName.classList.add('hidden');
    btnNameConfirm.removeEventListener('click', confirm);
    nameInput.removeEventListener('keydown', onKey);
    callback();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') confirm();
  }

  btnNameConfirm.addEventListener('click', confirm);
  nameInput.addEventListener('keydown', onKey);
}

function startGame(timeMode: TimeMode) {
  const pool = wordsByMode[activeGameMode];
  const shuffled = shuffle([...pool]);
  state = {
    gameMode: activeGameMode,
    timeMode,
    words: shuffled,
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    wordsCompleted: 0,
    timeLeft: timeMode,
    timerInterval: null,
    scrambled: '',
    hintRevealed: false,
  };
  applyModeTheme(activeGameMode);
  if (gameModeLabel) gameModeLabel.textContent = MODE_LABELS[activeGameMode];
  showScreen(screenGame);
  loadWord();
  startCountdown();
}

function handleTimeSelect(timeMode: TimeMode) {
  const saved = getSavedName();
  if (saved) {
    startGame(timeMode);
  } else {
    promptName(() => startGame(timeMode));
  }
}

function loadWord() {
  const pool = wordsByMode[state.gameMode];
  if (state.currentIndex >= state.words.length) {
    state.words = shuffle([...pool]);
    state.currentIndex = 0;
  }

  const word = state.words[state.currentIndex];
  state.scrambled = scrambleWord(word.word);
  state.hintRevealed = false;

  gameScrambled.textContent = state.scrambled.toUpperCase();
  gameScrambled.classList.remove('correct-flash', 'wrong-flash');
  gameInput.value = '';
  gameInput.disabled = false;
  gameInput.focus();
  gameHint.textContent = '';
  gameHint.classList.add('hidden');
  btnHint.classList.remove('hidden');
  gameFeedback.textContent = '';
  gameFeedback.className = 'feedback';

  updateUI();
}

function startCountdown() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  const total = state.timeMode;
  countdownFill.style.transition = 'none';
  countdownFill.style.width = '100%';
  void countdownFill.offsetWidth;
  countdownFill.style.transition = 'width 1s linear';

  state.timerInterval = window.setInterval(() => {
    state.timeLeft--;
    const pct = (state.timeLeft / total) * 100;
    countdownFill.style.width = `${pct}%`;

    if (state.timeLeft <= 10) {
      countdownFill.classList.add('timer-danger');
    } else {
      countdownFill.classList.remove('timer-danger');
    }

    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    gameCountdown.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  gameCountdown.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function checkAnswer() {
  const guess = gameInput.value.trim().toLowerCase();
  const word = state.words[state.currentIndex];

  if (!guess) return;

  if (isValidAnswer(guess, word)) {
    const streakMultiplier = 1 + Math.floor(state.streak / 3) * 0.25;
    const points = Math.round(word.points * streakMultiplier);

    state.score += points;
    state.streak++;
    state.wordsCompleted++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

    gameInput.disabled = true;
    gameFeedback.textContent = `+${points}`;
    gameFeedback.className = 'feedback feedback-correct';
    gameScrambled.classList.add('correct-flash');

    if (state.streak > 0 && state.streak % 3 === 0) {
      gameFeedback.textContent += ` (${streakMultiplier + 0.25}x)`;
    }

    updateUI();

    setTimeout(() => {
      state.currentIndex++;
      loadWord();
    }, 600);
  } else {
    gameInput.classList.add('input-shake');
    setTimeout(() => gameInput.classList.remove('input-shake'), 400);
  }
}

function revealHint() {
  if (state.hintRevealed) return;
  state.hintRevealed = true;
  const word = state.words[state.currentIndex];

  state.score = Math.max(0, state.score - HINT_PENALTY);
  gameFeedback.textContent = `-${HINT_PENALTY}`;
  gameFeedback.className = 'feedback feedback-hint';
  updateUI();

  gameHint.textContent = word.hint;
  gameHint.classList.remove('hidden');
  btnHint.classList.add('hidden');
}

function skipWord() {
  state.streak = 0;
  const word = state.words[state.currentIndex];

  gameInput.disabled = true;
  gameFeedback.textContent = word.word;
  gameFeedback.className = 'feedback feedback-skip';
  gameScrambled.classList.add('wrong-flash');

  updateUI();

  setTimeout(() => {
    state.currentIndex++;
    loadWord();
  }, 800);
}

function updateUI() {
  gameScore.textContent = `${state.score}`;
  gameStreak.textContent = `${state.streak}`;
  gameWords.textContent = `${state.wordsCompleted}`;
}

async function endGame() {
  stopTimer();
  showScreen(screenOver);

  const playerName = getSavedName() || 'Anonymous';

  const entry: LeaderboardEntry = {
    name: playerName,
    score: state.score,
    words: state.wordsCompleted,
    streak: state.bestStreak,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };

  const prevScores = await fetchScores(state.gameMode, state.timeMode);
  const prevBest = prevScores.length > 0 ? prevScores[0].score : 0;
  const isNewBest = state.score > prevBest && state.score > 0;

  await submitScore(state.gameMode, state.timeMode, entry);

  overTitle.textContent = isNewBest ? 'New Record!' : 'Time\'s Up!';
  overScore.textContent = `${state.score}`;
  overStreak.textContent = `${state.bestStreak}`;
  overWordsCount.textContent = `${state.wordsCompleted}`;
  overNewBest.classList.toggle('hidden', !isNewBest);

  const scores = await fetchScores(state.gameMode, state.timeMode);
  renderLbEntries(overLbList, scores, entry);
}

function isGameActive(): boolean {
  return !!state && state.timerInterval !== null && !screenGame.classList.contains('hidden');
}

gameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkAnswer();
  if (e.key === 'Tab' && isGameActive()) {
    e.preventDefault();
    revealHint();
  }
  if (e.key === 'Escape' && isGameActive()) {
    e.preventDefault();
    skipWord();
  }
});

btnHint.addEventListener('click', revealHint);
btnSkip.addEventListener('click', skipWord);

btn60.addEventListener('click', () => handleTimeSelect(60));
btn90.addEventListener('click', () => handleTimeSelect(90));
btn120.addEventListener('click', () => handleTimeSelect(120));
btnPlayAgain.addEventListener('click', () => {
  applyModeTheme(activeGameMode);
  renderHomeLb(activeLbTab);
  showScreen(screenHome);
});

homeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    renderHomeLb(Number(tab.dataset.mode) as TimeMode);
  });
});

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    selectMode(btn.dataset.mode as GameMode);
  });
});

migrateLocalScores();
checkApi().then(() => {
  selectMode('regular');
});
