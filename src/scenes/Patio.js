import { RoomScene } from './RoomScene.js';
import { getChapter, CHAPTERS } from '../story.js';

// El patio. Aquí está Pablo.
// Antes de hablar con la Profesora es un NPC inofensivo (suelta su frase).
// Tras el foro del Club pasa a ser ENEMIGO: tocarlo dispara combate.
export class Patio extends RoomScene {
  constructor() {
    super('Patio');
    this.worldWidth = 640;
    this.worldHeight = 180;
    this.bgColor = '#5588cc';
  }

  buildRoom() {
    // Suelo de hierba
    for (let x = 0; x < this.worldWidth; x += 16) this.addPlatform(x, 160, 1, 1, 'grass');

    // Muro/tobogán al fondo con celosía
    this.addPlatform(496, 128, 5);
    this.addClimb(480, 128, 2, 'lattice');

    // Pelota como decoración
    this.addDecor(312, 154, 'ball');

    // Puerta de vuelta al aula
    this.addDoor(8, 136, 'Aula', 432, 140, 'aula');

    // ===== Pablo según capítulo =====
    this.addPablo();

    // ===== Niños jugando =====
    this.addNpc(256, 136, {
      id: 'iván_jugando', name: 'Iván',
      sprite: { hair: 0x222222, skin: 0xeec8aa, shirt: 0x44aaee, pants: 0x222222 },
      lifespan: 110,
      dialogue: [
        'Yo soy el portero.',
        'Bueno, nadie me lo ha dicho pero...',
      ],
    });

    this.addNpc(360, 136, {
      id: 'sofia', name: 'Sofía',
      sprite: { hair: 0xccaa22, skin: 0xeec8aa, shirt: 0xddee44, pants: 0x884422, hairStyle: 'long' },
      lifespan: 150,
      dialogue: [
        '¡Gol! Otro gol mío.',
        'Te juego un 1v1. Perderás.',
      ],
    });

    this.addNpc(560, 104, {
      id: 'clara', name: 'Clara',
      sprite: { hair: 0x882244, skin: 0xffd8b8, shirt: 0xff44aa, pants: 0x442266, hairStyle: 'long' },
      lifespan: 90,
      dialogue: [
        'Desde aquí arriba se ve todo el patio.',
        'Pablo está raro, ¿no?',
      ],
    });
  }

  addPablo() {
    const chap = getChapter(this.registry);
    const pabloSprite = { hair: 0x553388, skin: 0xf0c8a8, shirt: 0x1a1a1a, pants: 0x222222, hairStyle: 'punk_mustache' };

    // Tras el foro pasa a ser combate
    const isCombatTime = chap === CHAPTERS.INVESTIGATING || chap === CHAPTERS.FIGHTING;

    if (isCombatTime) {
      this.addEnemy(120, 136, {
        id: 'pablo', name: 'Pablo',
        hp: 16, atk: 3,
        charSprite: pabloSprite,
        special: 'pablo', // CombatScene sabe que tiene mecánica propia
        dialogue: ['me voy a follar a tu madre'],
      });
    } else if (chap === CHAPTERS.INTRO) {
      // Pre-foro: aún es un NPC con el que se puede hablar
      this.addNpc(120, 136, {
        id: 'pablo_npc', name: 'Pablo',
        sprite: pabloSprite,
        lifespan: 100,
        dialogue: ['me voy a follar a tu madre'],
      });
    }
    // En PABLO_DONE / DONE no aparece — ya está resuelto
  }
}
