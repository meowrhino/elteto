// Sueño de Pablo. Dimensión paralela tipo Moonside (Earthbound).
// Paredes negras, neones, suelo cuadriculado raro.
// (Solo accesible cuando la historia lo activa.)

export const ROOM_SUENO_PABLO = {
  worldWidth: 480,
  worldHeight: 180,
  bgColor: '#000000',

  interior: {
    wallColor: 0x080020,
    baseboardColor: 0x000000,
    baseboardH: 4,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x000000,
  },

  // Banda neon
  lambrin: {
    y: 116, h: 40, color: 0x200030,
    railY: 114, railH: 2, railColor: 0xff00aa,
  },

  floorY: 160,
  floorTex: 'lattice', // cuadriculado raro

  decor: [
    // Lámparas como "estrellas / neones"
    { x: 60,  y: 30, tex: 'lamp' },
    { x: 180, y: 50, tex: 'lamp' },
    { x: 300, y: 30, tex: 'lamp' },
    { x: 420, y: 50, tex: 'lamp' },
    // Pizarra: el espejo donde Pablo se ve a sí mismo
    { x: 200, y: 70, tex: 'chalkboard_big' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Patio', spawnX: 120, spawnY: 144, label: 'despertar' },
  ],

  npcs: [],
};
