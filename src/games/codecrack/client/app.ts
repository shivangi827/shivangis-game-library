import { Question, Difficulty, DIFFICULTY_LABELS, DIFFICULTY_POINTS, TYPE_LABELS } from '../shared/types';
import { questions } from '../shared/questions';

type TimeMode = 120 | 180 | 300;

interface LeaderboardEntry {
  name: string;
  score: number;
  correct: number;
  total: number;
  streak: number;
  date: string;
}

interface GameState {
  difficulty: Difficulty;
  timeMode: TimeMode;
  questions: Question[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  correct: number;
  total: number;
  timeLeft: number;
  timerInterval: number | null;
  answered: boolean;
}

const STORAGE_KEY = 'codecrack.leaderboard';
const NAME_KEY = 'codecrack.name';
const MAX_ENTRIES = 10;
let useApi = false;

let activeDifficulty: Difficulty = 'easy';
let activeLbTab: TimeMode = 120;
let state: GameState;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPool(diff: Difficulty): Question[] {
  return shuffle(questions.filter(q => q.difficulty === diff));
}

function getSavedName(): string {
  return localStorage.getItem(NAME_KEY) || '';
}

function saveName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}

function lbKey(diff: Difficulty, time: TimeMode): string {
  return `${diff}-${time}`;
}

function getLocalScores(diff: Difficulty, time: TimeMode): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const lb = JSON.parse(raw);
      return lb[lbKey(diff, time)] || [];
    }
  } catch { /* ignore */ }
  return [];
}

function addLocalScore(diff: Difficulty, time: TimeMode, entry: LeaderboardEntry) {
  let lb: Record<string, LeaderboardEntry[]>;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    lb = raw ? JSON.parse(raw) : {};
  } catch {
    lb = {};
  }
  const key = lbKey(diff, time);
  if (!lb[key]) lb[key] = [];
  lb[key].push(entry);
  lb[key].sort((a, b) => b.score - a.score);
  lb[key] = lb[key].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
}

function cacheScores(diff: Difficulty, time: TimeMode, scores: LeaderboardEntry[]) {
  let lb: Record<string, LeaderboardEntry[]>;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    lb = raw ? JSON.parse(raw) : {};
  } catch {
    lb = {};
  }
  lb[lbKey(diff, time)] = scores.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lb));
}

async function checkApi() {
  try {
    const res = await fetch('/api/codecrack/configured');
    const data = await res.json();
    useApi = data.configured === true;
  } catch {
    useApi = false;
  }
}

async function fetchScores(diff: Difficulty, time: TimeMode): Promise<LeaderboardEntry[]> {
  if (!useApi) return getLocalScores(diff, time);
  try {
    const res = await fetch(`/api/codecrack/scores/${diff}/${time}`);
    if (!res.ok) return getLocalScores(diff, time);
    const scores: LeaderboardEntry[] = await res.json();
    cacheScores(diff, time, scores);
    return scores;
  } catch {
    return getLocalScores(diff, time);
  }
}

async function submitScore(diff: Difficulty, time: TimeMode, entry: LeaderboardEntry): Promise<void> {
  addLocalScore(diff, time, entry);
  if (!useApi) return;
  try {
    await fetch('/api/codecrack/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: diff, timeMode: time, ...entry }),
    });
  } catch { /* saved locally at least */ }
}

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const screenHome = $('screen-home');
const screenGame = $('screen-game');
const screenOver = $('screen-over');

const diffBtns = document.querySelectorAll<HTMLButtonElement>('.diff-btn');
const btn120 = $('btn-120');
const btn180 = $('btn-180');
const btn300 = $('btn-300');

const homeTabs = document.querySelectorAll<HTMLButtonElement>('.lb-tab');
const homeLbList = $('home-lb-list');
const homeLbEmpty = $('home-lb-empty');

const gameCountdown = $('game-countdown');
const countdownFill = $('countdown-fill');
const gameScore = $('game-score');
const gameStreak = $('game-streak');
const gameCorrect = $('game-correct');
const gameDiffLabel = $('game-diff-label');

const qType = $('question-type');
const qPrompt = $('question-prompt');
const codeBlock = $('code-block');
const codeContent = $('code-content');
const optionBtns = document.querySelectorAll<HTMLButtonElement>('.option-btn');
const explanationEl = $('explanation');

const modalName = $('modal-name');
const nameInput = $<HTMLInputElement>('input-name');
const btnNameConfirm = $('btn-name-confirm');

const overScore = $('over-score');
const overCorrect = $('over-correct');
const overAccuracy = $('over-accuracy');
const overStreak = $('over-streak');
const overNewBest = $('over-new-best');
const overLbList = $('over-lb-list');
const btnPlayAgain = $('btn-play-again');

function escapeHtml(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showScreen(screen: HTMLElement) {
  [screenHome, screenGame, screenOver].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function selectDifficulty(diff: Difficulty) {
  activeDifficulty = diff;
  diffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === diff));
  renderHomeLb(activeLbTab);
}

function renderLbEntries(target: HTMLElement, scores: LeaderboardEntry[], highlight?: LeaderboardEntry) {
  target.innerHTML = scores.map((s, i) => {
    const isCurrent = highlight &&
      s.score === highlight.score &&
      s.correct === highlight.correct &&
      s.name === highlight.name &&
      s.date === highlight.date;
    return `<li class="lb-entry ${i === 0 ? 'lb-gold' : ''} ${isCurrent ? 'lb-current' : ''}">
      <span class="lb-rank">${i + 1}</span>
      <span class="lb-name">${escapeHtml(s.name || 'Anonymous')}</span>
      <span class="lb-score">${s.score}</span>
      <span class="lb-detail">${s.correct}/${s.total}</span>
      <span class="lb-date">${s.date}</span>
    </li>`;
  }).join('');
}

async function renderHomeLb(time: TimeMode) {
  activeLbTab = time;
  homeTabs.forEach(tab => tab.classList.toggle('active', Number(tab.dataset.mode) === time));
  const scores = await fetchScores(activeDifficulty, time);
  if (scores.length === 0) {
    homeLbList.innerHTML = '';
    homeLbEmpty.classList.remove('hidden');
    return;
  }
  homeLbEmpty.classList.add('hidden');
  renderLbEntries(homeLbList, scores);
}

function promptName(cb: () => void) {
  const saved = getSavedName();
  if (saved) nameInput.value = saved;
  modalName.classList.remove('hidden');
  nameInput.focus();

  function confirm() {
    const name = nameInput.value.trim();
    if (!name) return;
    saveName(name);
    modalName.classList.add('hidden');
    btnNameConfirm.removeEventListener('click', confirm);
    nameInput.removeEventListener('keydown', onKey);
    cb();
  }
  function onKey(e: KeyboardEvent) { if (e.key === 'Enter') confirm(); }
  btnNameConfirm.addEventListener('click', confirm);
  nameInput.addEventListener('keydown', onKey);
}

function startGame(timeMode: TimeMode) {
  state = {
    difficulty: activeDifficulty,
    timeMode,
    questions: getPool(activeDifficulty),
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    total: 0,
    timeLeft: timeMode,
    timerInterval: null,
    answered: false,
  };
  if (gameDiffLabel) gameDiffLabel.textContent = DIFFICULTY_LABELS[activeDifficulty];
  showScreen(screenGame);
  loadQuestion();
  startCountdown();
}

function handleTimeSelect(timeMode: TimeMode) {
  const saved = getSavedName();
  if (saved) startGame(timeMode);
  else promptName(() => startGame(timeMode));
}

function loadQuestion() {
  if (state.currentIndex >= state.questions.length) {
    state.questions = shuffle([...state.questions]);
    state.currentIndex = 0;
  }

  const q = state.questions[state.currentIndex];
  state.answered = false;

  qType.textContent = TYPE_LABELS[q.type];
  qType.className = `question-type type-${q.type}`;
  qPrompt.textContent = q.prompt;

  if (q.code) {
    codeBlock.classList.remove('hidden');
    codeContent.textContent = q.code;
  } else {
    codeBlock.classList.add('hidden');
  }

  const labels = ['A', 'B', 'C', 'D'];
  optionBtns.forEach((btn, i) => {
    btn.className = 'option-btn';
    btn.disabled = false;
    btn.innerHTML = `<span class="option-label">${labels[i]}</span><span class="option-text">${escapeHtml(q.options[i])}</span>`;
  });

  explanationEl.classList.add('hidden');
  explanationEl.textContent = '';
  updateUI();
}

function selectOption(index: number) {
  if (!state || state.answered || !state.timerInterval) return;
  state.answered = true;
  state.total++;

  const q = state.questions[state.currentIndex];
  const isCorrect = index === q.answer;

  if (isCorrect) {
    const mult = 1 + Math.floor(state.streak / 3) * 0.25;
    const pts = Math.round(DIFFICULTY_POINTS[q.difficulty] * mult);
    state.score += pts;
    state.streak++;
    state.correct++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.streak = 0;
  }

  optionBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('correct');
    if (i === index && !isCorrect) btn.classList.add('wrong');
  });

  explanationEl.textContent = q.explanation;
  explanationEl.classList.remove('hidden');
  explanationEl.className = `explanation ${isCorrect ? 'explanation-correct' : 'explanation-wrong'}`;
  updateUI();

  setTimeout(() => {
    if (!state.timerInterval) return;
    state.currentIndex++;
    loadQuestion();
  }, isCorrect ? 1800 : 2500);
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
    countdownFill.style.width = `${(state.timeLeft / total) * 100}%`;
    countdownFill.classList.toggle('timer-danger', state.timeLeft <= 10);
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    gameCountdown.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    if (state.timeLeft <= 0) endGame();
  }, 1000);

  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;
  gameCountdown.textContent = `${m}:${s.toString().padStart(2, '0')}`;
}

async function endGame() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  const name = getSavedName() || 'Anonymous';
  const entry: LeaderboardEntry = {
    name,
    score: state.score,
    correct: state.correct,
    total: state.total,
    streak: state.bestStreak,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };

  const prev = await fetchScores(state.difficulty, state.timeMode);
  const prevBest = prev.length > 0 ? prev[0].score : 0;
  const isNewBest = state.score > prevBest && state.score > 0;

  await submitScore(state.difficulty, state.timeMode, entry);

  overScore.textContent = `${state.score}`;
  overCorrect.textContent = `${state.correct}/${state.total}`;
  overAccuracy.textContent = state.total > 0 ? `${Math.round((state.correct / state.total) * 100)}%` : '0%';
  overStreak.textContent = `${state.bestStreak}`;
  overNewBest.classList.toggle('hidden', !isNewBest);

  const scores = await fetchScores(state.difficulty, state.timeMode);
  renderLbEntries(overLbList, scores, entry);
  showScreen(screenOver);
}

function updateUI() {
  gameScore.textContent = `${state.score}`;
  gameStreak.textContent = `${state.streak}`;
  gameCorrect.textContent = `${state.correct}`;
}

function isGameActive(): boolean {
  return !!state && state.timerInterval !== null && !screenGame.classList.contains('hidden');
}

document.addEventListener('keydown', (e) => {
  if (!isGameActive() || state.answered) return;
  const key = parseInt(e.key);
  if (key >= 1 && key <= 4) {
    e.preventDefault();
    selectOption(key - 1);
  }
});

optionBtns.forEach((btn, i) => btn.addEventListener('click', () => selectOption(i)));

btn120.addEventListener('click', () => handleTimeSelect(120));
btn180.addEventListener('click', () => handleTimeSelect(180));
btn300.addEventListener('click', () => handleTimeSelect(300));

btnPlayAgain.addEventListener('click', () => {
  renderHomeLb(activeLbTab);
  showScreen(screenHome);
});

homeTabs.forEach(tab => {
  tab.addEventListener('click', () => renderHomeLb(Number(tab.dataset.mode) as TimeMode));
});

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => selectDifficulty(btn.dataset.diff as Difficulty));
});

checkApi().then(() => {
  selectDifficulty('easy');
});
