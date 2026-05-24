import { RoomScene } from './RoomScene.js';

// Fábrica de clases de sala 100% data-driven. Útil para crear salas
// sin lógica narrativa propia (estancias decorativas, conectores).
//
// Ejemplo:
//   const Pasillo = makeRoomClass('Pasillo', ROOM_PASILLO);
//   // → clase Phaser.Scene con buildRoom() = this.buildFromData(ROOM_PASILLO).
export function makeRoomClass(key, data) {
  return class extends RoomScene {
    constructor() {
      super(key);
      this.worldWidth = data.worldWidth;
      this.worldHeight = data.worldHeight;
      this.bgColor = data.bgColor;
    }
    buildRoom() {
      this.buildFromData(data);
    }
  };
}
