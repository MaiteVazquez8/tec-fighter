// Variables de timer (movidas desde utils.js para acceso a variables de round)
let timer = 60
let timerId
let roundCountdownId
let endGameDelayId

function clearRoundCountdown() {
  if (roundCountdownId) {
    clearInterval(roundCountdownId)
    roundCountdownId = undefined
  }
}

function clearEndGameDelay() {
  if (endGameDelayId) {
    clearTimeout(endGameDelayId)
    endGameDelayId = undefined
  }
}

function decreaseTimer() {
  if (timer > 0 && !roundEnded && !gameEnded && state === STATE_PLAY && !isPaused) {
    timerId = setTimeout(decreaseTimer, 1000)
    timer--
    document.querySelector('#timer').innerHTML = timer
  }

  if (timer === 0 && !roundEnded) {
    determineRoundWinner()
  }
}

// Funciones para manejar rounds
function determineRoundWinner() {
  roundEnded = true
  clearTimeout(timerId)
  clearRoundCountdown()
  
  let roundWinner = ''
  if (player.health === enemy.health) {
    roundWinner = 'Empate'
  } else if (player.health > enemy.health) {
    roundWinner = 'Player 1'
    playerWins++
  } else {
    roundWinner = 'Player 2'
    enemyWins++
  }
  
  updateRoundDisplay()
  
  const displayText = document.querySelector('#displayText')
  const hasNextRound = currentRound < maxRounds

  if (!hasNextRound) {
    clearEndGameDelay()
    endGameDelayId = setTimeout(() => {
      endGameDelayId = undefined
      endGame()
    }, 1000)
    return
  }

  let countdown = 3

  const renderRoundResult = () => {
    displayText.innerHTML = `
      <div class="round-result">
        <p class="round-result-title">ROUND ${currentRound} · ${roundWinner} GANA</p>
        <p class="round-result-score">P1: ${playerWins} <span>—</span> P2: ${enemyWins}</p>
        <div class="countdown-line">
          <span>Siguiente round en</span>
          <span class="round-countdown" aria-live="assertive">${countdown}</span>
        </div>
      </div>
    `
  }

  displayText.style.display = 'flex'
  renderRoundResult()
  roundCountdownId = setInterval(() => {
    if (isPaused || state !== STATE_PLAY) return

    countdown--
    if (countdown === 0) {
      clearRoundCountdown()
      nextRound()
      return
    }

    renderRoundResult()
  }, 1000)
}

function nextRound() {
  clearRoundCountdown()
  currentRound++
  roundEnded = false
  gameEnded = false
  
  timer = 60
  clearTimeout(timerId)
  decreaseTimer()
  
  // Reset players
  player.health = 100
  player.dead = false
  player.position.x = canvas.width * 0.35
  player.position.y = groundLevel - 150
  player.velocity.x = 0
  player.velocity.y = 0
  player.canJump = true
  player.isAttacking = false
  player.framesCurrent = 0
  player.framesElapsed = 0
  player.attackHit = false
  player.attackActiveFramesStart = false
  player.image = player.sprites.idle.image
  player.framesMax = player.sprites.idle.framesMax
  
  enemy.health = 100
  enemy.dead = false
  enemy.position.x = canvas.width * 0.60
  enemy.position.y = groundLevel - 150
  enemy.velocity.x = 0
  enemy.velocity.y = 0
  enemy.canJump = true
  enemy.isAttacking = false
  enemy.framesCurrent = 0
  enemy.framesElapsed = 0
  enemy.attackHit = false
  enemy.attackActiveFramesStart = false
  enemy.image = enemy.sprites.idle.image
  enemy.framesMax = enemy.sprites.idle.framesMax
  
  document.querySelector('#displayText').style.display = 'none'
  document.querySelector('#playerHealth').style.width = '100%'
  document.querySelector('#enemyHealth').style.width = '100%'
  
  updateRoundDisplay()
}

function endGame() {
  gameEnded = true
  clearTimeout(timerId)
  clearRoundCountdown()
  clearEndGameDelay()
  
  let finalWinner = ''
  if (playerWins > enemyWins) {
    finalWinner = 'Player 1 gana la partida!'
  } else if (enemyWins > playerWins) {
    finalWinner = 'Player 2 gana la partida!'
  } else {
    finalWinner = 'Empate!'
  }
  
  document.querySelector('#displayText').style.display = 'flex'
  document.querySelector('#displayText').innerHTML = `
    ${finalWinner}<br>
    P1: ${playerWins} - P2: ${enemyWins}<br>
    <br>Presiona R para reiniciar
  `
  
  showGameOverMenu()
}

function updateRoundDisplay() {
  const roundDisplay = document.querySelector('#roundDisplay')
  if (roundDisplay) {
    roundDisplay.innerHTML = `Round ${currentRound} de ${maxRounds}<br>P1: ${playerWins} - P2: ${enemyWins}`
  }
}

function resetGame() {
  clearRoundCountdown()
  clearEndGameDelay()
  // Reset game state
  gameEnded = false
  roundEnded = false
  currentRound = 1
  playerWins = 0
  enemyWins = 0

  // Limpiar chispas y reset del flag de bloqueo
  sparks = []
  wasBlockingLastFrame = false

  // Reset timer
  timer = 60
  clearTimeout(timerId)
  decreaseTimer()

  // Reset player completely
  player.health = 100
  player.dead = false
  player.position.x = canvas.width * 0.35
  player.position.y = groundLevel - 150
  player.velocity.x = 0
  player.velocity.y = 0
  player.canJump = true
  player.isAttacking = false
  player.framesCurrent = 0
  player.framesElapsed = 0
  player.image = player.sprites.idle.image
  player.framesMax = player.sprites.idle.framesMax
  player.lastKey = null
  // Reset enemy completely
  enemy.health = 100
  enemy.dead = false
  enemy.position.x = canvas.width * 0.60
  enemy.position.y = groundLevel - 150
  enemy.velocity.x = 0
  enemy.velocity.y = 0
  enemy.canJump = true
  enemy.isAttacking = false
  enemy.framesCurrent = 0
  enemy.framesElapsed = 0
  enemy.image = enemy.sprites.idle.image
  enemy.framesMax = enemy.sprites.idle.framesMax
  enemy.lastKey = null

  // Reset UI
  document.querySelector('#displayText').style.display = 'none'
  document.querySelector('#playerHealth').style.width = '100%'
  document.querySelector('#enemyHealth').style.width = '100%'
  document.querySelector('#timer').innerHTML = timer
  
  updateRoundDisplay()
}

