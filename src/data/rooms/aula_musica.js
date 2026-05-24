// Aula de música. Como el aula normal pero con instrumentos.

export const ROOM_AULA_MUSICA = {
  worldWidth: 480,
  worldHeight: 180,
  bgColor: '#1a2a3a',

  interior: {
    wallColor: 0x5a6a90,
    baseboardColor: 0x1a2a3a,
    baseboardH: 4,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x0a1a2a,
  },

  lambrin: {
    y: 116, h: 40, color: 0x4a5a80,
    railY: 114, railH: 2, railColor: 0x6b4226,
  },

  windows: [
    { x: 24, y: 48, w: 56, h: 40, scrollFactor: 0.55 },
  ],

  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 180, y: 44, tex: 'chalkboard_big' },
    { x: 296, y: 50, tex: 'clock' },
    { x: 412, y: 56, tex: 'poster' },
    // El instrumental: usamos teacher_desk como piano de pie
    { x: 120, y: 142, tex: 'teacher_desk' },
    { x: 200, y: 142, tex: 'teacher_desk' },
    // Sillas
    { x: 263, y: 151, tex: 'chair' },
    { x: 343, y: 151, tex: 'chair' },
    { x: 260, y: 150, tex: 'desk' },
    { x: 340, y: 150, tex: 'desk' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 280, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [],
};
