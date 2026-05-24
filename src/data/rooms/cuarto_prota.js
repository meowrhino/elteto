// El cuarto del protagonista. Pequeño, íntimo. Aquí descansa.
// (En el futuro: dormir = avanzar día/capítulo.)

export const ROOM_CUARTO_PROTA = {
  worldWidth: 320,
  worldHeight: 180,
  bgColor: '#2a1f3a',

  interior: {
    wallColor: 0x8a6aaa,
    baseboardColor: 0x2a1f3a,
    baseboardH: 4,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x1a0f2a,
  },

  lambrin: {
    y: 110, h: 46, color: 0x6a4a8a,
    railY: 108, railH: 2, railColor: 0x6b4226,
  },

  windows: [
    { x: 24, y: 48, w: 56, h: 40, scrollFactor: 0.55,
      skyColor: 0x2a2a4a, hillColor: 0x1a1a2a },
  ],

  floorY: 160,
  floorTex: 'tile',

  decor: [
    { x: 60,  y: 22, tex: 'lamp' },
    { x: 200, y: 22, tex: 'lamp' },
    // Cama del protagonista
    { x: 220, y: 148, tex: 'bed' },
    // Escritorio con silla
    { x: 100, y: 142, tex: 'teacher_desk' },
    { x: 103, y: 151, tex: 'chair' },
    // Estantería con sus cosas
    { x: 150, y: 128, tex: 'shelf' },
    // Pósters en la pared
    { x: 88,  y: 56, tex: 'band_poster' },
    { x: 140, y: 60, tex: 'poster' },
    { x: 184, y: 56, tex: 'band_poster' },
  ],

  doors: [
    { x: 8, y: 136, target: 'Pasillo', spawnX: 536, spawnY: 144, label: 'salir' },
  ],

  npcs: [
    { x: 230, y: 138, id: 'peluche', name: 'Peluche', sprite: 'peluche' },
  ],
};
