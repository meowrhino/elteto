import { PORTRAIT_FILES } from '../portraits.js';

// Escena de arranque: precarga los retratos PNG y salta a la sala inicial.
//
// Sin BootScene los `load.image` tendrían que ocurrir dentro de cada sala
// (cosa que en Phaser no funciona en `create`, solo en `preload`).
//
// IMPORTANTE: el `scene.start` final va dentro de `time.delayedCall(0, ...)`.
// Si se llama directamente al final de `create()`, en Phaser 3.80 la
// operación queda encolada pero NO se procesa (BootScene se queda activa,
// la siguiente sala nunca arranca). El delay de 0ms basta para que se
// procese tras finalizar create().
export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    for (const [key, file] of Object.entries(PORTRAIT_FILES)) {
      this.load.image(key, file);
    }
  }

  create() {
    // Filtro LINEAR para que los retratos (no pixel-art) se vean suaves al
    // redimensionarse. El resto de texturas mantiene NEAREST por
    // `pixelArt: true` del config global.
    for (const key of Object.keys(PORTRAIT_FILES)) {
      if (this.textures.exists(key)) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }

    const playerState = this.registry.get('player') || { scene: 'Aula' };
    const targetScene = playerState.scene || 'Aula';
    this.time.delayedCall(0, () => this.scene.start(targetScene));
  }
}
