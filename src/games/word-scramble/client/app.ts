import { allWords, TimeMode, TIME_LABELS, Word } from '../shared/words';

interface LeaderboardEntry {
  score: number;
  words: number;
  streak: number;
  date: string;
}

type Leaderboard = Record<string, LeaderboardEntry[]>;

interface GameState {
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
  started: boolean;
}

const STORAGE_KEY = 'gramble.leaderboard';
const MAX_ENTRIES = 10;

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

function loadLeaderboard(): Leaderboard {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { '60': [], '90': [], '120': [] };
}

function saveLeaderboard(lb: Leaderboard) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
}

function addScore(timeMode: TimeMode, entry: LeaderboardEntry) {
  const lb = loadLeaderboard();
  const key = String(timeMode);
  if (!lb[key]) lb[key] = [];
  lb[key].push(entry);
  lb[key].sort((a, b) => b.score - a.score);
  lb[key] = lb[key].slice(0, MAX_ENTRIES);
  saveLeaderboard(lb);
}

function getScores(timeMode: TimeMode): LeaderboardEntry[] {
  const lb = loadLeaderboard();
  return lb[String(timeMode)] || [];
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const screenHome = $('screen-home');
const screenGame = $('screen-game');
const screenOver = $('screen-over');

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

const overTitle = $('over-title');
const overScore = $('over-score');
const overStreak = $('over-streak');
const overWordsCount = $('over-words-count');
const overLbList = $('over-lb-list');
const overNewBest = $('over-new-best');
const btnPlayAgain = $('btn-play-again');

let state: GameState;
let activeLbTab: TimeMode = 60;

function showScreen(screen: HTMLElement) {
  [screenHome, screenGame, screenOver].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function renderHomeLb(mode: TimeMode) {
  activeLbTab = mode;
  homeTabs.forEach(tab => {
    tab.classList.toggle('active', Number(tab.dataset.mode) === mode);
  });

  const scores = getScores(mode);
  if (scores.length === 0) {
    homeLbList.innerHTML = '';
    homeLbEmpty.classList.remove('hidden');
    return;
  }

  homeLbEmpty.classList.add('hidden');
  homeLbList.innerHTML = scores.map((s, i) => `
    <li class="lb-entry ${i === 0 ? 'lb-gold' : ''}">
      <span class="lb-rank">${i + 1}</span>
      <span class="lb-score">${s.score}</span>
      <span class="lb-detail">${s.words} words &middot; ${s.streak} best streak</span>
      <span class="lb-date">${s.date}</span>
    </li>
  `).join('');
}

function startGame(timeMode: TimeMode) {
  const shuffled = shuffle([...allWords]);
  state = {
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
    started: false,
  };
  showScreen(screenGame);
  loadWord();
  startCountdown();
}

function loadWord() {
  if (state.currentIndex >= state.words.length) {
    state.words = shuffle([...allWords]);
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

  if (guess === word.word.toLowerCase()) {
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

function endGame() {
  stopTimer();
  showScreen(screenOver);

  const entry: LeaderboardEntry = {
    score: state.score,
    words: state.wordsCompleted,
    streak: state.bestStreak,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };

  const prevScores = getScores(state.timeMode);
  const prevBest = prevScores.length > 0 ? prevScores[0].score : 0;
  const isNewBest = state.score > prevBest && state.score > 0;

  addScore(state.timeMode, entry);

  overTitle.textContent = isNewBest ? 'New Record!' : 'Time\'s Up!';
  overScore.textContent = `${state.score}`;
  overStreak.textContent = `${state.bestStreak}`;
  overWordsCount.textContent = `${state.wordsCompleted}`;
  overNewBest.classList.toggle('hidden', !isNewBest);

  const scores = getScores(state.timeMode);
  overLbList.innerHTML = scores.map((s, i) => {
    const isCurrent = s.score === state.score && s.words === state.wordsCompleted && s.date === entry.date;
    return `
      <li class="lb-entry ${i === 0 ? 'lb-gold' : ''} ${isCurrent ? 'lb-current' : ''}">
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-score">${s.score}</span>
        <span class="lb-detail">${s.words} words</span>
        <span class="lb-date">${s.date}</span>
      </li>
    `;
  }).join('');
}

gameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkAnswer();
});

btnHint.addEventListener('click', revealHint);
btnSkip.addEventListener('click', skipWord);

btn60.addEventListener('click', () => startGame(60));
btn90.addEventListener('click', () => startGame(90));
btn120.addEventListener('click', () => startGame(120));
btnPlayAgain.addEventListener('click', () => {
  renderHomeLb(activeLbTab);
  showScreen(screenHome);
});

homeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    renderHomeLb(Number(tab.dataset.mode) as TimeMode);
  });
});

renderHomeLb(60);
