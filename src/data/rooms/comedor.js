// Comedor del cole. Mesas largas, mostrador al fondo, olor a sopa.

export const ROOM_COMEDOR = {
  worldWidth: 480,
  worldHeight: 180,
  bgColor: '#3a2a1a',

  interior: {
    wallColor: 0x8a6a4a,
    baseboardColor: 0x3a2a1a,
    baseboardH: 6,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x2a1a08,
  },

  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 80,  y: 22, tex: 'lamp' },
    { x: 240, y: 22, tex: 'lamp' },
    { x: 400, y: 22, tex: 'lamp' },
    // Máquina de refrescos a la derecha
    { x: 432, y: 128, tex: 'soda_machine' },
    // Mesas largas con bandejas encima
    { x: 60,  y: 144, tex: 'reading_table' },
    { x: 200, y: 144, tex: 'reading_table' },
    { x: 340, y: 144, tex: 'reading_table' },
    { x: 68,  y: 140, tex: 'tray' },
    { x: 80,  y: 140, tex: 'tray' },
    { x: 208, y: 140, tex: 'tray' },
    { x: 348, y: 140, tex: 'tray' },
    // Sillas
    { x: 60,  y: 151, tex: 'chair' },
    { x: 80,  y: 151, tex: 'chair' },
    { x: 200, y: 151, tex: 'chair' },
    { x: 220, y: 151, tex: 'chair' },
    { x: 340, y: 151, tex: 'chair' },
    { x: 360, y: 151, tex: 'chair' },
    // Reloj en la pared
    { x: 232, y: 60, tex: 'clock' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 152, spawnY: 144, label: 'pasillo' },
  ],

  npcs: [
    { x: 440, y: 128, id: 'pepa', name: 'Pepa', sprite: 'pepa' },
  ],
};
