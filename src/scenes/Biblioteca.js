import { RoomScene } from './RoomScene.js';
import { ENEMIES } from '../enemies.js';
import { toSpec, lifespanOf } from '../data/characters.js';

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
    // Interior: pared más cálida que el aula (tono ámbar polvoriento)
    this.buildInterior({
      wallColor: 0x4a3a52,
      baseboardColor: 0x1f1a2a,
      baseboardH: 4,
      floorTop: 160,
    });

    // Mapa colgado y lámpara — atmósfera de biblioteca
    this.addDecor(160, 40, 'map');
    this.addDecor(204, 24, 'lamp');
    this.addDecor(60, 24, 'lamp');
    this.addDecor(380, 24, 'lamp');

    // Suelo continuo
    for (let x = 0; x < this.worldWidth; x += 16) this.addPlatform(x, 160);

    // Estanterías altas al fondo (decor de pared, contra la pared trasera)
    this.addDecor(28, 76, 'shelf_tall');
    this.addDecor(108, 76, 'shelf_tall');
    this.addDecor(188, 76, 'shelf_tall');
    this.addDecor(268, 76, 'shelf_tall');
    this.addDecor(348, 76, 'shelf_tall');
    this.addDecor(428, 76, 'shelf_tall');

    // Estanterías bajas (existentes, en primer plano)
    this.addDecor(40, 128, 'shelf');
    this.addDecor(72, 128, 'shelf');
    this.addDecor(240, 128, 'shelf');
    this.addDecor(272, 128, 'shelf');
    this.addDecor(400, 128, 'shelf');

    // Mesa de lectura central con libro
    this.addDecor(180, 146, 'reading_table');
    this.addDecor(178, 151, 'chair');
    this.addDecor(202, 151, 'chair');

    // Altillo accesible por escalera a ambos lados
    this.addPlatform(112, 112, 5);
    this.addClimb(96, 112, 3, 'ladder');
    this.addClimb(192, 112, 3, 'ladder');

    // Otra zona alta por cuerda (escalable por ambos extremos)
    this.addPlatform(320, 96, 4);
    this.addClimb(304, 96, 4, 'rope');
    this.addClimb(384, 96, 4, 'rope');

    // Puerta de vuelta al aula
    this.addDoor(8, 136, 'Aula', 24, 144, 'aula');

    // ===== NPCs =====
    this.addNpc(176, 128, {
      id: 'martina', name: 'Martina',
      sprite: toSpec('martina'),
      lifespan: lifespanOf('martina'),
      dialogue: [
        '¡SHHHHHH! Aquí no se grita.',
        'Si quieres un libro, devuélvelo a tiempo.',
        'Últimamente uno de los libros... se mueve solo.',
        'No te acerques al estante del fondo.',
      ],
    });

    this.addNpc(144, 80, {
      id: 'lector', name: 'Niño lector',
      sprite: toSpec('lector'),
      lifespan: lifespanOf('lector'),
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
