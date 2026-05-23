import { RoomScene } from './RoomScene.js';

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
    this.addDoor(8, 136, 'Aula', 24, 140, 'aula');

    // ===== NPCs =====
    this.addNpc(176, 136, {
      id: 'martina', name: 'Martina',
      sprite: { hair: 0x4a2a4a, skin: 0xffd8b8, shirt: 0xaa66cc, pants: 0x333344, hairStyle: 'long' },
      lifespan: 220,
      dialogue: [
        '¡SHHHHHH! Aquí no se grita.',
        'Si quieres un libro, devuélvelo a tiempo.',
        'Últimamente uno de los libros... se mueve solo.',
        'No te acerques al estante del fondo.',
      ],
    });

    this.addNpc(144, 88, {
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
    this.addEnemy(434, 132, {
      id: 'libro_poseido',
      name: 'Libro Poseído',
      hp: 18, atk: 4,
      texture: 'book_enemy',
      dialogue: [
        'GRRRRGHH... páginas... rojas...',
        'Estuve encerrado mil años en este estante.',
        '¡VOY A DEVORAR TU MOCHILA!',
      ],
    });
  }
}
