import { PORTRAIT_FILES } from '../portraits.js';

// Escena de arranque: precarga los retratos PNG y salta a la escena inicial.
// Sin BootScene, las imágenes intentarían cargarse desde dentro de cada
// sala (load.image dentro de create) y eso no funciona en Phaser — los assets
// deben pedirse en preload(), antes de create().
export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    for (const [key, file] of Object.entries(PORTRAIT_FILES)) {
      this.load.image(key, file);
    }
  }

  create() {
    // Filtro lineal para que los retratos (no pixel-art) se vean suaves al
    // redimensionarse. El resto de texturas mantiene el filtro NEAREST por
    // `pixelArt: true` del config global.
    for (const key of Object.keys(PORTRAIT_FILES)) {
      if (this.textures.exists(key)) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }

    // Continuar con la sala donde estaba el player (Aula por defecto)
    const playerState = this.registry.get('player') || { scene: 'Aula' };
    this.scene.start(playerState.scene || 'Aula');
  }
}
