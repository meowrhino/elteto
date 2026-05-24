import { RoomScene } from './RoomScene.js';
import { getChapter, setChapter, CHAPTERS } from '../story.js';
import { ENEMIES, PABLO_SPRITE } from '../enemies.js';

// El patio. Aquí está Pablo.
//
// Estados de Pablo según capítulo:
//   - INTRO          → NPC normal (suelta su frase, no pasa nada)
//   - INVESTIGATING  → NPC con cutscene previa: al hablarle se desencadena
//                      un diálogo del Club y, al cerrarlo, empieza el combate.
//                      (No queremos que tocarle lance combate sin aviso.)
//   - FIGHTING       → Enemigo directo: si has perdido y vuelves, contacto = combate.
//   - PABLO_DONE/DONE→ no aparece (ya está resuelto)
export class Patio extends RoomScene {
  constructor() {
    super('Patio');
    this.worldWidth = 640;
    this.worldHeight = 180;
    this.bgColor = '#5588cc';
  }

  // Spec única del sprite de Pablo (importada de enemies.js)
  get pabloSprite() { return PABLO_SPRITE; }

  buildRoom() {
    // Suelo de hierba
    for (let x = 0; x < this.worldWidth; x += 16) this.addPlatform(x, 160, 1, 1, 'grass');

    // Muro/tobogán al fondo con celosía
    this.addPlatform(496, 128, 5);
    this.addClimb(480, 128, 2, 'lattice');

    // Pelota como decoración
    this.addDecor(312, 154, 'ball');

    // Puerta de vuelta al aula
    this.addDoor(8, 136, 'Aula', 432, 144, 'aula');

    // Pablo (NPC o enemigo según capítulo)
    this.addPablo();

    // Niños jugando
    this.addNpc(256, 128, {
      id: 'ivan', name: 'Iván',
      sprite: { hair: 0x222222, skin: 0xeec8aa, shirt: 0x44aaee, pants: 0x222222 },
      lifespan: 110,
      dialogue: [
        'Yo soy el portero.',
        'Bueno, nadie me lo ha dicho pero...',
      ],
    });

    this.addNpc(360, 128, {
      id: 'sofia', name: 'Sofía',
      sprite: { hair: 0xccaa22, skin: 0xeec8aa, shirt: 0xddee44, pants: 0x884422, hairStyle: 'long' },
      lifespan: 150,
      dialogue: [
        '¡Gol! Otro gol mío.',
        'Te juego un 1v1. Perderás.',
      ],
    });

    this.addNpc(560, 96, {
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

    if (chap === CHAPTERS.INVESTIGATING) {
      // NPC con cutscene previa al combate
      this.addNpc(120, 128, {
        id: 'pablo_intro', name: 'Pablo',
        sprite: this.pabloSprite,
        lifespan: 80,
        onTalk: (scene) => scene.startPabloCutscene(),
      });
    } else if (chap === CHAPTERS.FIGHTING) {
      // Tras la cutscene (o tras perder), contacto = combate
      this.addEnemy(120, 128, ENEMIES.pablo);
    } else if (chap === CHAPTERS.INTRO) {
      // Antes de hablar con Nivea, Pablo es un NPC inofensivo
      this.addNpc(120, 128, {
        id: 'pablo_npc', name: 'Pablo',
        sprite: this.pabloSprite,
        lifespan: 100,
        dialogue: ['me voy a follar a tu madre'],
      });
    }
    // En PABLO_DONE / DONE no aparece
  }

  // Cutscene cuando le hablas por primera vez en INVESTIGATING.
  // Tras el diálogo, avanza el capítulo y arranca el combate.
  startPabloCutscene() {
    this.openDialogue('Pablo', [
      { speaker: 'Tú', text: 'Pablo. Para ya.' },
      { speaker: 'Pablo', text: 'me voy a follar a tu madre' },
      { speaker: 'Bárbara', text: 'Cuidado. Algo lo posee.' },
      { speaker: 'Bárbara', text: 'No es él hablando.' },
      { speaker: 'Jorge', text: '¡cárgatelo! ¡cárgatelo!' },
      { speaker: 'Tú', text: 'Vale. Vamos allá.' },
    ], () => this.transitionToCombat());
  }

  transitionToCombat() {
    setChapter(this.registry, CHAPTERS.FIGHTING);
    // Guardar la posición actual del player para volver a este punto al salir del combate
    const state = this.registry.get('player');
    state.x = Math.max(8, this.player.x - 24);
    state.y = this.player.y;
    state.scene = this.scene.key;
    this.registry.set('player', state);

    this.scene.start('CombatScene', {
      enemy: ENEMIES.pablo,
      returnTo: 'Patio',
    });
  }
}
