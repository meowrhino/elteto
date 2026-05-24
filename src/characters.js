// Adaptador Phaser para los sprites de personajes.
// Las definiciones de dibujo viven en ./sprite-defs.js, independientes de Phaser,
// para que puedan reutilizarse en herramientas (Node + browser).

import { paintSprite, spriteKey, SPRITE_W, SPRITE_H } from './sprite-defs.js';

export { spriteKey, SPRITE_W, SPRITE_H };

/**
 * Genera (si no existe) la textura del personaje con la apariencia dada
 * y devuelve la clave de textura.
 */
export function ensureSprite(scene, opts) {
  const key = spriteKey(opts);
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  paintSprite(g, opts);
  g.generateTexture(key, SPRITE_W, SPRITE_H);
  g.destroy();
  return key;
}
