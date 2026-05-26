import { PORTRAIT_FILES } from '../portraits.js';
import { DECOR_CATALOG } from '../decor-defs.js';
import { whenPixelFontReady } from '../font.js';

// Escena de arranque: precarga los retratos PNG, los decor PNG y salta a
// la sala inicial.
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
    // Decor / props pre-rendereados a PNG.
    // El runtime no los redibuja: si quieres meter arte hecho a mano,
    // sustituye el PNG en assets/sprites/decor/<id>.png.
    for (const { id } of DECOR_CATALOG) {
      this.load.image(id, `assets/sprites/decor/${id}.png`);
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
    // Esperamos a Press Start 2P antes de arrancar la sala: si no, el primer
    // frame de textos se rastriza con la fuente fallback y Phaser cachea esa
    // textura — el texto se queda en monospace hasta tocar setText.
    whenPixelFontReady().then(() => {
      this.time.delayedCall(0, () => this.scene.start(targetScene));
    });
  }
}
