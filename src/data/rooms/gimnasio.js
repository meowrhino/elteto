// Gimnasio. Grande, eco, suelo de madera, canchas marcadas.

export const ROOM_GIMNASIO = {
  worldWidth: 640,
  worldHeight: 180,
  bgColor: '#4a3a2a',

  interior: {
    wallColor: 0xb0a080,
    baseboardColor: 0x4a3a2a,
    baseboardH: 6,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x1a1a1a,
  },

  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 80,  y: 22, tex: 'lamp' },
    { x: 240, y: 22, tex: 'lamp' },
    { x: 400, y: 22, tex: 'lamp' },
    { x: 560, y: 22, tex: 'lamp' },
    // Marcador (un poster grande)
    { x: 296, y: 50, tex: 'chalkboard_big' },
    // Pelota y otro elemento
    { x: 200, y: 154, tex: 'ball' },
    { x: 440, y: 154, tex: 'ball' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 216, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [],
};
