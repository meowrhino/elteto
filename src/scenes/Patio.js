import { RoomScene } from './RoomScene.js';
import { getChapter, setChapter, CHAPTERS } from '../story.js';
import { ENEMIES, PABLO_SPRITE } from '../enemies.js';
import { toSpec, lifespanOf } from '../data/characters.js';

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

  // Fondo del patio: montañas + nubes con parallax.
  // Las montañas se extienden a ambos lados del mundo porque su parallax
  // (sf=0.4) las desplaza más de 100px cuando la cámara se mueve.
  buildPatioBackground() {
    // Capa de cielo más claro: cubre toda la franja vertical hasta el suelo,
    // así no aparece una línea brusca al chocar con el bgColor.
    this.add.rectangle(-this.worldWidth, 0, this.worldWidth * 3, 160, 0x77aadd)
      .setOrigin(0, 0).setDepth(-100).setScrollFactor(0.3, 1);

    // Montañas (lejanas)
    const mtnY = 110;
    for (let x = -this.worldWidth; x < this.worldWidth * 2; x += 32) {
      this.add.image(x, mtnY, 'mountain')
        .setOrigin(0, 0).setDepth(-90).setScrollFactor(0.4, 1);
    }

    // Nubes (parallax medio)
    const cloudPositions = [
      { x: 40, y: 30, sf: 0.55 },
      { x: 180, y: 50, sf: 0.6 },
      { x: 340, y: 22, sf: 0.65 },
      { x: 500, y: 44, sf: 0.55 },
      { x: 600, y: 30, sf: 0.6 },
    ];
    for (const c of cloudPositions) {
      this.add.image(c.x, c.y, 'cloud')
        .setOrigin(0, 0).setDepth(-80).setScrollFactor(c.sf, 1);
    }
  }

  buildRoom() {
    // Fondo: montañas lejanas con parallax fuerte
    this.buildPatioBackground();

    // Suelo de hierba
    for (let x = 0; x < this.worldWidth; x += 16) this.addPlatform(x, 160, 1, 1, 'grass');

    // Vallado pegado al fondo (entre montañas y suelo, detrás de los NPCs)
    for (let x = 0; x < this.worldWidth; x += 32) {
      const f = this.add.image(x, 142, 'fence').setOrigin(0, 0).setDepth(-50).setScrollFactor(1, 1);
    }

    // Árboles y papelera (props de patio)
    this.addDecor(56, 140, 'tree');
    this.addDecor(440, 140, 'tree');
    this.addDecor(36, 150, 'bin');

    // Muro/tobogán al fondo con celosía a ambos lados (no quedar atrapado arriba)
    this.addPlatform(496, 128, 5);
    this.addClimb(480, 128, 2, 'lattice');
    this.addClimb(576, 128, 2, 'lattice');

    // Pelota como decoración
    this.addDecor(312, 154, 'ball');

    // Puerta de vuelta al aula
    this.addDoor(8, 136, 'Aula', 432, 144, 'aula');
    // Puerta al pasillo (acceso al resto del cole)
    this.addDoor(624, 136, 'Pasillo', 24, 144, 'pasillo');

    // Pablo (NPC o enemigo según capítulo)
    this.addPablo();

    // Niños jugando (líneas en src/data/dialogues.js)
    this.addNpc(256, 128, {
      id: 'ivan', name: 'Iván',
      sprite: toSpec('ivan'),
      lifespan: lifespanOf('ivan'),
    });

    this.addNpc(360, 128, {
      id: 'sofia', name: 'Sofía',
      sprite: toSpec('sofia'),
      lifespan: lifespanOf('sofia'),
    });

    this.addNpc(560, 96, {
      id: 'clara', name: 'Clara',
      sprite: toSpec('clara'),
      lifespan: lifespanOf('clara'),
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
      // Antes de hablar con Nivea, Pablo es un NPC inofensivo (líneas en catálogo)
      this.addNpc(120, 128, {
        id: 'pablo_npc', name: 'Pablo',
        sprite: this.pabloSprite,
        lifespan: 100,
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
