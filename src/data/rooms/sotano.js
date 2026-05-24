// Sótano. Oscuro. Cuarto de calderas. Tuberías. Pista de secretos del cole.

export const ROOM_SOTANO = {
  worldWidth: 480,
  worldHeight: 180,
  bgColor: '#0a0a14',

  interior: {
    wallColor: 0x2a2a2a,
    baseboardColor: 0x000000,
    baseboardH: 6,
    floorTop: 160,
    ceilingHeight: 18,
    ceilingColor: 0x000000,
  },

  lambrin: {
    y: 130, h: 30, color: 0x1a1a1a,
    railY: 128, railH: 2, railColor: 0x4a4a4a,
  },

  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 80,  y: 22, tex: 'lamp' },
    { x: 240, y: 22, tex: 'lamp' },
    { x: 400, y: 22, tex: 'lamp' },
    // Cajas / papeleras a modo de bultos
    { x: 64,  y: 150, tex: 'bin' },
    { x: 120, y: 150, tex: 'bin' },
    { x: 320, y: 150, tex: 'bin' },
    { x: 380, y: 150, tex: 'bin' },
    // Tubo grueso simulado con dos rectángulos
    { x: 200, y: 80, tex: 'shelf' },
    { x: 280, y: 80, tex: 'shelf' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 472, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [],
};
