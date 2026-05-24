#!/usr/bin/env node
// Renderiza todos los sprites del catálogo a PNG y los guarda en
// assets/sprites/<id>.png. Sin dependencias externas.
//
// Uso:
//   node tools/export-sprites.mjs
//
// Para añadir sprites nuevos, edita tools/lib/sprite-catalog.mjs.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PixelCanvas } from './lib/pixel-canvas.mjs';
import { encodePng } from './lib/png-encoder.mjs';
import { paintSprite, SPRITE_W, SPRITE_H } from '../src/sprite-defs.js';
import { SPRITE_CATALOG } from './lib/sprite-catalog.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'assets/sprites');

mkdirSync(OUT_DIR, { recursive: true });

let ok = 0;
for (const { id, spec } of SPRITE_CATALOG) {
  const pc = new PixelCanvas(SPRITE_W, SPRITE_H);
  paintSprite(pc, spec);
  const png = encodePng(SPRITE_W, SPRITE_H, pc.buf);
  const file = resolve(OUT_DIR, `${id}.png`);
  writeFileSync(file, png);
  console.log(`  ✓ ${id}.png`);
  ok++;
}

console.log(`\n${ok}/${SPRITE_CATALOG.length} sprites guardados en ${OUT_DIR.replace(ROOT + '/', '')}`);
