const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Keep the game world in the same 16:9 proportions as its background art.
canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 1.4
let gameEnded = false

// Nuevo: estado de pausa
let isPaused = false

// Array para almacenar las chispas de choque de espadas
let sparks = []

// Variable para evitar múltiples detecciones del mismo choque
let wasBlockingLastFrame = false

// Nuevos estados
const STATE_MENU = 'menu'
const STATE_INSTRUCTIONS = 'instructions'
const STATE_PLAY = 'play'

let state = STATE_MENU

// Sistema de rounds
let currentRound = 1
const maxRounds = 3
let playerWins = 0
let enemyWins = 0
let roundEnded = false


const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: './img/TF-bg.png',
  isBackground: true
})

// Calculate initial scales based on screen size
const baseShopScale = 2.75
const baseFighterScale = 2.5
const screenScale = Math.min(canvas.width / 1024, canvas.height / 576)

// Calculate ground level for positioning (same as in Fighter class)
const groundOffset = Math.max(96, canvas.height * 0.15)
const groundLevel = canvas.height - groundOffset

const shop = new Sprite({
  position: {
    x: canvas.width * 0.65,
    y: groundLevel - 320 // Position shop on the ground
  },
  imageSrc: './img/shop.png',
  scale: baseShopScale * screenScale,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: canvas.width * 0.35, // Position player towards left-center
    y: groundLevel - 150 // Start on ground
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/TF-Idle.png',
  framesMax: 4,
  scale: baseFighterScale * screenScale,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/TF-Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/samuraiMack/TF-Run.png',
      framesMax: 6
    },
    jump: {
      imageSrc: './img/samuraiMack/TF-Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/TF-Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/TF-Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/TF-Death.png',
      framesMax: 5
    }
  },
  attackBox: {
    offset: {
      x: 60,
      y: 100
    },
    width: 200,
    height: 25
  }
})

const enemy = new Fighter({
  position: {
    x: canvas.width * 0.60, // Position enemy towards right-center
    y: groundLevel - 150 // Start on ground
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/TF-Idle-2.png',
  framesMax: 4,
  scale: baseFighterScale * screenScale,
  offset: {
    x: 215,
    y: 172
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/TF-Idle-2.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/TF-Run-2.png',
      framesMax: 6
    },
    jump: {
      imageSrc: './img/kenji/TF-Jump-2.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/TF-Fall-2.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/TF-Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/TF-Take Hit - white silhouette-2.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 60,
      y: 100
    },
    width: 200,
    height: 25
  }
})


const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

