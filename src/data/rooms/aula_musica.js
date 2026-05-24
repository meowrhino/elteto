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
    { x: 180, y: 44, tex: 'chalkboard_big' },     // pizarra con partituras escritas
    { x: 296, y: 50, tex: 'clock' },
    { x: 412, y: 56, tex: 'poster' },
    // Piano vertical en el centro
    { x: 116, y: 140, tex: 'piano' },
    // Atriles para alumnos
    { x: 220, y: 142, tex: 'music_stand' },
    { x: 290, y: 142, tex: 'music_stand' },
    { x: 360, y: 142, tex: 'music_stand' },
    // Sillas para los músicos
    { x: 222, y: 151, tex: 'chair' },
    { x: 292, y: 151, tex: 'chair' },
    { x: 362, y: 151, tex: 'chair' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 280, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [
    { x: 180, y: 128, id: 'luz', name: 'Luz', sprite: 'luz' },
  ],
};
