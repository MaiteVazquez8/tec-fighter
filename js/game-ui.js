// Referencias a las capas DOM del menú
const mainMenu = document.getElementById('mainMenu')
const howTo = document.getElementById('howTo')
const gameOverMenu = document.getElementById('gameOverMenu')
const gameOverText = document.getElementById('gameOverText')
const gameHud = document.getElementById('gameHud')
const startBtn = document.getElementById('startBtn')
const howBtn = document.getElementById('howBtn')
const howBackBtn = document.getElementById('howBackBtn')
const startBtnFromHow = document.getElementById('startBtnFromHow')
const replayBtn = document.getElementById('replayBtn')
const toMainBtn = document.getElementById('toMainBtn')

// NUEVAS referencias para pausa
const pauseMenu = document.getElementById('pauseMenu')
const pauseRestartBtn = document.getElementById('pauseRestartBtn')
const pauseContinueBtn = document.getElementById('pauseContinueBtn')
const pauseToMainBtn = document.getElementById('pauseToMainBtn')

// Funciones para mostrar/ocultar menús
function showMainMenu() {
  state = STATE_MENU
  isPaused = false
  clearRoundCountdown()
  clearEndGameDelay()
  gameHud.classList.add('hidden')
  mainMenu.classList.remove('hidden')
  howTo.classList.add('hidden')
  gameOverMenu.classList.add('hidden')
  pauseMenu.classList.add('hidden')
  
  // Ocultar round display en el menú
  const roundDisplay = document.querySelector('#roundDisplay')
  if (roundDisplay) {
    roundDisplay.style.display = 'none'
  }
}

function showHowTo() {
  state = STATE_INSTRUCTIONS
  isPaused = false
  gameHud.classList.add('hidden')
  mainMenu.classList.add('hidden')
  howTo.classList.remove('hidden')
  gameOverMenu.classList.add('hidden')
  pauseMenu.classList.add('hidden')
}

function showGameOverMenu() {
  // tomar texto que determine el ganador del div existente si lo hay
  const displayText = document.querySelector('#displayText').innerText || 'Fin de la partida'
  gameOverText.innerText = displayText
  state = 'gameover'
  isPaused = false
  gameHud.classList.add('hidden')
  mainMenu.classList.add('hidden')
  howTo.classList.add('hidden')
  gameOverMenu.classList.remove('hidden')
  pauseMenu.classList.add('hidden')
}

// NUEVAS funciones de pausa
function showPauseMenu() {
  if (state !== STATE_PLAY) return
  isPaused = true
  pauseMenu.classList.remove('hidden')

  // Pausar el contador si existe
  if (typeof timerId !== 'undefined') {
    clearTimeout(timerId)
  }
}

function hidePauseMenu() {
  // Solo reanudar si todavía estamos en PLAY
  if (state !== STATE_PLAY) return
  isPaused = false
  pauseMenu.classList.add('hidden')

  // Reanudar el contador si la función existe
  if (typeof decreaseTimer === 'function') {
    decreaseTimer()
  }
}

// Iniciar partida: oculta menús, reinicia y arranca timer
function startGame() {
  gameHud.classList.remove('hidden')
  mainMenu.classList.add('hidden')
  howTo.classList.add('hidden')
  gameOverMenu.classList.add('hidden')
  pauseMenu.classList.add('hidden')
  isPaused = false
  
  // Mostrar round display
  const roundDisplay = document.querySelector('#roundDisplay')
  if (roundDisplay) {
    roundDisplay.style.display = 'block'
  }
  
  state = STATE_PLAY
  resetGame() // resetGame ahora llama a decreaseTimer() y reinicia todo
  gameEnded = false
}

// Botones del menú
startBtn.addEventListener('click', () => {
  startGame()
})

howBtn.addEventListener('click', () => {
  showHowTo()
})

howBackBtn.addEventListener('click', () => {
  showMainMenu()
})

startBtnFromHow.addEventListener('click', () => {
  startGame()
})

replayBtn.addEventListener('click', () => {
  startGame()
})

toMainBtn.addEventListener('click', () => {
  showMainMenu()
})

// Botones de pausa
pauseRestartBtn.addEventListener('click', () => {
  hidePauseMenu()
  startGame()
})

pauseContinueBtn.addEventListener('click', () => {
  hidePauseMenu()
})

pauseToMainBtn.addEventListener('click', () => {
  hidePauseMenu()
  showMainMenu()
})

