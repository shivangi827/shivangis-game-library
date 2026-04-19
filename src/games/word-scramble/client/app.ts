import { wordsByDifficulty, Difficulty, Word } from '../shared/words';

interface GameState {
  difficulty: Difficulty;
  words: Word[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  lives: number;
  maxLives: number;
  timeLeft: number;
  timerInterval: number | null;
  scrambled: string;
  hintRevealed: boolean;
  gameOver: boolean;
}

const ROUND_TIME: Record<Difficulty, number> = {
  easy: 25,
  medium: 20,
  hard: 18,
};

const MAX_LIVES = 3;

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

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const screenHome = $('screen-home');
const screenGame = $('screen-game');
const screenOver = $('screen-over');

const btnEasy = $('btn-easy');
const btnMedium = $('btn-medium');
const btnHard = $('btn-hard');

const gameScrambled = $('game-scrambled');
const gameInput = $<HTMLInputElement>('game-input');
const gameHint = $('game-hint');
const btnHint = $('btn-hint');
const gameTimer = $('game-timer');
const timerFill = $('timer-fill');
const gameScore = $('game-score');
const gameStreak = $('game-streak');
const gameLives = $('game-lives');
const gameProgress = $('game-progress');
const gameFeedback = $('game-feedback');
const btnSkip = $('btn-skip');

const overTitle = $('over-title');
const overScore = $('over-score');
const overStreak = $('over-streak');
const overWords = $('over-words');
const btnPlayAgain = $('btn-play-again');
const overWordsCompleted = $('over-words-completed');

let state: GameState;

function showScreen(screen: HTMLElement) {
  [screenHome, screenGame, screenOver].forEach(s => s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function startGame(difficulty: Difficulty) {
  const allWords = shuffle(wordsByDifficulty[difficulty]);
  state = {
    difficulty,
    words: allWords,
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    timeLeft: ROUND_TIME[difficulty],
    timerInterval: null,
    scrambled: '',
    hintRevealed: false,
    gameOver: false,
  };
  showScreen(screenGame);
  loadWord();
}

function loadWord() {
  if (state.currentIndex >= state.words.length || state.lives <= 0) {
    endGame();
    return;
  }

  const word = state.words[state.currentIndex];
  state.scrambled = scrambleWord(word.word);
  state.hintRevealed = false;
  state.timeLeft = ROUND_TIME[state.difficulty];

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
  startTimer();
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  const total = ROUND_TIME[state.difficulty];
  timerFill.style.transition = 'none';
  timerFill.style.width = '100%';
  void timerFill.offsetWidth;
  timerFill.style.transition = `width 1s linear`;

  state.timerInterval = window.setInterval(() => {
    state.timeLeft--;
    const pct = (state.timeLeft / total) * 100;
    timerFill.style.width = `${pct}%`;

    if (state.timeLeft <= 5) {
      timerFill.classList.add('timer-danger');
    } else {
      timerFill.classList.remove('timer-danger');
    }

    gameTimer.textContent = `${state.timeLeft}s`;

    if (state.timeLeft <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function handleTimeout() {
  stopTimer();
  state.lives--;
  state.streak = 0;
  const word = state.words[state.currentIndex];

  gameInput.disabled = true;
  gameFeedback.textContent = `Time's up! The word was "${word.word}"`;
  gameFeedback.className = 'feedback feedback-wrong';
  gameScrambled.classList.add('wrong-flash');

  updateUI();

  setTimeout(() => {
    state.currentIndex++;
    loadWord();
  }, 2000);
}

function checkAnswer() {
  const guess = gameInput.value.trim().toLowerCase();
  const word = state.words[state.currentIndex];

  if (!guess) return;

  if (guess === word.word.toLowerCase()) {
    stopTimer();
    const timeBonus = state.timeLeft * 10;
    const streakMultiplier = 1 + Math.floor(state.streak / 3) * 0.5;
    const points = Math.round((100 + timeBonus) * streakMultiplier);

    state.score += points;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

    gameInput.disabled = true;
    gameFeedback.textContent = `+${points} points!`;
    gameFeedback.className = 'feedback feedback-correct';
    gameScrambled.classList.add('correct-flash');

    if (state.streak > 0 && state.streak % 3 === 0) {
      gameFeedback.textContent += ` ${streakMultiplier + 0.5}x streak!`;
    }

    updateUI();

    setTimeout(() => {
      state.currentIndex++;
      loadWord();
    }, 1200);
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
  state.score = Math.max(0, state.score - 25);
  updateUI();
}

function skipWord() {
  stopTimer();
  state.lives--;
  state.streak = 0;
  const word = state.words[state.currentIndex];

  gameInput.disabled = true;
  gameFeedback.textContent = `Skipped! The word was "${word.word}"`;
  gameFeedback.className = 'feedback feedback-skip';
  gameScrambled.classList.add('wrong-flash');

  updateUI();

  setTimeout(() => {
    state.currentIndex++;
    loadWord();
  }, 1800);
}

function updateUI() {
  gameScore.textContent = `${state.score}`;
  gameStreak.textContent = `${state.streak}`;
  gameTimer.textContent = `${state.timeLeft}s`;
  gameProgress.textContent = `${state.currentIndex + 1} / ${state.words.length}`;

  let hearts = '';
  for (let i = 0; i < state.maxLives; i++) {
    hearts += i < state.lives ? '<span class="life life-full"></span>' : '<span class="life life-empty"></span>';
  }
  gameLives.innerHTML = hearts;
}

function endGame() {
  stopTimer();
  state.gameOver = true;
  showScreen(screenOver);

  const wordsCompleted = state.currentIndex;
  const totalWords = state.words.length;

  if (state.lives <= 0) {
    overTitle.textContent = 'Game Over';
  } else {
    overTitle.textContent = 'All Words Complete!';
  }

  overScore.textContent = `${state.score}`;
  overStreak.textContent = `${state.bestStreak}`;
  overWordsCompleted.textContent = `${wordsCompleted} / ${totalWords}`;

  const missed: string[] = [];
  for (let i = Math.max(0, state.currentIndex - 5); i <= state.currentIndex && i < state.words.length; i++) {
    missed.push(state.words[i].word);
  }

  overWords.innerHTML = '';
  const recentWords = state.words.slice(0, state.currentIndex);
  recentWords.forEach(w => {
    const li = document.createElement('li');
    li.textContent = w.word;
    overWords.appendChild(li);
  });
}

gameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkAnswer();
});

btnHint.addEventListener('click', revealHint);
btnSkip.addEventListener('click', skipWord);

btnEasy.addEventListener('click', () => startGame('easy'));
btnMedium.addEventListener('click', () => startGame('medium'));
btnHard.addEventListener('click', () => startGame('hard'));
btnPlayAgain.addEventListener('click', () => showScreen(screenHome));
