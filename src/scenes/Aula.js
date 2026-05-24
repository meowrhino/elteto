import { RoomScene } from './RoomScene.js';
import { getChapter, setChapter, CHAPTERS } from '../story.js';
import { toSpec, lifespanOf } from '../data/characters.js';
import { ROOM_AULA } from '../data/rooms/aula.js';

// El aula. Punto de partida del juego.
// La parte estática (decor, puertas, alumnos sin cutscene) vive en
// src/data/rooms/aula.js. Aquí solo registramos lo que necesita lógica:
// la Profesora con onTalk, el hook de modo visión que mata a Lucas.
export class Aula extends RoomScene {
  constructor() {
    super('Aula');
    this.worldWidth = ROOM_AULA.worldWidth;
    this.worldHeight = ROOM_AULA.worldHeight;
    this.bgColor = ROOM_AULA.bgColor;
  }

  buildRoom() {
    this.buildFromData(ROOM_AULA);

    // ===== Profesora =====
    // Su diálogo cambia según el capítulo; usamos onTalk para evitar dialogue cacheado.
    this.addNpc(160, 128, {
      id: 'nivea', name: 'Nivea',
      sprite: toSpec('nivea'),
      lifespan: lifespanOf('nivea'),
      onTalk: (scene) => scene.talkToNivea(),
    });
  }

  // ============================================================ Profesora
  talkToNivea() {
    const chap = getChapter(this.registry);
    if (chap === CHAPTERS.INTRO) {
      this.openDialogue('Nivea', [
        'Hola. Necesito hablar contigo un momento.',
        'Es sobre Pablo. Lleva días repitiendo... ya sabes lo que dice.',
        'Yo no puedo más. Estoy rallada.',
        'Tú te llevas bien con él, ¿no?',
        '¿Podrías echarle un ojo? A ver qué le pasa.',
      ], () => this.openClubForum());
      return;
    }
    if (chap === CHAPTERS.INVESTIGATING || chap === CHAPTERS.FIGHTING) {
      this.openDialogue('Nivea', [
        'Por favor, ve al patio. Pablo está allí.',
      ]);
      return;
    }
    if (chap === CHAPTERS.PABLO_DONE) {
      this.openDialogue('Nivea', [
        '¿Y bien? ¿Has hablado con él?',
      ], () => this.openDialogue('Tú', ['lo he conseguido.'], () => this.finishChapter()));
      return;
    }
    this.openDialogue('Nivea', [
      'Gracias por todo, de verdad.',
      'No sé qué haría sin el Club de lo Oculto.',
    ]);
  }

  // Foro interno del Club tras el primer briefing
  openClubForum() {
    this.openForum([
      { speaker: 'Bárbara', text: 'A ver. Pablo no ha cambiado de ropa en tres días.' },
      { speaker: 'Bárbara', text: 'Y repite la misma frase. No es él.' },
      { speaker: 'Jorge', text: 'tio tio tio tio tio.' },
      { speaker: 'Bárbara', text: 'Creo que está poseído. O algo parecido.' },
      { speaker: 'Bárbara', text: '¿Llevas el Anillo?' },
      { speaker: 'Tú', text: 'sí.' },
      { speaker: 'Bárbara', text: 'Bien. Al patio.' },
      { speaker: 'Jorge', text: '¡cárgatelo!' },
    ], () => setChapter(this.registry, CHAPTERS.INVESTIGATING));
  }

  finishChapter() {
    setChapter(this.registry, CHAPTERS.DONE);
    this.openDialogue('Nivea', [
      'Gracias. Eres una salvaje.',
      'A ver si mañana vuelve siendo él mismo.',
    ]);
  }

  // Primer toggle de visión: Lucas muere visiblemente
  onFirstVision() {
    const lucas = this.npcs.getChildren().find(n => n.getData('id') === 'lucas');
    if (!lucas) return;
    lucas.setData('lifespan', 0);
    lucas.setData('deathDialogue', true);
    lucas.setData('dialogue', ['Lucas no se mueve.', 'Nunca estaba dormido...']);
    this.tweens.add({
      targets: lucas, alpha: { from: 1, to: 0.6 }, duration: 1200,
      onComplete: () => {
        lucas.setTint(0x666666);
        this.openDialogue('—', ['Lucas no se mueve.', 'Nunca estaba dormido...']);
      },
    });
  }
}
