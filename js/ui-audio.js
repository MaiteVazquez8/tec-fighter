const buttonClickSound = new Audio('./sound/clic.wav')
buttonClickSound.preload = 'auto'
buttonClickSound.volume = 0.45

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return

  const control = event.target.closest('button, .start-button')
  if (!control || control.disabled) return

  buttonClickSound.currentTime = 0
  const playback = buttonClickSound.play()
  if (playback && typeof playback.catch === 'function') {
    playback.catch(error => {
      console.warn('No se pudo reproducir el sonido de clic.', error)
    })
  }
})
