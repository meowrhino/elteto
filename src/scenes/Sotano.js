import { RoomScene } from './RoomScene.js';
import { ROOM_SOTANO } from '../data/rooms/sotano.js';

// Sótano. Tiene una "puerta espectral" hacia el Astral que solo es
// visible y usable cuando el modo visión (sepia) está activado.
export class Sotano extends RoomScene {
  constructor() {
    super('Sotano');
    this.worldWidth = ROOM_SOTANO.worldWidth;
    this.worldHeight = ROOM_SOTANO.worldHeight;
    this.bgColor = ROOM_SOTANO.bgColor;
  }

  buildRoom() {
    this.buildFromData(ROOM_SOTANO);
    // Marca visual del portal espectral (se renderiza siempre como sombra
    // tenue, pero solo es puerta cuando hay visión).
    this.spectralX = 240;
    this.spectralGlow = this.add.rectangle(this.spectralX, 130, 14, 30, 0x884488, 0.15)
      .setOrigin(0, 0).setDepth(-5);
    this.tweens.add({
      targets: this.spectralGlow,
      alpha: { from: 0.1, to: 0.25 },
      duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // Override de applySepia para crear/destruir la puerta dinámicamente
  applySepia(on) {
    super.applySepia(on);
    if (on && !this.spectralDoor) {
      this.spectralDoor = this.addDoor(this.spectralX, 136, 'Astral', 40, 144, 'el otro lado');
      // Tinte violeta para que sea claramente sobrenatural
      this.spectralDoor.setTint(0xaa66cc);
    } else if (!on && this.spectralDoor) {
      this.spectralDoor.destroy();
      this.spectralDoor = null;
    }
  }
}
