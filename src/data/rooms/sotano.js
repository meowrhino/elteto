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
    // Calderas a los lados
    { x: 80,  y: 136, tex: 'boiler' },
    { x: 380, y: 136, tex: 'boiler' },
    // Tuberías cruzando arriba
    { x: 32,  y: 60, tex: 'pipe' },
    { x: 192, y: 60, tex: 'pipe' },
    { x: 352, y: 60, tex: 'pipe' },
    // Más tuberías en otra altura
    { x: 112, y: 90, tex: 'pipe' },
    { x: 272, y: 90, tex: 'pipe' },
    // Papeleras como cajas/bultos
    { x: 180, y: 150, tex: 'bin' },
    { x: 220, y: 150, tex: 'bin' },
    { x: 260, y: 150, tex: 'bin' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 472, spawnY: 144, label: 'pasillo' },
  ],

  ambient: { dust: true },

  npcs: [
    { x: 220, y: 128, id: 'fantasma', name: '???', sprite: 'fantasma' },
  ],
};
