# TEC FIGHTER

TEC FIGHTER es un juego de lucha local para dos personas, inspirado en los juegos arcade de pixel art. Cada jugador controla a un luchador en la misma arena. La partida se disputa en tres rounds y gana quien se imponga en más rounds.

## Equipo de desarrollo

- **ALVAREZ SANTIAGO** — Desarrollador
- **MAITE VAZQUEZ** — Desarrolladora / Documentación
- **NAYLA GOMEZ** — Marketing / Documentación

## Cómo ejecutar el juego

No hace falta instalar dependencias ni compilar el proyecto:

1. Clona o descarga este repositorio.
2. Abre `index.html` en un navegador moderno.
3. En la primera visita se muestra `intro.html`. Pulsa **Comenzar juego** para abrir el menú.
4. Pulsa **Jugar** o consulta **Cómo jugar** para ver los controles.

También se puede servir la carpeta desde un servidor web local. Para probarlo directamente como archivos (`file://`), el navegador puede restringir cookies; en ese caso el juego usa `localStorage` como alternativa para recordar que ya se mostró la introducción.

La fuente pixel art se carga desde Google Fonts y GSAP se carga desde CDN, por lo que esas dos dependencias externas requieren conexión a Internet. Los gráficos del juego están en `img/`.

## Estructura del proyecto

```text
.
├── index.html              # Menús, HUD, canvas y carga de scripts
├── index.js                # Estado, reglas, controles y bucle de juego
├── intro.html              # Introducción y presentación del equipo
├── css/
│   ├── style.css           # Estilos del juego y sus menús
│   └── intro.css           # Estilos de la introducción
├── js/
│   ├── classes.js          # Clases Sprite y Fighter
│   └── utils.js            # Colisiones y partículas Spark
└── img/
    ├── TF-bg.png           # Fondo de la arena
    ├── shop.png            # Elemento animado de la arena
    ├── samuraiMack/        # Sprites y animaciones del jugador 1
    └── kenji/              # Sprites y animaciones del jugador 2
```

## Cómo funciona el juego

- El canvas mantiene un espacio de juego de **1024 × 576** (16:9). CSS adapta el tamaño visible sin cambiar esa proporción.
- `index.html` contiene el menú principal, las instrucciones, la pausa, el resultado final y el HUD de vida y tiempo.
- El juego empieza en el menú. Al iniciar, se reinician la vida, el tiempo y los rounds, y empieza una partida de 60 segundos por round.
- Hay hasta **tres rounds**. Cada golpe acertado quita 20 puntos de vida. Si el tiempo llega a cero, gana el round quien tenga más vida; si alguien llega a cero, el round termina.
- Entre rounds se muestra el resultado y una cuenta regresiva de tres segundos. Al terminar el último round, se espera un segundo y se muestra el resultado de la partida.
- Si ambos luchadores atacan al mismo tiempo y chocan sus áreas de ataque, se bloquean y aparecen partículas de chispa.
- `Escape` pausa y reanuda la partida. El botón de reinicio de partida también está disponible en los menús.

## Controles

| Acción | Jugador 1 | Jugador 2 |
|---|---|---|
| Moverse | `A` / `D` | `←` / `→` |
| Saltar | `W` | `↑` |
| Atacar | `S` | `↓` |
| Pausar / continuar | `Escape` | `Escape` |

## JavaScript: piezas importantes

### `index.js`

Es el punto de entrada de la lógica del juego. El orden de scripts al final de `index.html` es importante: primero se cargan `utils.js` y `classes.js`, y después `index.js`, que usa sus clases y funciones.

- El canvas y el contexto 2D se guardan en `canvas` y `c`.
- Las instancias `player`, `enemy`, `background` y `shop` representan los elementos de la arena.
- `state` distingue el menú, las instrucciones y la partida; `isPaused`, `roundEnded` y `gameEnded` ayudan a controlar las transiciones.
- `animate()` usa `requestAnimationFrame` para actualizar la física, procesar movimiento y colisiones, y dibujar cada frame.
- Los eventos `keydown` y `keyup` leen los controles. Los controles de los luchadores solo se aceptan durante una partida activa.
- `decreaseTimer()` actualiza el tiempo; `determineRoundWinner()`, `nextRound()` y `endGame()` coordinan la puntuación y los cambios entre rounds.
- `startGame()` y `resetGame()` inicializan el estado de una partida nueva. Los temporizadores de round y del resultado final se cancelan al reiniciar o volver al menú.
- GSAP se usa para animar el ancho de las barras de vida cuando un luchador recibe daño.

### `js/classes.js`

- `Sprite` dibuja una imagen o una hoja de sprites y avanza sus frames de animación.
- `Fighter` extiende `Sprite` y añade vida, velocidad, orientación, salto, ataque y selección de animaciones.
- Las imágenes de animación se configuran por luchador en `index.js`, indicando la ruta y la cantidad de frames de cada hoja.

### `js/utils.js`

- `rectangularCollision()` comprueba si un ataque alcanza la hitbox del cuerpo del rival.
- `attackBoxCollision()` comprueba el choque entre los ataques de ambos luchadores.
- `getBodyHitbox()` calcula un área vulnerable más pequeña que el sprite visible.
- `Spark` actualiza y dibuja las partículas que aparecen cuando se bloquean ataques.

## Primera visita

`index.html` busca la marca `tecFighterIntroSeen`. En una web publicada se guarda mediante una cookie que dura un año; si las cookies no están disponibles, se intenta usar `localStorage`. `intro.html` también guarda la marca cuando se visita directamente para que su botón **Comenzar juego** no provoque una redirección repetida.

Para volver a ver la introducción, elimina la cookie `tecFighterIntroSeen` y, si el navegador está ejecutando los archivos con `file://`, elimina también la entrada `tecFighterIntroSeen` de `localStorage`.