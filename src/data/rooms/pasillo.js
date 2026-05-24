// Pasillo principal del cole. Conector central a las demás estancias.
// Ancho (640) para que las múltiples puertas no se amontonen.

export const ROOM_PASILLO = {
  worldWidth: 640,
  worldHeight: 180,
  bgColor: '#1f1f33',

  interior: {
    wallColor: 0x6a5a4a,
    baseboardColor: 0x3a2a1a,
    baseboardH: 4,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x2a2018,
  },

  // Banda decorativa horizontal de zócalo más alto
  lambrin: {
    y: 120, h: 36, color: 0x8a6a3a,
    railY: 118, railH: 2, railColor: 0x5a3a1a,
  },

  floorY: 160,
  floorTex: 'tile',

  // Lámparas distribuidas en el techo + posters en pared
  decor: [
    { x: 80,  y: 22, tex: 'lamp' },
    { x: 240, y: 22, tex: 'lamp' },
    { x: 400, y: 22, tex: 'lamp' },
    { x: 560, y: 22, tex: 'lamp' },
    { x: 64,  y: 70, tex: 'poster' },
    { x: 320, y: 70, tex: 'poster' },
    { x: 576, y: 70, tex: 'poster' },
    { x: 160, y: 50, tex: 'map' },
    { x: 448, y: 50, tex: 'clock' },
  ],

  // Cada puerta lleva a una sala distinta. Los spawns están al inicio del pasillo
  // (x=spawnX, y=144) para que entrar nuevo te ponga frente a la puerta.
  doors: [
    { x: 8,   y: 136, target: 'Patio',       spawnX: 600, spawnY: 144, label: 'patio' },
    { x: 72,  y: 136, target: 'Banos',       spawnX: 40,  spawnY: 144, label: 'baños' },
    { x: 136, y: 136, target: 'Comedor',     spawnX: 40,  spawnY: 144, label: 'comedor' },
    { x: 200, y: 136, target: 'Gimnasio',    spawnX: 40,  spawnY: 144, label: 'gimnasio' },
    { x: 264, y: 136, target: 'AulaMusica',  spawnX: 40,  spawnY: 144, label: 'música' },
    { x: 328, y: 136, target: 'SalonActos',  spawnX: 40,  spawnY: 144, label: 'salón actos' },
    { x: 392, y: 136, target: 'Azotea',      spawnX: 40,  spawnY: 144, label: 'azotea' },
    { x: 456, y: 136, target: 'Sotano',      spawnX: 40,  spawnY: 144, label: 'sótano' },
    { x: 520, y: 136, target: 'CuartoProta', spawnX: 40,  spawnY: 144, label: 'tu cuarto' },
    { x: 584, y: 136, target: 'Aula',        spawnX: 40,  spawnY: 144, label: 'aula' },
  ],

  npcs: [
    { x: 480, y: 128, id: 'manolo', name: 'Manolo', sprite: 'manolo' },
  ],
};
