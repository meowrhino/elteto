// Salón de actos. Escenario al fondo, butacas al frente, cortina roja.

export const ROOM_SALON_ACTOS = {
  worldWidth: 640,
  worldHeight: 180,
  bgColor: '#1a0a14',

  interior: {
    wallColor: 0x4a1a2a,
    baseboardColor: 0x1a0a14,
    baseboardH: 6,
    floorTop: 160,
    ceilingHeight: 18,
    ceilingColor: 0x0a0408,
  },

  // "Cortina" — una banda roja oscura en la parte alta
  lambrin: {
    y: 30, h: 24, color: 0x7a1f1f,
    railY: 54, railH: 2, railColor: 0xddaa44,
  },

  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 80,  y: 22, tex: 'lamp' },
    { x: 240, y: 22, tex: 'lamp' },
    { x: 400, y: 22, tex: 'lamp' },
    { x: 560, y: 22, tex: 'lamp' },
    // Butacas (sillas)
    { x: 80,  y: 151, tex: 'chair' },
    { x: 100, y: 151, tex: 'chair' },
    { x: 120, y: 151, tex: 'chair' },
    { x: 180, y: 151, tex: 'chair' },
    { x: 200, y: 151, tex: 'chair' },
    { x: 220, y: 151, tex: 'chair' },
    { x: 280, y: 151, tex: 'chair' },
    { x: 300, y: 151, tex: 'chair' },
    { x: 320, y: 151, tex: 'chair' },
    // Escenario simbolizado por mesa de profe
    { x: 440, y: 142, tex: 'teacher_desk' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 344, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [
    { x: 460, y: 128, id: 'galan', name: 'Galán', sprite: 'galan' },
  ],
};
