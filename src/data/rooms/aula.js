// Datos planos del Aula. La clase Aula los carga con buildFromData() y
// añade lo que requiere lógica (Nivea con onTalk dinámico).

export const ROOM_AULA = {
  worldWidth: 480,
  worldHeight: 180,
  bgColor: '#2a2440',

  // Interior (pared + zócalo + techo)
  interior: {
    wallColor: 0x5e567a,
    baseboardColor: 0x2a2440,
    baseboardH: 4,
    floorTop: 160,
    ceilingHeight: 14,
    ceilingColor: 0x3a3548,
  },

  // Lambrín: banda en la mitad inferior de la pared
  lambrin: {
    y: 116, h: 40, color: 0x4a4566,
    railY: 114, railH: 2, railColor: 0x6b4226,
  },

  // Ventanas con vista al exterior
  windows: [
    { x: 24, y: 48, w: 56, h: 40, scrollFactor: 0.55 },
  ],

  // Suelo
  floorY: 160,
  floorTex: 'tile',

  // Decoración (sillas antes que pupitres para depth ordering)
  decor: [
    { x: 180, y: 44,  tex: 'chalkboard_big' },
    { x: 296, y: 50,  tex: 'clock' },
    { x: 412, y: 56,  tex: 'poster' },
    { x: 112, y: 142, tex: 'teacher_desk' },
    { x: 123, y: 151, tex: 'chair' },
    { x: 203, y: 151, tex: 'chair' },
    { x: 283, y: 151, tex: 'chair' },
    { x: 363, y: 151, tex: 'chair' },
    { x: 120, y: 150, tex: 'desk' },
    { x: 200, y: 150, tex: 'desk' },
    { x: 280, y: 150, tex: 'desk' },
    { x: 360, y: 150, tex: 'desk' },
  ],

  // Puertas
  doors: [
    { x: 8,   y: 136, target: 'Biblioteca', spawnX: 440, spawnY: 144, label: 'biblioteca' },
    { x: 456, y: 136, target: 'Patio',      spawnX: 40,  spawnY: 144, label: 'patio' },
  ],

  // NPCs planos (alumnos secundarios). Nivea va con onTalk → la añade
  // la clase Aula programáticamente.
  npcs: [
    { x: 208, y: 128, id: 'marta', name: 'Marta', sprite: 'marta' },
    { x: 288, y: 128, id: 'dani',  name: 'Dani',  sprite: 'dani'  },
    { x: 368, y: 128, id: 'lucas', name: 'Lucas', sprite: 'lucas' },
  ],
};
