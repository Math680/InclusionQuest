// --- Configuration globale du jeu ---
// Nombre total de cases du plateau. Modifier la valeur ci-dessous si vous changez la longueur du parcours.
const totalCases = 40;

// Répartition des catégories par tranche. Ajuster ici pour redistribuer les plages.
const categoryRanges = [
  { min: 1, max: 10, label: 'Social' },
  { min: 11, max: 20, label: 'Campus' },
  { min: 21, max: 30, label: 'Entreprise' },
  { min: 31, max: 40, label: 'Transport' }
];

// Cartes disponibles par catégorie. Ajouter de nouvelles entrées pour ajouter des cartes.
const cardsConfig = {
  Social: [
    { front: 'assets/cards/social/social_01_front.png', back: 'assets/cards/social/social_01_back.png' }
  ],
  Campus: [
    { front: 'assets/cards/campus/campus_01_front.png', back: 'assets/cards/campus/campus_01_back.png' }
  ],
  Entreprise: [
    { front: 'assets/cards/enterprise/enterprise_01_front.png', back: 'assets/cards/enterprise/enterprise_01_back.png' }
  ],
  Transport: [
    { front: 'assets/cards/transport/transport_01_front.png', back: 'assets/cards/transport/transport_01_back.png' }
  ]
};

// --- État dynamique ---
let players = [];
let currentPlayerIndex = 0;
let currentCase = 1;
let teamInclusion = 0;
let teamChaos = 0;
let timerInterval = null;
let currentTimer = 60;
let currentCard = null;
let showingBack = false;

// --- Sélecteurs ---
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const summaryScreen = document.getElementById('summary-screen');

const playerCountInput = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names');
const startBtn = document.getElementById('start-btn');

const turnIndicator = document.getElementById('turn-indicator');
const caseIndicator = document.getElementById('case-indicator');
const categoryIndicator = document.getElementById('category-indicator');
const cardCategory = document.getElementById('card-category');

const rollBtn = document.getElementById('roll-btn');
const lastRoll = document.getElementById('last-roll');
const nextTurnBtn = document.getElementById('next-turn');
const endGameBtn = document.getElementById('end-game');

const cardImage = document.getElementById('card-image');
const drawCardBtn = document.getElementById('draw-card');
const showBackBtn = document.getElementById('show-back');
const newCardBtn = document.getElementById('new-card');

const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const resetTimerBtn = document.getElementById('reset-timer');

const teamInclusionEl = document.getElementById('team-inclusion');
const teamChaosEl = document.getElementById('team-chaos');
const scoreBody = document.getElementById('score-body');

const scoreButtons = document.querySelectorAll('.score-btn');

const finalInclusionEl = document.getElementById('final-inclusion');
const finalChaosEl = document.getElementById('final-chaos');
const finalMessage = document.getElementById('final-message');
const finalScoreBody = document.getElementById('final-score-body');
const replayBtn = document.getElementById('replay');
const backHomeBtn = document.getElementById('back-home');

const pawn = document.getElementById('pawn');

// --- Initialisation ---
function initGame() {
  generatePlayerInputs();
  attachEventListeners();
  updateUI();
}

// Crée les champs nom de joueur selon le nombre sélectionné.
function generatePlayerInputs() {
  const count = parseInt(playerCountInput.value, 10) || 2;
  playerNamesContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Joueur ${i + 1}`;
    input.value = `Joueur ${i + 1}`;
    playerNamesContainer.appendChild(input);
  }
}

function attachEventListeners() {
  playerCountInput.addEventListener('input', generatePlayerInputs);
  startBtn.addEventListener('click', startGame);

  rollBtn.addEventListener('click', rollDie);
  nextTurnBtn.addEventListener('click', nextTurn);
  endGameBtn.addEventListener('click', showSummaryScreen);

  drawCardBtn.addEventListener('click', () => drawCardForCategory(getCurrentCategory()));
  showBackBtn.addEventListener('click', showCardBack);
  newCardBtn.addEventListener('click', () => drawCardForCategory(getCurrentCategory()));

  startTimerBtn.addEventListener('click', startTimer);
  resetTimerBtn.addEventListener('click', resetTimer);

  scoreButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const inclusionDelta = parseInt(btn.dataset.inclusion || '0', 10);
      const chaosDelta = parseInt(btn.dataset.chaos || '0', 10);
      updateScores(currentPlayerIndex, inclusionDelta, chaosDelta);
    });
  });

  replayBtn.addEventListener('click', () => startGame(true));
  backHomeBtn.addEventListener('click', () => {
    summaryScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    resetGameState();
  });
}

function startGame(fromReplay = false) {
  if (!fromReplay) {
    const inputs = playerNamesContainer.querySelectorAll('input');
    players = Array.from(inputs).map((input, index) => ({
      name: input.value.trim() || `Joueur ${index + 1}`,
      inclusion: 0,
      chaos: 0
    }));
  } else if (players.length === 0) {
    // Cas extrême : rejouer mais aucune donnée ; on re-génère.
    generatePlayerInputs();
    const inputs = playerNamesContainer.querySelectorAll('input');
    players = Array.from(inputs).map((input, index) => ({
      name: input.value.trim() || `Joueur ${index + 1}`,
      inclusion: 0,
      chaos: 0
    }));
  }

  resetPlayerScores();
  resetGameState();
  setupScreen.classList.add('hidden');
  summaryScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  updateUI();
}

function resetPlayerScores() {
  players = players.map((player) => ({ ...player, inclusion: 0, chaos: 0 }));
}

function resetGameState() {
  currentPlayerIndex = 0;
  currentCase = 1;
  teamInclusion = 0;
  teamChaos = 0;
  currentCard = null;
  showingBack = false;
  resetTimer();
}

function nextTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  showingBack = false;
  currentCard = null;
  lastRoll.textContent = 'En attente de lancer…';
  updateUI();
}

function rollDie() {
  const roll = Math.floor(Math.random() * 6) + 1;
  lastRoll.textContent = `Résultat du dé : ${roll}`;
  movePawn(roll);
}

function movePawn(steps) {
  currentCase = Math.min(currentCase + steps, totalCases);
  updateUI();
  if (currentCase === totalCases) {
    showSummaryScreen();
  }
}

function getCurrentCategory() {
  return getCategoryForCase(currentCase);
}

// Retourne la catégorie associée à la case.
function getCategoryForCase(caseNumber) {
  const entry = categoryRanges.find((range) => caseNumber >= range.min && caseNumber <= range.max);
  return entry ? entry.label : 'Social';
}

function drawCardForCategory(category) {
  const pool = cardsConfig[category];
  if (!pool || pool.length === 0) {
    cardImage.src = '';
    cardImage.classList.add('placeholder');
    cardImage.alt = 'Aucune carte configurée';
    return;
  }
  const randomCard = pool[Math.floor(Math.random() * pool.length)];
  currentCard = randomCard;
  showingBack = false;
  showCardFront();
}

function showCardFront() {
  if (!currentCard) return;
  cardImage.src = currentCard.front;
  cardImage.alt = 'Carte situation - recto';
  cardImage.classList.remove('placeholder');
}

function showCardBack() {
  if (!currentCard) return;
  cardImage.src = currentCard.back;
  cardImage.alt = 'Carte situation - verso';
  cardImage.classList.remove('placeholder');
  showingBack = true;
}

function updateScores(playerIndex, inclusionDelta = 0, chaosDelta = 0) {
  if (!players[playerIndex]) return;
  players[playerIndex].inclusion += inclusionDelta;
  players[playerIndex].chaos += chaosDelta;

  // Recalcule les totaux d'équipe
  teamInclusion = players.reduce((sum, p) => sum + p.inclusion, 0);
  teamChaos = players.reduce((sum, p) => sum + p.chaos, 0);

  updateUI();
}

function updateUI() {
  const activePlayer = players[currentPlayerIndex];
  turnIndicator.textContent = activePlayer ? `Tour de ${activePlayer.name} (Joueur ${currentPlayerIndex + 1} / ${players.length})` : 'Tour en attente';
  caseIndicator.textContent = `Case actuelle : ${currentCase} / ${totalCases}`;
  const category = getCategoryForCase(currentCase);
  categoryIndicator.textContent = `Catégorie : ${category}`;
  cardCategory.textContent = `Catégorie actuelle : ${category}`;

  teamInclusionEl.textContent = teamInclusion;
  teamChaosEl.textContent = teamChaos;

  // Table des scores
  scoreBody.innerHTML = '';
  players.forEach((player, index) => {
    const row = document.createElement('tr');
    if (index === currentPlayerIndex) {
      row.classList.add('active-player');
    }
    row.innerHTML = `
      <td>${player.name}</td>
      <td>${player.inclusion}</td>
      <td>${player.chaos}</td>
    `;
    scoreBody.appendChild(row);
  });

  // Position visuelle du pion : coordonnées approximatives en pourcentage.
  const progress = (currentCase - 1) / (totalCases - 1);
  const path = [
    { x: 8, y: 10 }, { x: 25, y: 10 }, { x: 42, y: 10 }, { x: 59, y: 10 }, { x: 76, y: 10 },
    { x: 76, y: 26 }, { x: 76, y: 42 }, { x: 76, y: 58 }, { x: 76, y: 74 }, { x: 76, y: 90 },
    { x: 60, y: 90 }, { x: 44, y: 90 }, { x: 28, y: 90 }, { x: 12, y: 90 }, { x: 12, y: 74 },
    { x: 12, y: 58 }, { x: 12, y: 42 }, { x: 12, y: 26 }, { x: 12, y: 10 }, { x: 28, y: 26 }
  ];
  const positionIndex = Math.floor(progress * (path.length - 1));
  const coord = path[positionIndex] || path[path.length - 1];
  pawn.style.left = `${coord.x}%`;
  pawn.style.top = `${coord.y}%`;

  // Mise à jour du sablier (classe warning)
  timerDisplay.classList.toggle('warning', currentTimer <= 10);
}

// --- Gestion du sablier ---
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    currentTimer -= 1;
    if (currentTimer <= 0) {
      currentTimer = 0;
      clearInterval(timerInterval);
    }
    timerDisplay.textContent = currentTimer;
    timerDisplay.classList.toggle('warning', currentTimer <= 10);
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  currentTimer = 60;
  timerDisplay.textContent = currentTimer;
  timerDisplay.classList.remove('warning');
}

// --- Fin de partie ---
function showSummaryScreen() {
  gameScreen.classList.add('hidden');
  summaryScreen.classList.remove('hidden');

  finalInclusionEl.textContent = teamInclusion;
  finalChaosEl.textContent = teamChaos;
  const message = teamInclusion >= 30
    ? 'Experts du Chaos Inclusif !'
    : 'Encore un effort collectif pour plus d’inclusion !';
  finalMessage.textContent = message;

  finalScoreBody.innerHTML = '';
  players.forEach((player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player.name}</td>
      <td>${player.inclusion}</td>
      <td>${player.chaos}</td>
    `;
    finalScoreBody.appendChild(row);
  });
}

// --- Lancement ---
window.addEventListener('DOMContentLoaded', initGame);
