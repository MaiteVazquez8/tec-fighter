window.addEventListener('keydown', (event) => {
  // ESC: abrir/cerrar pausa solo si está en partida
  if (event.key === 'Escape') {
    if (state === STATE_PLAY && !isPaused) {
      showPauseMenu()
      return
    } else if (state === STATE_PLAY && isPaused) {
      hidePauseMenu()
      return
    }
  }

  // Reset game with R key even fuera de partida (si terminó)
  if (event.key === 'r' || event.key === 'R') {
    if (gameEnded) {
      startGame()
    }
  }

  // Solo aceptar controles de jugadores si estamos en PLAY y no estamos en pausa
  if (state !== STATE_PLAY || isPaused) return

  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        if (player.canJump) {
          player.velocity.y = -20
        }
        break
      case 's':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        if (enemy.canJump) {
          enemy.velocity.y = -20
        }
        break
      case 'ArrowDown':
        enemy.attack()
        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  // Sólo procesar si estamos en PLAY y no estamos en pausa
  if (state !== STATE_PLAY || isPaused) return

  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})

