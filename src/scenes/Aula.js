import { RoomScene } from './RoomScene.js';
import { getChapter, setChapter, CHAPTERS } from '../story.js';
import { toSpec, lifespanOf } from '../data/characters.js';

// El aula. Punto de partida del juego.
// La Profesora dispara la progresión del capítulo "el bully está roto".
export class Aula extends RoomScene {
  constructor() {
    super('Aula');
    this.worldWidth = 480;
    this.worldHeight = 180;
    this.bgColor = '#2a2440';
  }

  buildRoom() {
    // Suelo continuo
    for (let x = 0; x < this.worldWidth; x += 16) this.addPlatform(x, 160);

    // Decoración: pizarra al fondo + pupitres
    this.addDecor(160, 30, 'chalkboard');
    this.addDecor(120, 150, 'desk');
    this.addDecor(200, 150, 'desk');
    this.addDecor(280, 150, 'desk');
    this.addDecor(360, 150, 'desk');

    // Puertas
    this.addDoor(8, 136, 'Biblioteca', 440, 144, 'biblioteca');
    this.addDoor(456, 136, 'Patio', 40, 144, 'patio');

    // Cartel con controles
    this.addSign(60, 150, '← → mover  ↑↓ escalar\n[E] hablar/entrar  [TAB] menú\n[-] visión');

    // ===== Profesora =====
    // Su diálogo cambia según el capítulo; usamos onTalk para evitar dialogue cacheado.
    this.addNpc(160, 128, {
      id: 'nivea', name: 'Nivea',
      sprite: toSpec('nivea'),
      lifespan: lifespanOf('nivea'),
      onTalk: (scene) => scene.talkToNivea(),
    });

    // ===== Alumnos secundarios =====
    this.addNpc(208, 128, {
      id: 'marta', name: 'Marta',
      sprite: toSpec('marta'),
      lifespan: lifespanOf('marta'),
      dialogue: [
        'Psst... ¿qué le ha dado a Pablo?',
        'Lleva días así. La profe está rallada.',
      ],
    });

    this.addNpc(288, 128, {
      id: 'dani', name: 'Dani',
      sprite: toSpec('dani'),
      lifespan: lifespanOf('dani'),
      dialogue: [
        'Yo de mayor quiero ser astronauta.',
        'O futbolista. O las dos cosas a la vez.',
      ],
    });

    this.addNpc(368, 128, {
      id: 'lucas', name: 'Lucas',
      sprite: toSpec('lucas'),
      lifespan: lifespanOf('lucas'), // muy bajo: la pista de que algo no va bien
      dialogue: [
        'Zzzz... ¿eh? ¿Ya es el recreo?',
        'Despiértame cuando suene el timbre.',
      ],
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
