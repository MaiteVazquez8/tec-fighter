function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  // Actualizar física y posiciones
  if (player && enemy) {
    // 1. Aplicar gravedad
    const groundOffset = Math.max(60, canvas.height * 0.02)
    const groundLevel = canvas.height - groundOffset
    
    player.velocity.y += gravity
    enemy.velocity.y += gravity
    
    // 2. Actualizar posiciones basadas en velocidad
    player.position.x += player.velocity.x
    player.position.y += player.velocity.y
    enemy.position.x += enemy.velocity.x
    enemy.position.y += enemy.velocity.y
    
    // 3. Verificar colisión con el suelo
    if (player.position.y + player.height >= groundLevel) {
      player.velocity.y = 0
      player.position.y = groundLevel - player.height
      player.canJump = true
    } else {
      player.canJump = false
    }
    
    if (enemy.position.y + enemy.height >= groundLevel) {
      enemy.velocity.y = 0
      enemy.position.y = groundLevel - enemy.height
      enemy.canJump = true
    } else {
      enemy.canJump = false
    }

    // 4. Actualizar animaciones
    if (!player.dead) player.animateFrames()
    if (!enemy.dead) enemy.animateFrames()
  }

  // Actualizar y dibujar las chispas de choque de espadas
  sparks = sparks.filter(spark => {
    spark.update()
    spark.draw(c)
    return !spark.isDead()
  })

  // Sólo actualizar movimientos y lógica de juego si estamos en estado PLAY y no estamos en pausa
  if (state === STATE_PLAY && !isPaused) {
    // Reset velocidad X al inicio de cada frame (se establecerá según input)
    player.velocity.x = 0
    enemy.velocity.x = 0

    // player movement (velocidad original restaurada)
    if (keys.a.pressed && player.lastKey === 'a') {
      player.velocity.x = -8
      player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
      player.velocity.x = 8
      player.switchSprite('run')
    } else {
      player.switchSprite('idle')
    }

    // jumping
    if (player.velocity.y < 0) {
      player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
      player.switchSprite('fall')
    }

    // Enemy movement (velocidad original restaurada)
    if (keys.ArrowLeft.pressed) {
      enemy.velocity.x = -8
      enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed) {
      enemy.velocity.x = 8
      enemy.switchSprite('run')
    } else {
      enemy.switchSprite('idle')
    }

    // jumping
    if (enemy.velocity.y < 0) {
      enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
      enemy.switchSprite('fall')
    }

    // Limitar posición para que no salgan de la pantalla (tope lateral)
    const leftLimit = 0
    const rightLimit = canvas.width - 60
    player.position.x = Math.max(leftLimit, Math.min(player.position.x, rightLimit))
    enemy.position.x = Math.max(leftLimit, Math.min(enemy.position.x, rightLimit))
    
    // ORIENTACIÓN DEL PLAYER: Calcular independientemente
    // El player mira hacia donde está el enemy
    if (player.position.x < enemy.position.x) {
      // Player está a la izquierda del enemy: mirar a la derecha
      player.facingRight = true
    } else {
      // Player está a la derecha del enemy: mirar a la izquierda
      player.facingRight = false
    }
    
    // Calcular attackBox del PLAYER según su orientación
    if (player.image && player.image.complete && player.image.width > 0) {
      // Calcular dimensiones del sprite
      const playerFrameWidth = player.image.width / player.framesMax
      const playerSpriteWidth = playerFrameWidth * player.scale
      const playerDrawX = player.position.x - player.offset.x
      
      if (player.facingRight) {
        // Player mira a la derecha: hitbox debe estar a la DERECHA del sprite (donde está la espada)
        // Colocar hitbox desde el borde derecho del sprite, retrocediendo el offset
        player.attackBox.position.x = playerDrawX + playerSpriteWidth - player.attackBox.offset.x - player.attackBox.width
      } else {
        // Player mira a la izquierda (volteado): hitbox debe estar a la IZQUIERDA del sprite volteado
        // Cuando se voltea, la espada está a la izquierda, así que la hitbox también
        player.attackBox.position.x = playerDrawX + player.attackBox.offset.x
      }
      player.attackBox.position.y = player.position.y + player.attackBox.offset.y
    }

    // ORIENTACIÓN DEL ENEMY: Calcular independientemente
    // El enemy mira hacia donde está el player
    if (enemy.position.x < player.position.x) {
      // Enemy está a la izquierda del player: mirar a la izquierda (hacia el player)
      enemy.facingRight = false
    } else {
      // Enemy está a la derecha del player: mirar a la derecha (hacia el player)
      enemy.facingRight = true
    }
    
    // Calcular attackBox del ENEMY según su orientación
    if (enemy.image && enemy.image.complete && enemy.image.width > 0) {
      // Calcular dimensiones del sprite
      const enemyFrameWidth = enemy.image.width / enemy.framesMax
      const enemySpriteWidth = enemyFrameWidth * enemy.scale
      const enemyDrawX = enemy.position.x - enemy.offset.x
      
      if (enemy.facingRight) {
        // Enemy mira a la derecha (sprite normal): attackBox a la izquierda del sprite (offset negativo)
        // El offset negativo significa que la hitbox está a la izquierda del borde izquierdo del sprite
        enemy.attackBox.position.x = enemyDrawX + enemy.attackBox.offset.x
      } else {
        // Enemy mira a la izquierda (sprite volteado): attackBox a la derecha del sprite
        // Cuando el sprite se voltea, el offset negativo se refleja al lado derecho
        enemy.attackBox.position.x = (enemyDrawX + enemySpriteWidth) - Math.abs(enemy.attackBox.offset.x) - enemy.attackBox.width
      }
      enemy.attackBox.position.y = enemy.position.y + enemy.attackBox.offset.y
    }

    // Detectar si ambos están atacando (ampliar rango de frames para mejor detección)
    const playerAttacking = player.isAttacking && player.image === player.sprites.attack1.image && 
                           player.framesCurrent >= 1 && player.framesCurrent <= 4
    const enemyAttacking = enemy.isAttacking && enemy.image === enemy.sprites.attack1.image && 
                          enemy.framesCurrent >= 1 && enemy.framesCurrent <= 4

    // Verificar colisión entre attackBoxes (ahora con los attackBoxes correctamente posicionados)
    const attackBoxesCollide = attackBoxCollision({
      attackBox1: player.attackBox,
      attackBox2: enemy.attackBox
    })

    // Si ambos atacan y sus attackBoxes chocan, crear efecto de bloqueo con chispas
    const isBlockingNow = playerAttacking && enemyAttacking && attackBoxesCollide
    const isNewBlock = isBlockingNow && !wasBlockingLastFrame
    
    if (isNewBlock) {
      // Calcular punto de colisión (centro entre los dos attackBoxes)
      const collisionX = (player.attackBox.position.x + player.attackBox.width + enemy.attackBox.position.x) / 2
      const collisionY = (player.attackBox.position.y + enemy.attackBox.position.y + 
                         (player.attackBox.height + enemy.attackBox.height) / 2) / 2

      // Crear múltiples chispas en el punto de colisión
      for (let i = 0; i < 25; i++) {
        sparks.push(new Spark(collisionX, collisionY))
      }

      // Hacer que los personajes retrocedan ligeramente (velocidad reducida)
      if (player.position.x < enemy.position.x) {
        player.velocity.x = -2
        enemy.velocity.x = 2
      } else {
        player.velocity.x = 2
        enemy.velocity.x = -2
      }
    }
    
    // Actualizar el flag para el siguiente frame
    wasBlockingLastFrame = isBlockingNow
    
    // Lógica de daño normal (solo si NO hay bloqueo activo)
    if (!isBlockingNow) {
      // detect for collision & enemy gets hit
      // Solo aplicar daño si el ataque está en frames activos Y aún no ha golpeado
      if (
        player.isAttacking &&
        player.framesCurrent >= 1 && player.framesCurrent <= 4 &&
        !player.attackHit
      ) {
        // Marcar que los frames activos han empezado
        if (!player.attackActiveFramesStart) {
          player.attackActiveFramesStart = true
        }
        
        // Verificar colisión solo durante los frames activos
        if (rectangularCollision({
          rectangle1: player,
          rectangle2: enemy
        })) {
          enemy.takeHit()
          player.attackHit = true // Marcar que el ataque ya golpeó
          player.isAttacking = false

          gsap.to('#enemyHealth', {
            width: enemy.health + '%'
          })
        }
      }
      
      // Si el ataque pasó los frames activos sin golpear, marcar como fallido
      if (player.isAttacking && player.attackActiveFramesStart && player.framesCurrent > 4) {
        player.attackHit = true // Marcar como "usado" para evitar hits tardíos
      }

      // this is where our player gets hit
      // Solo aplicar daño si el ataque está en frames activos Y aún no ha golpeado
      if (
        enemy.isAttacking &&
        enemy.framesCurrent >= 1 && enemy.framesCurrent <= 4 &&
        !enemy.attackHit
      ) {
        // Marcar que los frames activos han empezado
        if (!enemy.attackActiveFramesStart) {
          enemy.attackActiveFramesStart = true
        }
        
        // Verificar colisión solo durante los frames activos
        if (rectangularCollision({
          rectangle1: enemy,
          rectangle2: player
        })) {
          player.takeHit()
          enemy.attackHit = true // Marcar que el ataque ya golpeó
          enemy.isAttacking = false

          gsap.to('#playerHealth', {
            width: player.health + '%'
          })
        }
      }
      
      // Si el ataque pasó los frames activos sin golpear, marcar como fallido
      if (enemy.isAttacking && enemy.attackActiveFramesStart && enemy.framesCurrent > 4) {
        enemy.attackHit = true // Marcar como "usado" para evitar hits tardíos
      }
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent >= 5) {
      player.isAttacking = false
    }

    // if enemy misses
    if (enemy.isAttacking && enemy.framesCurrent >= 4) {
      enemy.isAttacking = false
    }

    // end round based on health or timer
    if (!roundEnded && (enemy.health <= 0 || player.health <= 0 || timer === 0)) {
      determineRoundWinner()
    }
  } else {
    // No estamos en PLAY o estamos en pausa: establecer sprites en idle
    if (player) player.switchSprite('idle')
    if (enemy) enemy.switchSprite('idle')
  }

  // ORIENTACIÓN FINAL DEL PLAYER antes de dibujar
  if (player && enemy) {
    // Player mira hacia donde está el enemy
    if (player.position.x < enemy.position.x) {
      player.facingRight = true  // Player a la izquierda: mirar derecha
    } else {
      player.facingRight = false // Player a la derecha: mirar izquierda
    }
  }
  
  // ORIENTACIÓN FINAL DEL ENEMY antes de dibujar
  if (player && enemy) {
    // Enemy mira hacia donde está el player
    if (enemy.position.x < player.position.x) {
      enemy.facingRight = false  // Enemy a la izquierda: mirar derecha
    } else {
      enemy.facingRight = true // Enemy a la derecha: mirar izquierda
    }
  }
  
  // Dibujar personajes
  if (player) {
    player.draw()
  }
  if (enemy) {
    enemy.draw()
  }

  // ============================================
  // DIBUJAR HITBOXES PARA DEBUGGING (COMENTADO)
  // ============================================
  // Para ver las hitboxes, descomenta todo el bloque de código de abajo
  // Este bloque dibuja rectángulos semitransparentes sobre los personajes
  // para visualizar las áreas de colisión. Solo se muestran durante el juego (STATE_PLAY)
  /*
  if (player && enemy && state === STATE_PLAY) {
    
    // HITBOX DE ATAQUE DEL PLAYER (Rojo)
    // Dibuja un rectángulo rojo semitransparente que muestra el área de ataque del player
    // Este es el área que causa daño cuando colisiona con el cuerpo del enemy
    c.fillStyle = 'rgba(255, 0, 0, 0.3)' // Rojo semitransparente (30% opacidad)
    c.fillRect(
      player.attackBox.position.x,      // Posición X de la hitbox de ataque
      player.attackBox.position.y,      // Posición Y de la hitbox de ataque
      player.attackBox.width,           // Ancho de la hitbox de ataque
      player.attackBox.height           // Alto de la hitbox de ataque
    )
    // Dibujar borde rojo para mejor visibilidad
    c.strokeStyle = 'red'
    c.lineWidth = 2
    c.strokeRect(
      player.attackBox.position.x,
      player.attackBox.position.y,
      player.attackBox.width,
      player.attackBox.height
    )

    // HITBOX DE ATAQUE DEL ENEMY (Azul)
    // Dibuja un rectángulo azul semitransparente que muestra el área de ataque del enemy
    // Este es el área que causa daño cuando colisiona con el cuerpo del player
    c.fillStyle = 'rgba(0, 0, 255, 0.3)' // Azul semitransparente (30% opacidad)
    c.fillRect(
      enemy.attackBox.position.x,       // Posición X de la hitbox de ataque
      enemy.attackBox.position.y,       // Posición Y de la hitbox de ataque
      enemy.attackBox.width,            // Ancho de la hitbox de ataque
      enemy.attackBox.height            // Alto de la hitbox de ataque
    )
    // Dibujar borde azul para mejor visibilidad
    c.strokeStyle = 'blue'
    c.lineWidth = 2
    c.strokeRect(
      enemy.attackBox.position.x,
      enemy.attackBox.position.y,
      enemy.attackBox.width,
      enemy.attackBox.height
    )

    // HITBOX DEL CUERPO DEL PLAYER (Amarillo)
    // Dibuja un rectángulo amarillo que muestra el área vulnerable del cuerpo del player
    // Este es el área que recibe daño cuando es golpeada por el attackBox del enemy
    // La hitbox está reducida (15% ancho, 30% alto) para que sea más precisa
    if (player.image && player.image.complete && player.image.width > 0) {
      // Calcular dimensiones del sprite del player
      const playerFrameWidth = player.image.width / player.framesMax
      const playerSpriteWidth = playerFrameWidth * player.scale
      const playerDrawX = player.position.x - player.offset.x
      const playerDrawY = player.position.y - player.offset.y
      const playerSpriteHeight = player.image.height * player.scale
      
      // Reducir tamaño de la hitbox del cuerpo (15% ancho, 30% alto del sprite)
      const bodyHitboxWidth = playerSpriteWidth * 0.15
      const bodyHitboxHeight = playerSpriteHeight * 0.30
      // Centrar la hitbox en el sprite
      const bodyHitboxX = playerDrawX + (playerSpriteWidth - bodyHitboxWidth) / 2
      const bodyHitboxY = playerDrawY + (playerSpriteHeight - bodyHitboxHeight) / 2
      
      // Dibujar rectángulo amarillo semitransparente
      c.fillStyle = 'rgba(255, 255, 0, 0.2)' // Amarillo semitransparente (20% opacidad)
      c.fillRect(bodyHitboxX, bodyHitboxY, bodyHitboxWidth, bodyHitboxHeight)
      // Dibujar borde amarillo para mejor visibilidad
      c.strokeStyle = 'yellow'
      c.lineWidth = 1
      c.strokeRect(bodyHitboxX, bodyHitboxY, bodyHitboxWidth, bodyHitboxHeight)
    }

    // HITBOX DEL CUERPO DEL ENEMY (Verde)
    // Dibuja un rectángulo verde que muestra el área vulnerable del cuerpo del enemy
    // Este es el área que recibe daño cuando es golpeada por el attackBox del player
    // La hitbox está reducida (15% ancho, 30% alto) para que sea más precisa
    if (enemy.image && enemy.image.complete && enemy.image.width > 0) {
      // Calcular dimensiones del sprite del enemy
      const enemyFrameWidth = enemy.image.width / enemy.framesMax
      const enemySpriteWidth = enemyFrameWidth * enemy.scale
      const enemyDrawX = enemy.position.x - enemy.offset.x
      const enemyDrawY = enemy.position.y - enemy.offset.y
      const enemySpriteHeight = enemy.image.height * enemy.scale
      
      // Reducir tamaño de la hitbox del cuerpo (15% ancho, 30% alto del sprite)
      const bodyHitboxWidth = enemySpriteWidth * 0.15
      const bodyHitboxHeight = enemySpriteHeight * 0.30
      // Centrar la hitbox en el sprite
      const bodyHitboxX = enemyDrawX + (enemySpriteWidth - bodyHitboxWidth) / 2
      const bodyHitboxY = enemyDrawY + (enemySpriteHeight - bodyHitboxHeight) / 2
      
      // Dibujar rectángulo verde semitransparente
      c.fillStyle = 'rgba(0, 255, 0, 0.2)' // Verde semitransparente (20% opacidad)
      c.fillRect(bodyHitboxX, bodyHitboxY, bodyHitboxWidth, bodyHitboxHeight)
      // Dibujar borde verde para mejor visibilidad
      c.strokeStyle = 'green'
      c.lineWidth = 1
      c.strokeRect(bodyHitboxX, bodyHitboxY, bodyHitboxWidth, bodyHitboxHeight)
    }
  }
  */
  // ============================================
  // FIN DE DIBUJADO DE HITBOXES (COMENTADO)
  // ============================================
}

