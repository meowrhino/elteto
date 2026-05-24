// Configuración de enemigos en un solo sitio.
// Cada entrada se reutiliza en la sala (Patio.addPablo, Biblioteca, etc.)
// Y en CombatScene cuando arranca el combate.
//
// Campos:
//   id        — clave única para registry.defeated[id]
//   name      — nombre visible
//   hp, atk   — stats
//   special   — opcional. 'pablo' habilita la mecánica de Hablar/Anillo.
//   texture   — opcional. Textura estática (ej. 'book_enemy').
//   charSprite — opcional. Spec de sprite para la factory de characters.js.
//   dialogue  — opcional. Líneas si tiene Hablar genérico.

export const PABLO_SPRITE = {
  hair: 0x4a2a78,
  skin: 0xc89878,
  shirt: 0xeeeae0,
  pants: 0x222244,
  hairStyle: 'beanie_mask',
};

export const ENEMIES = {
  pablo: {
    id: 'pablo',
    name: 'Pablo',
    hp: 16,
    atk: 3,
    charSprite: PABLO_SPRITE,
    special: 'pablo',
    dialogue: ['me voy a follar a tu madre'],
  },
  libro_poseido: {
    id: 'libro_poseido',
    name: 'Libro Poseído',
    hp: 18,
    atk: 4,
    texture: 'book_enemy',
    dialogue: [
      'GRRRRGHH... páginas... rojas...',
      'Estuve encerrado mil años en este estante.',
      '¡VOY A DEVORAR TU MOCHILA!',
    ],
  },
};
