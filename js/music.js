const fightMusic = new Audio('./sound/fondoPelea.wav')
const menuMusic = new Audio('./sound/fondoMenu.mp3')
const musicTracks = [fightMusic, menuMusic]

musicTracks.forEach((track) => {
  track.loop = true
  track.preload = 'auto'
})

fightMusic.volume = 0.35
menuMusic.volume = 0.3

let activeMusicMode = 'menu'
let unlockListenersInstalled = false

function playMusic(track, label) {
  if (!track.paused) return

  const playback = track.play()
  if (playback && typeof playback.catch === 'function') {
    playback.catch((error) => {
      if (error.name === 'NotAllowedError') {
        installMusicUnlockListeners()
        return
      }
      console.warn(`No se pudo reproducir la música de ${label}.`, error)
    })
  }
}

function installMusicUnlockListeners() {
  if (unlockListenersInstalled) return
  unlockListenersInstalled = true
  document.addEventListener('pointerdown', unlockMusic)
  document.addEventListener('keydown', unlockMusic)
}

function unlockMusic() {
  document.removeEventListener('pointerdown', unlockMusic)
  document.removeEventListener('keydown', unlockMusic)
  unlockListenersInstalled = false

  if (activeMusicMode === 'fight') {
    playMusic(fightMusic, 'la pelea')
  } else {
    playMusic(menuMusic, 'el menú')
  }
}

function startMenuMusic() {
  activeMusicMode = 'menu'
  stopFightMusic()
  playMusic(menuMusic, 'el menú')
}

function stopMenuMusic() {
  menuMusic.pause()
}

function startFightMusic(restart = false) {
  activeMusicMode = 'fight'
  stopMenuMusic()
  if (restart && fightMusic.readyState > 0) {
    fightMusic.currentTime = 0
  }
  playMusic(fightMusic, 'la pelea')
}

function stopFightMusic() {
  fightMusic.pause()
}
