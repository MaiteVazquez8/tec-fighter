const gameSounds = {
  block: new Audio('./sound/bloqueo.mp3'),
  miss: new Audio('./sound/golpeErradoPCM.wav'),
  player1Hit: new Audio('./sound/golpeJugador1.mp3'),
  player2Hit: new Audio('./sound/golpeJugador2.mp3')
}

Object.values(gameSounds).forEach(sound => {
  sound.preload = 'auto'
  sound.volume = 0.65
})

function playGameSound(soundName) {
  const sound = gameSounds[soundName]
  if (!sound) {
    console.warn(`Sonido de juego desconocido: ${soundName}`)
    return
  }

  sound.currentTime = 0
  const playback = sound.play()
  if (playback && typeof playback.catch === 'function') {
    playback.catch(error => {
      console.warn(`No se pudo reproducir el sonido "${soundName}".`, error)
    })
  }
}
