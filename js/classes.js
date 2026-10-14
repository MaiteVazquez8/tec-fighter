class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    isBackground = false
  }) {
    this.position = position
    this.width = 50
    this.height = 150
    this.image = new Image()
    this.image.src = imageSrc
    this.scale = scale
    this.framesMax = framesMax
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 10 // Aumentado de 5 a 10 para animaciones más lentas
    this.offset = offset
    this.isBackground = isBackground
    this.facingRight = true // true = mira derecha, false = mira izquierda
  }

  draw() {
    if (this.isBackground) {
      // Special handling for background to ensure full coverage
      const originalWidth = 1024
      const originalHeight = 576
      const scaleX = canvas.width / originalWidth
      const scaleY = canvas.height / originalHeight
      const scale = Math.max(scaleX, scaleY)

      const scaledWidth = originalWidth * scale
      const scaledHeight = originalHeight * scale
      const x = (canvas.width - scaledWidth) / 2
      const y = (canvas.height - scaledHeight) / 2

      c.drawImage(
        this.image,
        0,
        0,
        originalWidth,
        originalHeight,
        x,
        y,
        scaledWidth,
        scaledHeight
      )
    } else {
      // Verificar que la imagen esté cargada
      if (!this.image || !this.image.complete || this.image.width === 0) {
        return // No dibujar si la imagen no está lista
      }
      
      const frameWidth = this.image.width / this.framesMax
      const drawWidth = frameWidth * this.scale
      const drawHeight = this.image.height * this.scale
      const drawX = this.position.x - this.offset.x
      const drawY = this.position.y - this.offset.y

      // Voltear sprite si está mirando a la izquierda
      if (this.facingRight === false) {
        // Voltear horizontalmente desde el centro del sprite
        c.save()
        const centerX = drawX + drawWidth / 2
        const centerY = drawY + drawHeight / 2
        c.translate(centerX, centerY)
        c.scale(-1, 1) // Voltear horizontalmente
        c.translate(-centerX, -centerY)
        c.drawImage(
          this.image,
          this.framesCurrent * frameWidth,
          0,
          frameWidth,
          this.image.height,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        )
        c.restore()
      } else {
        // Dibujar normal (mira a la derecha)
        c.drawImage(
          this.image,
          this.framesCurrent * frameWidth,
          0,
          frameWidth,
          this.image.height,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        )
      }
    }
  }

  animateFrames() {
    this.framesElapsed++

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++
      } else {
        this.framesCurrent = 0
      }
    }
  }

  update() {
    this.draw()
    this.animateFrames()
  }
}

class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: {}, width: undefined, height: undefined }
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset
    })

    this.velocity = velocity
    this.width = 50
    this.height = 150
    this.lastKey = null
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    }
    this.color = color
    this.isAttacking
    this.health = 100
    this.framesCurrent = 0
    this.framesElapsed = 0
    this.framesHold = 10 // Aumentado de 5 a 10 para animaciones más lentas
    this.sprites = sprites
    this.dead = false
    this.canJump = true // Nueva propiedad para controlar si puede saltar
    this.attackHit = false // Flag para rastrear si el ataque actual ya golpeó
    this.attackActiveFramesStart = false // Flag para rastrear cuando empiezan los frames activos
    this.attackElapsed = 0
    this.attackDuration = 0

    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image()
      sprites[sprite].image.src = sprites[sprite].imageSrc
    }
  }

  update() {
    // Este método solo actualiza la física, NO dibuja
    // El dibujo se hace explícitamente después de establecer la orientación
    
    // Actualizar animaciones
    if (!this.dead) this.animateFrames()

    // La física y attackBoxes se actualizan en index.js después de establecer orientación
  }

  attack() {
    this.switchSprite('attack1')
    this.isAttacking = true
    this.attackElapsed = 0
    this.attackDuration = (this.sprites.attack1.framesMax - 1) * this.framesHold
    this.attackHit = false // Reset flag cuando comienza un nuevo ataque
    this.attackActiveFramesStart = false // Reset flag de frames activos
  }

  animateFrames() {
    super.animateFrames()
    if (this.isAttacking) this.attackElapsed++
  }

  takeHit() {
    this.health -= 20

    if (this.health <= 0) {
      this.switchSprite('death')
    } else this.switchSprite('takeHit')
  }

  switchSprite(sprite) {
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1)
        this.dead = true
      return
    }

    // overriding all other animations with the attack animation
    if (
      this.image === this.sprites.attack1.image &&
      this.framesCurrent < this.sprites.attack1.framesMax - 1
    )
      return

    // override when fighter gets hit
    if (
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.framesMax - 1
    )
      return

    switch (sprite) {
      case 'idle':
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image
          this.framesMax = this.sprites.idle.framesMax
          this.framesCurrent = 0
        }
        break
      case 'run':
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image
          this.framesMax = this.sprites.run.framesMax
          this.framesCurrent = 0
        }
        break
      case 'jump':
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image
          this.framesMax = this.sprites.jump.framesMax
          this.framesCurrent = 0
        }
        break

      case 'fall':
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image
          this.framesMax = this.sprites.fall.framesMax
          this.framesCurrent = 0
        }
        break

      case 'attack1':
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image
          this.framesMax = this.sprites.attack1.framesMax
          this.framesCurrent = 0
        }
        break

      case 'takeHit':
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image
          this.framesMax = this.sprites.takeHit.framesMax
          this.framesCurrent = 0
        }
        break

      case 'death':
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image
          this.framesMax = this.sprites.death.framesMax
          this.framesCurrent = 0
        }
        break
    }
  }
}
