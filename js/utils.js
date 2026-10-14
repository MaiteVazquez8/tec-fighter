// Función helper para calcular la hitbox del cuerpo reducida (igual que se dibuja)
function getBodyHitbox(fighter) {
  if (!fighter.image || !fighter.image.complete || fighter.image.width === 0) {
    // Valores por defecto si la imagen no está cargada
    return {
      x: fighter.position.x - fighter.offset.x,
      y: fighter.position.y - fighter.offset.y,
      width: fighter.width,
      height: fighter.height
    }
  }
  
  const frameWidth = fighter.image.width / fighter.framesMax
  const spriteWidth = frameWidth * fighter.scale
  const spriteHeight = fighter.image.height * fighter.scale
  const drawX = fighter.position.x - fighter.offset.x
  const drawY = fighter.position.y - fighter.offset.y
  
  // Usar las mismas proporciones que se usan para dibujar (15% ancho, 30% alto)
  const bodyHitboxWidth = spriteWidth * 0.15
  const bodyHitboxHeight = spriteHeight * 0.30
  
  // Centrar la hitbox en el sprite
  const bodyHitboxX = drawX + (spriteWidth - bodyHitboxWidth) / 2
  const bodyHitboxY = drawY + (spriteHeight - bodyHitboxHeight) / 2
  
  return {
    x: bodyHitboxX,
    y: bodyHitboxY,
    width: bodyHitboxWidth,
    height: bodyHitboxHeight
  }
}

function rectangularCollision({ rectangle1, rectangle2 }) {
  // Obtener la hitbox del cuerpo reducida del defensor
  const bodyHitbox = getBodyHitbox(rectangle2)
  
  // Verificar colisión entre attackBox del atacante y la hitbox del cuerpo reducida del defensor
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= bodyHitbox.x &&
    rectangle1.attackBox.position.x <= bodyHitbox.x + bodyHitbox.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= bodyHitbox.y &&
    rectangle1.attackBox.position.y <= bodyHitbox.y + bodyHitbox.height
  )
}

// Función para detectar colisión entre dos attackBoxes
function attackBoxCollision({ attackBox1, attackBox2 }) {
  if (!attackBox1 || !attackBox2) return false
  return (
    attackBox1.position.x + attackBox1.width >= attackBox2.position.x &&
    attackBox1.position.x <= attackBox2.position.x + attackBox2.width &&
    attackBox1.position.y + attackBox1.height >= attackBox2.position.y &&
    attackBox1.position.y <= attackBox2.position.y + attackBox2.height
  )
}

// Clase para las partículas de chispas cuando las espadas chocan
class Spark {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 12
    this.vy = (Math.random() - 0.5) * 12 - 2
    this.life = 40
    this.maxLife = 40
    this.size = Math.random() * 5 + 3
    this.hue = 30 + Math.random() * 30 // Color amarillo-naranja para las chispas
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += 0.4 // gravedad ligera
    this.vx *= 0.98 // fricción ligera
    this.life--
  }

  draw(c) {
    const alpha = this.life / this.maxLife
    c.save()
    c.globalAlpha = alpha
    // Crear un gradiente radial para el efecto de chispa
    const gradient = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
    gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, 1)`)
    gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 50%, ${alpha * 0.8})`)
    gradient.addColorStop(1, `hsla(${this.hue}, 100%, 30%, 0)`)
    c.fillStyle = gradient
    c.beginPath()
    c.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    c.fill()
    // Dibujar un punto más brillante en el centro
    c.fillStyle = `hsla(${this.hue}, 100%, 90%, ${alpha})`
    c.beginPath()
    c.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }

  isDead() {
    return this.life <= 0
  }
}

// Las funciones de rounds y timer se movieron a index.js para acceso a variables de round
