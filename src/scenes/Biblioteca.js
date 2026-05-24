import { RoomScene } from './RoomScene.js';
import { ENEMIES } from '../enemies.js';

// Biblioteca: dos pisos, bibliotecaria, niño lector y un libro poseído.
// Side-quest opcional respecto al hilo principal de Pablo.
export class Biblioteca extends RoomScene {
  constructor() {
    super('Biblioteca');
    this.worldWidth = 480;
    this.worldHeight = 180;
    this.bgColor = '#1f1a2a';
  }

  buildRoom() {
    for (let x = 0; x < this.worldWidth; x += 16) this.addPlatform(x, 160);

    // Decoración: estanterías repartidas
    this.addDecor(40, 128, 'shelf');
    this.addDecor(72, 128, 'shelf');
    this.addDecor(240, 128, 'shelf');
    this.addDecor(272, 128, 'shelf');
    this.addDecor(400, 128, 'shelf');

    // Altillo accesible por escalera
    this.addPlatform(112, 112, 5);
    this.addClimb(96, 112, 3, 'ladder');

    // Otra zona alta por cuerda (al lado, fuera de la plataforma)
    this.addPlatform(320, 96, 4);
    this.addClimb(304, 96, 4, 'rope');

    // Puerta de vuelta al aula
    this.addDoor(8, 136, 'Aula', 24, 144, 'aula');

    // ===== NPCs =====
    this.addNpc(176, 128, {
      id: 'martina', name: 'Martina',
      // Pelo súper rizado rubio + jersey negro (estilo afro)
      sprite: { hair: 0xc8a878, skin: 0xffd8b8, shirt: 0x1a1a1a, pants: 0x222222, hairStyle: 'curly_afro' },
      lifespan: 220,
      dialogue: [
        '¡SHHHHHH! Aquí no se grita.',
        'Si quieres un libro, devuélvelo a tiempo.',
        'Últimamente uno de los libros... se mueve solo.',
        'No te acerques al estante del fondo.',
      ],
    });

    this.addNpc(144, 80, {
      id: 'lector', name: 'Niño lector',
      sprite: { hair: 0x222244, skin: 0xeec8aa, shirt: 0x66aacc, pants: 0x224422 },
      lifespan: 130,
      dialogue: [
        'Estoy leyendo, no molestes.',
        '...vale, ¿qué quieres?',
        'Si vas al fondo, ten cuidado.',
      ],
    });

    // Pedestal + libro poseído al final
    this.addPlatform(432, 144, 1, 1);
    this.addEnemy(434, 132, ENEMIES.libro_poseido);
  }
}
