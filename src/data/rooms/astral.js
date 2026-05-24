// El astral. Plano "entre" el mundo material y el más allá.
// Visualmente: estrellas, fantasmas, geometría rara.
// (Solo accesible con modo visión activado.)

export const ROOM_ASTRAL = {
  worldWidth: 480,
  worldHeight: 180,
  bgColor: '#101030',

  interior: {
    wallColor: 0x202050,
    baseboardColor: 0x101030,
    baseboardH: 4,
    floorTop: 160,
    ceilingHeight: 8,
    ceilingColor: 0x000010,
  },

  floorY: 160,
  floorTex: 'lattice',

  decor: [
    // Estrellas (lámparas dispersas)
    { x: 40,  y: 14, tex: 'lamp' },
    { x: 120, y: 30, tex: 'lamp' },
    { x: 200, y: 14, tex: 'lamp' },
    { x: 280, y: 50, tex: 'lamp' },
    { x: 360, y: 22, tex: 'lamp' },
    { x: 440, y: 40, tex: 'lamp' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Aula', spawnX: 60, spawnY: 144, label: 'volver' },
  ],

  npcs: [],
};
