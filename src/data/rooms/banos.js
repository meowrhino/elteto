// Baños del cole. Pequeño, frío, ecos.

export const ROOM_BANOS = {
  worldWidth: 320,
  worldHeight: 180,
  bgColor: '#2a3540',

  interior: {
    wallColor: 0x6a8090,
    baseboardColor: 0x2a3540,
    baseboardH: 6,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x1a2530,
  },

  // Azulejo: banda azul claro en mitad inferior
  lambrin: {
    y: 110, h: 46, color: 0x88aac0,
    railY: 108, railH: 2, railColor: 0x4a5a70,
  },

  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 32,  y: 22, tex: 'lamp' },
    { x: 144, y: 22, tex: 'lamp' },
    { x: 256, y: 22, tex: 'lamp' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 88, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [],
};
