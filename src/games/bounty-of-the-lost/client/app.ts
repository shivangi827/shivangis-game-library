import { GameState, GamePhase, Room, CombatState, Player, RunResult, SaveData } from '../shared/types';
import { generateDungeon, GRID_SIZE, HUB_POS, DIRS, inBounds, dateSeed } from '../shared/data';

const STORAGE_KEY = 'bounty.save';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const screenTitle = $('screen-title');
const screenGame = $('screen-game');
const screenVictory = $('screen-victory');
const screenDefeat = $('screen-defeat');

const vignette = $('vignette');
const dailyDate = $('daily-date');
const dailyModifierEl = $('daily-modifier');
const prevRunEl = $('prev-run');
const streakDisplay = $('streak-display');
const btnEnter = $('btn-enter');

const hudHp = $('hud-hp');
const hudShards = $('hud-shards');
const hudGold = $('hud-gold');
const hudVision = $('hud-vision');
const dungeonGrid = $('dungeon-grid');
const gameLog = $('game-log');

const combatOverlay = $('combat-overlay');
const combatEnemyIcon = $('combat-enemy-icon');
const combatEnemyName = $('combat-enemy-name');
const combatEnemyHp = $('combat-enemy-hp');
const combatEnemyHpText = $('combat-enemy-hp-text');
const combatLog = $('combat-log');
const combatDice = $('combat-dice');
const combatActions = $('combat-actions');
const btnAttack = $('btn-attack');
const btnFlee = $('btn-flee');

const trapOverlay = $('trap-overlay');
const trapIcon = $('trap-icon');
const trapName = $('trap-name');
const trapDesc = $('trap-desc');
const trapDC = $('trap-dc');
const trapDice = $('trap-dice');
const trapActions = $('trap-actions');
const btnDisarm = $('btn-disarm');
const btnTakeDamage = $('btn-take-damage');

const treasureOverlay = $('treasure-overlay');
const treasureIcon = $('treasure-icon');
const treasureDesc = $('treasure-desc');
const treasureDetails = $('treasure-details');
const btnLoot = $('btn-loot');

const shardOverlay = $('shard-overlay');
const shardDebuffText = $('shard-debuff-text');
const shardCountText = $('shard-count-text');
const btnShardContinue = $('btn-shard-continue');

let state: GameState;

// ── Helpers ─────────────────────────────────────

function roll20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

function showScreen(s: HTMLElement) {
  [screenTitle, screenGame, screenVictory, screenDefeat].forEach(el => el.classList.add('hidden'));
  s.classList.remove('hidden');
}

function log(msg: string, cls = '') {
  const p = document.createElement('p');
  if (cls) p.className = cls;
  p.textContent = msg;
  gameLog.appendChild(p);
  gameLog.scrollTop = gameLog.scrollHeight;
}

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { runs: [], currentStreak: 0, bestStreak: 0, lastPlayedDate: '' };
}

function saveSave(data: SaveData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Title Screen ────────────────────────────────

function renderTitle() {
  const seed = dateSeed();
  const dungeon = generateDungeon(seed);

  dailyDate.textContent = `Daily Dungeon: ${seed}`;
  dailyModifierEl.textContent = `${dungeon.modifier.icon} ${dungeon.modifier.name} — ${dungeon.modifier.description}`;

  const save = loadSave();
  const todaysRun = save.runs.find(r => r.date === seed);

  if (todaysRun) {
    prevRunEl.classList.remove('hidden');
    const status = todaysRun.shardsExtracted > 0 ? 'Extracted' : 'Failed';
    prevRunEl.innerHTML = `<strong>Today's run:</strong> ${status} — ${todaysRun.shardsExtracted}/3 shards, ${todaysRun.gold} gold${todaysRun.perfectClear ? ' (PERFECT!)' : ''}`;
  } else {
    prevRunEl.classList.add('hidden');
  }

  if (save.currentStreak > 0) {
    streakDisplay.textContent = `Current streak: ${save.currentStreak} day${save.currentStreak > 1 ? 's' : ''} | Best: ${save.bestStreak}`;
  } else if (save.bestStreak > 0) {
    streakDisplay.textContent = `Best streak: ${save.bestStreak} day${save.bestStreak > 1 ? 's' : ''}`;
  } else {
    streakDisplay.textContent = '';
  }

  showScreen(screenTitle);
}

// ── Game Init ───────────────────────────────────

function startGame() {
  const seed = dateSeed();
  const dungeon = generateDungeon(seed);

  const modifier = dungeon.modifier;
  let maxHp = 20;
  let attack = 3;
  let visionRange = 2;

  if (modifier.id === 'cursed') { maxHp = 15; attack = 5; }
  if (modifier.id === 'twilight') { visionRange = 1; }

  state = {
    phase: 'exploring',
    grid: dungeon.grid,
    gridSize: GRID_SIZE,
    player: {
      hp: maxHp, maxHp, attack, visionRange,
      shardsCollected: 0, gold: 0, roomsExplored: 0, enemiesDefeated: 0,
    },
    playerPos: { ...HUB_POS },
    hubPos: { ...HUB_POS },
    shardPositions: dungeon.shardPositions,
    combat: null,
    activeTrap: null,
    activeTreasure: null,
    dailySeed: seed,
    dailyModifier: modifier,
    turnCount: 0,
    startTime: Date.now(),
    endTime: null,
  };

  state.grid[HUB_POS.row][HUB_POS.col].revealed = true;
  state.grid[HUB_POS.row][HUB_POS.col].visited = true;
  revealAround(HUB_POS.row, HUB_POS.col);

  vignette.className = 'vignette';
  gameLog.innerHTML = '';
  log('You enter the dungeon. Find the 3 Soul Shards and return here alive.', 'log-accent');
  log(`Today's modifier: ${modifier.icon} ${modifier.name} — ${modifier.description}`);

  showScreen(screenGame);
  renderGrid();
  updateHud();
}

// ── Grid Rendering ──────────────────────────────

function revealAround(row: number, col: number) {
  const range = state.player.visionRange;
  for (let dr = -range; dr <= range; dr++) {
    for (let dc = -range; dc <= range; dc++) {
      if (Math.abs(dr) + Math.abs(dc) > range) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (inBounds(nr, nc) && state.grid[nr][nc].type !== 'wall') {
        state.grid[nr][nc].revealed = true;
      }
    }
  }
}

function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function distanceFromPlayer(r: number, c: number): number {
  return Math.abs(r - state.playerPos.row) + Math.abs(c - state.playerPos.col);
}

function renderGrid() {
  dungeonGrid.innerHTML = '';
  const showHints = state.dailyModifier.id !== 'spectral';

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const room = state.grid[r][c];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);

      if (room.type === 'wall') {
        cell.classList.add('cell-wall');
      } else if (!room.revealed) {
        cell.classList.add('cell-fog');
      } else {
        cell.classList.add('cell-revealed');
        if (room.visited) cell.classList.add('cell-visited');

        const dist = distanceFromPlayer(r, c);
        if (dist > state.player.visionRange + 1) {
          cell.classList.add('cell-dim');
        }

        if (room.type === 'hub') {
          cell.classList.add('cell-hub');
          cell.innerHTML = '<span class="cell-icon">\u{1F3E0}</span>';
        } else if (room.type === 'shard' && room.enemy) {
          cell.classList.add('cell-shard');
          cell.innerHTML = '<span class="cell-icon">\u{1F48E}</span>';
        } else if (room.type === 'shard') {
          cell.classList.add('cell-shard');
          cell.innerHTML = '<span class="cell-icon">\u2728</span>';
        } else if (room.type === 'enemy' && room.enemy) {
          cell.classList.add('cell-enemy-room');
          cell.innerHTML = `<span class="cell-icon">${room.enemy.icon}</span>`;
        } else if (room.type === 'trap' && room.trap) {
          cell.classList.add('cell-trap-room');
          cell.innerHTML = `<span class="cell-icon">${room.trap.icon}</span>`;
        } else if (room.type === 'treasure' && room.treasure) {
          cell.classList.add('cell-treasure-room');
          cell.innerHTML = `<span class="cell-icon">${room.treasure.icon}</span>`;
        } else if (room.visited) {
          // cleared room
        } else {
          const hint = room.adjacentEnemyCount;
          if (showHints || dist <= 1) {
            cell.innerHTML = `<span class="cell-hint ${hint === 0 ? 'cell-hint-0' : ''}">${hint}</span>`;
          }
        }
      }

      if (r === state.playerPos.row && c === state.playerPos.col) {
        cell.classList.add('cell-player');
      }

      const canClick = room.revealed && !room.visited && room.type !== 'wall' &&
        isAdjacent(r, c, state.playerPos.row, state.playerPos.col) &&
        state.phase === 'exploring';

      const canMove = room.revealed && room.visited && room.type !== 'wall' &&
        isAdjacent(r, c, state.playerPos.row, state.playerPos.col) &&
        state.phase === 'exploring' &&
        !(r === state.playerPos.row && c === state.playerPos.col);

      if (canClick || canMove) {
        cell.classList.add('cell-clickable');
        cell.addEventListener('click', () => handleCellClick(r, c));
      }

      dungeonGrid.appendChild(cell);
    }
  }
}

function updateHud() {
  hudHp.textContent = `${state.player.hp}/${state.player.maxHp}`;
  hudShards.textContent = `${state.player.shardsCollected}/3`;
  hudGold.textContent = String(state.player.gold);
  hudVision.textContent = String(state.player.visionRange);

  if (state.player.hp <= 5) {
    hudHp.style.color = '#EF4444';
  } else {
    hudHp.style.color = '';
  }
}

// ── Movement & Room Entry ───────────────────────

function handleCellClick(r: number, c: number) {
  if (state.phase !== 'exploring') return;

  const room = state.grid[r][c];
  if (room.type === 'wall') return;

  applyMoveDrain();

  if (state.player.hp <= 0) {
    endGame(false);
    return;
  }

  state.playerPos = { row: r, col: c };
  state.turnCount++;

  if (!room.visited) {
    room.visited = true;
    state.player.roomsExplored++;
    revealAround(r, c);
  }

  if (room.type === 'hub' && state.player.shardsCollected > 0) {
    endGame(true);
    return;
  }

  if (room.type === 'enemy' && room.enemy && room.enemy.hp > 0) {
    startCombat(room);
    return;
  }

  if (room.type === 'shard' && room.enemy && room.enemy.hp > 0) {
    startCombat(room);
    return;
  }

  if (room.type === 'shard' && (!room.enemy || room.enemy.hp <= 0) && room.shardIndex !== undefined) {
    collectShard(room);
    return;
  }

  if (room.type === 'trap' && room.trap) {
    encounterTrap(room);
    return;
  }

  if (room.type === 'treasure' && room.treasure) {
    encounterTreasure(room);
    return;
  }

  renderGrid();
  updateHud();
}

function applyMoveDrain() {
  const shards = state.player.shardsCollected;
  if (shards === 0) return;

  let drain = 0;
  if (shards === 1) drain = 0;
  if (shards === 2) drain = 1;
  if (shards === 3) {
    drain = 2;
    if (Math.random() < 0.5) drain = 3;
  }

  if (drain > 0) {
    state.player.hp -= drain;
    log(`The shards drain you for ${drain} HP`, 'log-danger');
    updateHud();
  }
}

// ── Combat ──────────────────────────────────────

function startCombat(room: Room) {
  const enemy = room.enemy!;
  state.phase = 'combat';
  state.combat = {
    enemy,
    playerRoll: null,
    enemyRoll: null,
    log: [`A ${enemy.name} blocks your path!`],
    phase: 'player-turn',
  };

  combatEnemyIcon.textContent = enemy.icon;
  combatEnemyName.textContent = enemy.name;
  updateCombatHp();
  renderCombatLog();
  combatDice.textContent = '';
  combatOverlay.classList.remove('hidden');
  btnAttack.style.display = '';
  btnFlee.style.display = '';
}

function updateCombatHp() {
  const e = state.combat!.enemy;
  const pct = Math.max(0, (e.hp / e.maxHp) * 100);
  combatEnemyHp.style.width = `${pct}%`;
  combatEnemyHpText.textContent = `${Math.max(0, e.hp)} / ${e.maxHp}`;
}

function renderCombatLog() {
  combatLog.innerHTML = state.combat!.log.map(l => `<p>${l}</p>`).join('');
  combatLog.scrollTop = combatLog.scrollHeight;
}

function combatMessage(msg: string) {
  state.combat!.log.push(msg);
  renderCombatLog();
}

async function animateDice(target: HTMLElement): Promise<number> {
  const result = roll20();
  target.textContent = '';
  target.classList.add('dice-rolling');

  const frames = 12;
  for (let i = 0; i < frames; i++) {
    target.textContent = String(Math.floor(Math.random() * 20) + 1);
    await new Promise(r => setTimeout(r, 60));
  }

  target.classList.remove('dice-rolling');
  target.textContent = String(result);
  return result;
}

async function playerAttack() {
  btnAttack.setAttribute('disabled', '');
  btnFlee.setAttribute('disabled', '');

  const roll = await animateDice(combatDice);
  const enemy = state.combat!.enemy;
  const isCrit = roll === 20;

  if (roll >= enemy.defense) {
    const dmg = isCrit ? state.player.attack * 2 : state.player.attack;
    enemy.hp -= dmg;
    combatMessage(`You roll ${roll}${isCrit ? ' (CRIT!)' : ''} — hit for ${dmg} damage!`);
    updateCombatHp();

    if (enemy.hp <= 0) {
      combatMessage(`${enemy.name} defeated! +${enemy.goldReward} gold`);
      state.player.gold += enemy.goldReward;
      state.player.enemiesDefeated++;

      setTimeout(() => finishCombat(true), 600);
      return;
    }
  } else {
    combatMessage(`You roll ${roll} — miss! (need ${enemy.defense}+)`);
  }

  setTimeout(() => enemyTurn(), 400);
}

async function enemyTurn() {
  const enemy = state.combat!.enemy;
  const roll = await animateDice(combatDice);
  const playerDodge = 10;

  if (roll >= playerDodge) {
    const isCrit = roll === 20;
    const dmg = isCrit ? enemy.attack * 2 : enemy.attack;
    state.player.hp -= dmg;
    combatMessage(`${enemy.name} rolls ${roll}${isCrit ? ' (CRIT!)' : ''} — hits you for ${dmg}!`);
    updateHud();

    if (state.player.hp <= 0) {
      combatMessage('You have been slain...');
      setTimeout(() => finishCombat(false), 600);
      return;
    }
  } else {
    combatMessage(`${enemy.name} rolls ${roll} — misses!`);
  }

  btnAttack.removeAttribute('disabled');
  btnFlee.removeAttribute('disabled');
}

async function playerFlee() {
  btnAttack.setAttribute('disabled', '');
  btnFlee.setAttribute('disabled', '');

  const roll = await animateDice(combatDice);
  if (roll >= 12) {
    combatMessage(`You roll ${roll} — escaped!`);
    setTimeout(() => {
      combatOverlay.classList.add('hidden');
      state.phase = 'exploring';
      renderGrid();
      updateHud();
    }, 400);
  } else {
    combatMessage(`You roll ${roll} — failed to flee! (need 12+)`);
    setTimeout(() => enemyTurn(), 400);
  }
}

function finishCombat(won: boolean) {
  combatOverlay.classList.add('hidden');

  if (!won) {
    endGame(false);
    return;
  }

  const room = state.grid[state.playerPos.row][state.playerPos.col];

  if (room.type === 'shard' && room.shardIndex !== undefined) {
    room.enemy = undefined;
    collectShard(room);
  } else {
    room.type = 'empty';
    room.enemy = undefined;
    state.phase = 'exploring';
    log(`Room cleared! +${state.combat!.enemy.goldReward} gold`, 'log-gold');
    renderGrid();
    updateHud();
  }

  state.combat = null;
}

// ── Traps ───────────────────────────────────────

function encounterTrap(room: Room) {
  state.phase = 'trap-encounter';
  state.activeTrap = room.trap!;

  trapIcon.textContent = room.trap!.icon;
  trapName.textContent = room.trap!.name;
  trapDesc.textContent = `A hidden ${room.trap!.name.toLowerCase()}! Damage: ${room.trap!.damage} HP`;
  trapDC.textContent = String(room.trap!.disarmDC);
  trapDice.textContent = '';
  trapOverlay.classList.remove('hidden');
  btnDisarm.removeAttribute('disabled');
  btnTakeDamage.removeAttribute('disabled');
}

async function disarmTrap() {
  btnDisarm.setAttribute('disabled', '');
  btnTakeDamage.setAttribute('disabled', '');

  const roll = await animateDice(trapDice);
  const trap = state.activeTrap!;

  if (roll >= trap.disarmDC) {
    log(`Disarmed ${trap.name}! (rolled ${roll}, needed ${trap.disarmDC}+)`, 'log-success');
  } else {
    state.player.hp -= trap.damage;
    log(`Failed to disarm! Rolled ${roll}, needed ${trap.disarmDC}+. Took ${trap.damage} damage.`, 'log-danger');
  }

  finishTrap();
}

function takeTrapDamage() {
  const trap = state.activeTrap!;
  state.player.hp -= trap.damage;
  log(`Took ${trap.damage} damage from ${trap.name}`, 'log-danger');
  finishTrap();
}

function finishTrap() {
  trapOverlay.classList.add('hidden');
  const room = state.grid[state.playerPos.row][state.playerPos.col];
  room.type = 'empty';
  room.trap = undefined;
  state.activeTrap = null;

  if (state.player.hp <= 0) {
    endGame(false);
    return;
  }

  state.phase = 'exploring';
  renderGrid();
  updateHud();
}

// ── Treasure ────────────────────────────────────

function encounterTreasure(room: Room) {
  state.phase = 'treasure-found';
  state.activeTreasure = room.treasure!;

  treasureIcon.textContent = room.treasure!.icon;
  treasureDesc.textContent = room.treasure!.description;

  const parts: string[] = [];
  if (room.treasure!.gold > 0) parts.push(`+${room.treasure!.gold} gold`);
  if (room.treasure!.healAmount > 0) parts.push(`+${room.treasure!.healAmount} HP`);
  treasureDetails.textContent = parts.join(' | ');

  treasureOverlay.classList.remove('hidden');
}

function collectTreasure() {
  const t = state.activeTreasure!;
  state.player.gold += t.gold;
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + t.healAmount);

  const parts: string[] = [];
  if (t.gold > 0) parts.push(`+${t.gold} gold`);
  if (t.healAmount > 0) parts.push(`+${t.healAmount} HP`);
  log(`Found ${t.description}! ${parts.join(', ')}`, 'log-gold');

  const room = state.grid[state.playerPos.row][state.playerPos.col];
  room.type = 'empty';
  room.treasure = undefined;
  state.activeTreasure = null;

  treasureOverlay.classList.add('hidden');
  state.phase = 'exploring';
  renderGrid();
  updateHud();
}

// ── Shard Collection ────────────────────────────

function collectShard(room: Room) {
  state.player.shardsCollected++;
  room.shardIndex = undefined;

  const count = state.player.shardsCollected;

  let debuffMsg = '';
  if (count === 1) {
    state.player.visionRange = Math.max(1, state.player.visionRange - 1);
    debuffMsg = 'Your vision dims. You can see less of the dungeon.';
    vignette.className = 'vignette shard-1';
  } else if (count === 2) {
    state.player.visionRange = Math.max(1, state.player.visionRange - 1);
    debuffMsg = 'Each step now drains your life force. Move carefully.';
    vignette.className = 'vignette shard-2';
  } else if (count === 3) {
    debuffMsg = 'All three shards scream in unison. Heavy drain each move. GET OUT NOW.';
    vignette.className = 'vignette shard-3';
  }

  shardDebuffText.textContent = debuffMsg;
  shardCountText.textContent = `Shards: ${count}/3 — Return to the Hub to extract!`;

  log(`Soul Shard collected! (${count}/3)`, 'log-accent');
  if (debuffMsg) log(debuffMsg, 'log-danger');

  state.phase = 'shard-collected';
  shardOverlay.classList.remove('hidden');
}

function continueShard() {
  shardOverlay.classList.add('hidden');
  state.phase = 'exploring';
  renderGrid();
  updateHud();
}

// ── End Game ────────────────────────────────────

function endGame(victory: boolean) {
  state.endTime = Date.now();
  const seconds = Math.floor((state.endTime - state.startTime) / 1000);

  const result: RunResult = {
    date: state.dailySeed,
    shardsExtracted: victory ? state.player.shardsCollected : 0,
    gold: state.player.gold,
    roomsExplored: state.player.roomsExplored,
    enemiesDefeated: state.player.enemiesDefeated,
    turnCount: state.turnCount,
    timeSeconds: seconds,
    perfectClear: victory && state.player.shardsCollected === 3,
    modifier: state.dailyModifier.name,
  };

  saveRun(result);

  if (victory) {
    $('v-shards').textContent = String(result.shardsExtracted);
    $('v-gold').textContent = String(result.gold);
    $('v-rooms').textContent = String(result.roomsExplored);
    $('v-enemies').textContent = String(result.enemiesDefeated);
    $('v-time').textContent = formatTime(seconds);

    const victoryShardsEl = $('victory-shards');
    victoryShardsEl.textContent = result.perfectClear
      ? 'All 3 shards extracted!'
      : `${result.shardsExtracted} shard${result.shardsExtracted > 1 ? 's' : ''} extracted`;

    $('v-perfect').classList.toggle('hidden', !result.perfectClear);
    showScreen(screenVictory);
  } else {
    $('d-shards').textContent = String(state.player.shardsCollected);
    $('d-gold').textContent = String(state.player.gold);
    $('d-rooms').textContent = String(state.player.roomsExplored);
    $('d-enemies').textContent = String(state.player.enemiesDefeated);
    showScreen(screenDefeat);
  }

  state.phase = victory ? 'victory' : 'defeat';
}

function saveRun(result: RunResult) {
  const save = loadSave();
  const existingIdx = save.runs.findIndex(r => r.date === result.date);
  if (existingIdx >= 0) {
    if (result.shardsExtracted > save.runs[existingIdx].shardsExtracted) {
      save.runs[existingIdx] = result;
    }
  } else {
    save.runs.push(result);
  }

  save.runs = save.runs.slice(-30);

  if (result.shardsExtracted > 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (save.lastPlayedDate === yStr || save.lastPlayedDate === result.date) {
      save.currentStreak++;
    } else {
      save.currentStreak = 1;
    }

    if (save.currentStreak > save.bestStreak) save.bestStreak = save.currentStreak;
    save.lastPlayedDate = result.date;
  }

  saveSave(save);
}

// ── Event Listeners ─────────────────────────────

btnEnter.addEventListener('click', startGame);
btnAttack.addEventListener('click', playerAttack);
btnFlee.addEventListener('click', playerFlee);
btnDisarm.addEventListener('click', disarmTrap);
btnTakeDamage.addEventListener('click', takeTrapDamage);
btnLoot.addEventListener('click', collectTreasure);
btnShardContinue.addEventListener('click', continueShard);
$('btn-back-title').addEventListener('click', renderTitle);
$('btn-back-title-d').addEventListener('click', renderTitle);

renderTitle();
