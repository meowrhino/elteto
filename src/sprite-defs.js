// Definición pura de sprites 24×32 px.
// Independiente de Phaser: los drawers reciben cualquier objeto `g` con
// la interfaz mínima `g.fillStyle(color).fillRect(x, y, w, h)`.
//
// Esto permite reutilizar el mismo código de dibujo desde:
//   - el juego (Phaser.Graphics, via src/characters.js -> ensureSprite)
//   - el script de exportación (Node + PixelCanvas -> tools/export-sprites.mjs)
//   - el editor del navegador (HTMLCanvas2D adapter -> tools/editor.html)
//
// Dos formatos coexisten:
//   - LEGACY: { hair, skin, shirt, pants, hairStyle: 'beanie_mask' } → DRAWERS[hairStyle]
//   - ITEMS:  { items: { headwear, hair_top, ... }, colors: { hair, skin, ... } } → sprite-items.js
// `paintSprite()` detecta el formato y dispatcha al sistema correcto.
//
// El color es un entero 0xRRGGBB.

import { paintSpriteFromItems } from './sprite-items.js';

export const SPRITE_W = 24;
export const SPRITE_H = 32;

// ---------- helpers ----------

export function clamp(x) { return Math.max(0, Math.min(255, x)); }

export function shadeOf(color, delta) {
  const r = clamp(((color >> 16) & 0xff) + delta);
  const g = clamp(((color >> 8) & 0xff) + delta);
  const b = clamp((color & 0xff) + delta);
  return (r << 16) | (g << 8) | b;
}

export function drawFreckles(g, color) {
  g.fillStyle(color);
  g.fillRect(8, 10, 1, 1);
  g.fillRect(11, 10, 1, 1);
  g.fillRect(15, 10, 1, 1);
}

export function drawHorizontalStripes(g, color) {
  g.fillStyle(color);
  g.fillRect(2, 16, 20, 1);
  g.fillRect(2, 19, 20, 1);
  g.fillRect(2, 22, 20, 1);
}

// ---------- partes comunes ----------

export function drawBody(g, opts) {
  const { skin, shirt, pants } = opts;
  const shoes = opts.shoes ?? 0x222222;

  g.fillStyle(skin).fillRect(6, 4, 12, 9);
  g.fillStyle(shadeOf(skin, -16)).fillRect(8, 12, 8, 1);

  g.fillStyle(skin).fillRect(10, 13, 4, 1);

  g.fillStyle(shirt).fillRect(2, 14, 20, 10);
  g.fillStyle(skin).fillRect(11, 14, 2, 1);
  g.fillStyle(shadeOf(shirt, -20)).fillRect(2, 14, 2, 2);
  g.fillStyle(shadeOf(shirt, -20)).fillRect(20, 14, 2, 2);
  g.fillStyle(skin).fillRect(1, 21, 2, 2);
  g.fillStyle(skin).fillRect(21, 21, 2, 2);

  g.fillStyle(pants).fillRect(5, 24, 14, 6);
  g.fillStyle(0x000000).fillRect(11, 24, 2, 6);

  g.fillStyle(shoes).fillRect(4, 30, 6, 2);
  g.fillStyle(shoes).fillRect(14, 30, 6, 2);
}

export function drawFace(g) {
  g.fillStyle(0x222222).fillRect(9, 8, 2, 2);
  g.fillStyle(0x222222).fillRect(13, 8, 2, 2);
  g.fillStyle(0xffffff).fillRect(10, 8, 1, 1);
  g.fillStyle(0xffffff).fillRect(14, 8, 1, 1);
  g.fillStyle(0x442211).fillRect(11, 11, 2, 1);
}

// ---------- estilos de pelo / cabeza ----------

export function drawDinoHoodProta(g, opts) {
  const hood = 0x5a7a3a;
  const hoodShade = 0x3a5a25;
  const spike = 0xd4a32a;
  const hair = opts.hair;

  g.fillStyle(hood);
  g.fillRect(5, 0, 14, 6);
  g.fillRect(4, 1, 16, 6);
  g.fillRect(3, 2, 18, 5);
  g.fillRect(4, 7, 3, 6);
  g.fillRect(17, 7, 3, 6);
  g.fillStyle(hoodShade);
  g.fillRect(5, 6, 14, 1);
  g.fillRect(4, 12, 3, 1);
  g.fillRect(17, 12, 3, 1);

  g.fillStyle(spike);
  g.fillRect(7, 0, 1, 2);
  g.fillRect(11, 0, 1, 2);
  g.fillRect(15, 0, 1, 2);

  g.fillStyle(0xeeeeee);
  g.fillRect(4, 4, 2, 2);
  g.fillRect(18, 4, 2, 2);
  g.fillStyle(0x222222);
  g.fillRect(5, 5, 1, 1);
  g.fillRect(18, 5, 1, 1);

  g.fillStyle(hair);
  g.fillRect(7, 5, 10, 2);
  g.fillRect(6, 7, 1, 2);
  g.fillRect(17, 7, 1, 2);

  g.fillStyle(opts.skin);
  g.fillRect(9, 8, 6, 1);
  g.fillStyle(0x222222);
  g.fillRect(9, 9, 2, 1);
  g.fillRect(13, 9, 2, 1);

  drawFreckles(g, shadeOf(opts.skin, -50));

  drawHorizontalStripes(g, 0x5a7a3a);
}

export function drawPunkMustache(g, opts) {
  const hair = opts.hair;
  const jacket = 0x111111;
  const jacketHi = 0x2a2a2a;
  const earring = 0xcccccc;

  g.fillStyle(hair);
  g.fillRect(6, 1, 12, 4);
  g.fillRect(5, 2, 14, 4);
  g.fillRect(7, 0, 10, 1);
  g.fillRect(5, 5, 2, 2);
  g.fillRect(17, 5, 2, 2);
  g.fillStyle(shadeOf(hair, -30));
  g.fillRect(5, 6, 14, 1);

  g.fillStyle(0x222222);
  g.fillRect(8, 7, 3, 1);
  g.fillRect(13, 7, 3, 1);

  g.fillStyle(0x222222);
  g.fillRect(9, 9, 2, 1);
  g.fillRect(13, 9, 2, 1);

  g.fillStyle(0x4a2a18);
  g.fillRect(9, 11, 6, 1);
  g.fillRect(10, 12, 4, 1);

  g.fillStyle(0x331100).fillRect(11, 13, 2, 1);

  g.fillStyle(earring);
  g.fillRect(4, 10, 2, 1);
  g.fillRect(4, 11, 1, 1);
  g.fillRect(5, 12, 1, 1);
  g.fillRect(18, 10, 2, 1);
  g.fillRect(19, 11, 1, 1);
  g.fillRect(18, 12, 1, 1);

  g.fillStyle(jacket);
  g.fillRect(2, 14, 8, 10);
  g.fillRect(14, 14, 8, 10);
  g.fillRect(2, 22, 20, 2);
  g.fillStyle(jacketHi);
  g.fillRect(8, 15, 1, 8);
  g.fillRect(15, 15, 1, 8);
  g.fillStyle(0xee6699).fillRect(3, 18, 3, 2);
  g.fillStyle(0xeeeeee).fillRect(3, 21, 3, 1);
}

export function drawWhitePurpleBob(g, opts) {
  const top = 0xeeeeee;
  const topShade = 0xc8c8c8;
  const bottom = 0x4a2a78;
  const bottomHi = 0x6a3a98;

  g.fillStyle(top);
  g.fillRect(5, 0, 14, 7);
  g.fillRect(4, 1, 16, 6);
  g.fillRect(4, 7, 3, 3);
  g.fillRect(17, 7, 3, 3);
  g.fillStyle(topShade);
  g.fillRect(6, 1, 1, 1);
  g.fillRect(16, 1, 1, 1);
  g.fillRect(7, 5, 10, 2);

  g.fillStyle(bottom);
  g.fillRect(4, 10, 3, 5);
  g.fillRect(17, 10, 3, 5);
  g.fillRect(5, 15, 3, 2);
  g.fillRect(16, 15, 3, 2);
  g.fillStyle(bottomHi);
  g.fillRect(4, 11, 1, 3);
  g.fillRect(19, 11, 1, 3);

  g.fillStyle(0x222222);
  g.fillRect(9, 8, 2, 2);
  g.fillRect(13, 8, 2, 2);
  g.fillRect(8, 7, 3, 1);
  g.fillRect(13, 7, 3, 1);
  g.fillStyle(0x442211).fillRect(11, 11, 2, 1);

  g.fillStyle(0x888888);
  g.fillRect(4, 9, 1, 1);
  g.fillRect(19, 9, 1, 1);

  g.fillStyle(0xc8c8c8).fillRect(9, 17, 6, 6);
  g.fillStyle(0x222222).fillRect(9, 18, 6, 1);
  g.fillStyle(0x222222).fillRect(9, 21, 6, 1);
  g.fillStyle(0x111111);
  g.fillRect(2, 14, 7, 10);
  g.fillRect(15, 14, 7, 10);
}

export function drawBeanieMask(g, opts) {
  const beanie = 0xeeeae0;
  const beanieFold = 0xc8c4ba;
  const purple = 0x4a2a78;
  const teal = 0x3a8a8a;
  const mask = 0x222222;
  const earring = 0x666666;

  g.fillStyle(beanie);
  g.fillRect(6, 0, 12, 2);
  g.fillRect(5, 1, 14, 3);
  g.fillRect(3, 2, 18, 3);
  g.fillRect(2, 4, 20, 2);
  g.fillStyle(beanieFold).fillRect(2, 6, 20, 1);

  g.fillStyle(purple);
  g.fillRect(5, 7, 14, 1);
  g.fillRect(8, 8, 8, 1);
  g.fillRect(4, 7, 1, 1);
  g.fillRect(19, 7, 1, 1);

  g.fillStyle(teal);
  g.fillRect(3, 8, 2, 7);
  g.fillRect(19, 8, 2, 7);
  g.fillRect(4, 15, 1, 1);
  g.fillRect(19, 15, 1, 1);

  g.fillStyle(opts.skin);
  g.fillRect(9, 8, 6, 2);
  g.fillStyle(0x222222);
  g.fillRect(8, 9, 3, 1);
  g.fillRect(13, 9, 3, 1);
  g.fillStyle(shadeOf(opts.skin, -40));
  g.fillRect(8, 10, 3, 1);
  g.fillRect(13, 10, 3, 1);

  g.fillStyle(mask);
  g.fillRect(6, 11, 12, 4);
  g.fillRect(7, 15, 10, 1);
  g.fillStyle(0x000000).fillRect(10, 14, 4, 1);

  g.fillStyle(earring);
  g.fillRect(2, 12, 1, 1);
  g.fillRect(21, 12, 1, 1);

  g.fillStyle(0xeeeae0).fillRect(2, 14, 20, 10);
  g.fillStyle(0x6a8a3a).fillRect(10, 19, 4, 1);
  g.fillStyle(0x6a8a3a).fillRect(9, 20, 6, 1);
}

export function drawGingerGlasses(g, opts) {
  const hair = opts.hair;
  const hairShade = shadeOf(hair, -30);
  const vest = 0x4a6a3a;

  g.fillStyle(hair);
  g.fillRect(5, 0, 14, 5);
  g.fillRect(4, 1, 16, 5);
  g.fillRect(3, 3, 2, 7);
  g.fillRect(19, 3, 2, 7);
  g.fillRect(4, 10, 2, 4);
  g.fillRect(18, 10, 2, 4);
  g.fillRect(6, 5, 8, 2);
  g.fillStyle(hairShade);
  g.fillRect(5, 4, 14, 1);
  g.fillRect(3, 9, 1, 4);
  g.fillRect(20, 9, 1, 4);

  g.fillStyle(0x222222);
  g.fillRect(7, 8, 4, 1);
  g.fillRect(7, 10, 4, 1);
  g.fillRect(7, 9, 1, 1);
  g.fillRect(10, 9, 1, 1);
  g.fillRect(13, 8, 4, 1);
  g.fillRect(13, 10, 4, 1);
  g.fillRect(13, 9, 1, 1);
  g.fillRect(16, 9, 1, 1);
  g.fillRect(11, 9, 2, 1);
  g.fillStyle(0xeef4ff);
  g.fillRect(8, 9, 2, 1);
  g.fillRect(14, 9, 2, 1);
  g.fillStyle(0x222222);
  g.fillRect(8, 9, 1, 1);
  g.fillRect(15, 9, 1, 1);

  g.fillStyle(0x331100).fillRect(11, 12, 2, 1);

  drawHorizontalStripes(g, 0xc8a072);
  g.fillStyle(vest);
  g.fillRect(5, 16, 14, 8);
  g.fillRect(5, 14, 3, 2);
  g.fillRect(16, 14, 3, 2);
  g.fillStyle(opts.skin);
  g.fillRect(10, 16, 4, 2);
  g.fillStyle(opts.shirt);
  g.fillRect(11, 18, 2, 1);
}

export function drawCurlyAfro(g, opts) {
  const hair = opts.hair;
  const hairHi = shadeOf(hair, 30);
  const hairLo = shadeOf(hair, -30);

  g.fillStyle(hair);
  g.fillRect(3, 1, 18, 8);
  g.fillRect(2, 2, 20, 8);
  g.fillRect(1, 4, 22, 7);
  g.fillRect(2, 11, 4, 6);
  g.fillRect(18, 11, 4, 6);
  g.fillRect(4, 0, 2, 1);
  g.fillRect(8, 0, 2, 1);
  g.fillRect(12, 0, 2, 1);
  g.fillRect(16, 0, 2, 1);
  g.fillStyle(hairHi);
  g.fillRect(5, 2, 1, 1); g.fillRect(9, 1, 1, 1); g.fillRect(15, 2, 1, 1);
  g.fillRect(3, 5, 1, 1); g.fillRect(19, 5, 1, 1);
  g.fillRect(2, 12, 1, 1); g.fillRect(21, 12, 1, 1);
  g.fillStyle(hairLo);
  g.fillRect(7, 4, 1, 1); g.fillRect(13, 5, 1, 1);
  g.fillRect(4, 8, 1, 1); g.fillRect(18, 8, 1, 1);

  g.fillStyle(opts.skin);
  g.fillRect(7, 7, 10, 6);
  g.fillStyle(hair);
  g.fillRect(8, 7, 8, 1);

  g.fillStyle(0x222222);
  g.fillRect(9, 9, 2, 2);
  g.fillRect(13, 9, 2, 2);
  g.fillStyle(0x442211).fillRect(11, 12, 2, 1);

  g.fillStyle(0x888888);
  g.fillRect(5, 11, 1, 1);
  g.fillRect(18, 11, 1, 1);

  drawFreckles(g, shadeOf(opts.skin, -50));
}

// ---------- estilos genéricos (NPCs secundarios) ----------

export function drawNormal(g, opts) {
  const hair = opts.hair;
  g.fillStyle(hair);
  g.fillRect(5, 1, 14, 5);
  g.fillRect(4, 2, 16, 4);
  g.fillRect(4, 6, 2, 4);
  g.fillRect(18, 6, 2, 4);
  g.fillRect(6, 5, 12, 2);
}

export function drawSpiky(g, opts) {
  const hair = opts.hair;
  g.fillStyle(hair);
  g.fillRect(5, 0, 1, 3);
  g.fillRect(8, 0, 1, 2);
  g.fillRect(11, 0, 1, 3);
  g.fillRect(14, 0, 1, 2);
  g.fillRect(17, 0, 1, 3);
  g.fillRect(4, 2, 16, 4);
  g.fillRect(4, 6, 2, 3);
  g.fillRect(18, 6, 2, 3);
  g.fillRect(6, 5, 12, 2);
}

export function drawLong(g, opts) {
  const hair = opts.hair;
  g.fillStyle(hair);
  g.fillRect(5, 0, 14, 6);
  g.fillRect(4, 1, 16, 5);
  g.fillRect(3, 6, 3, 10);
  g.fillRect(18, 6, 3, 10);
  g.fillRect(4, 16, 3, 2);
  g.fillRect(17, 16, 3, 2);
  g.fillRect(6, 5, 12, 2);
  g.fillRect(12, 7, 6, 2);
}

export function drawBob(g, opts) {
  const hair = opts.hair;
  g.fillStyle(hair);
  g.fillRect(5, 0, 14, 6);
  g.fillRect(4, 1, 16, 5);
  g.fillRect(4, 6, 2, 7);
  g.fillRect(18, 6, 2, 7);
  g.fillRect(6, 5, 12, 2);
}

export function drawBald() {}

// ---------- catálogo ----------

export const DRAWERS = {
  dino_hood_prota: drawDinoHoodProta,
  punk_mustache: drawPunkMustache,
  white_purple_bob: drawWhitePurpleBob,
  beanie_mask: drawBeanieMask,
  ginger_glasses: drawGingerGlasses,
  curly_afro: drawCurlyAfro,
  normal: drawNormal,
  spiky: drawSpiky,
  long: drawLong,
  bob: drawBob,
  bald: drawBald,
};

export const HAIR_STYLES = Object.keys(DRAWERS);

// Pinta el sprite completo. Soporta ambos formatos:
//   - LEGACY: opts = { hair, skin, shirt, pants, hairStyle } → drawBody + drawFace + DRAWER
//   - ITEMS:  opts = { items, colors } → drawBody + iterar slots de sprite-items.js
export function paintSprite(g, opts) {
  if (opts && opts.items && opts.colors) {
    return paintSpriteFromItems(g, opts);
  }
  drawBody(g, opts);
  drawFace(g);
  const drawer = DRAWERS[opts.hairStyle] || drawNormal;
  drawer(g, opts);
}

export function spriteKey(opts) {
  if (opts && opts.items && opts.colors) {
    // Clave determinista para el sistema items (sin importar order de claves)
    const items = opts.items;
    const itemPart = Object.keys(items).sort().map(k => `${k}=${items[k]}`).join(',');
    const c = opts.colors;
    const colorPart = ['hair', 'skin', 'shirt', 'pants']
      .map(k => (c[k] >>> 0).toString(16))
      .join('_');
    return `chr_${colorPart}_${itemPart}`;
  }
  const s = opts.hairStyle || 'normal';
  return `char_${s}_${(opts.hair >>> 0).toString(16)}_${(opts.skin >>> 0).toString(16)}_${(opts.shirt >>> 0).toString(16)}_${(opts.pants >>> 0).toString(16)}`;
}
