#!/usr/bin/env node
// Renderiza todos los props/decor del catálogo a PNG en
// assets/sprites/decor/<id>.png. Reusa PixelCanvas y png-encoder
// del tooling de personajes; los drawers están en src/decor-defs.js.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PixelCanvas } from './lib/pixel-canvas.mjs';
import { encodePng } from './lib/png-encoder.mjs';
import { DECOR_CATALOG } from '../src/decor-defs.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'assets/sprites/decor');

mkdirSync(OUT_DIR, { recursive: true });

let ok = 0;
for (const { id, w, h, paint } of DECOR_CATALOG) {
  const pc = new PixelCanvas(w, h);
  paint(pc);
  const png = encodePng(w, h, pc.buf);
  const file = resolve(OUT_DIR, `${id}.png`);
  writeFileSync(file, png);
  console.log(`  ✓ ${id}.png  ${w}×${h}`);
  ok++;
}

console.log(`\n${ok}/${DECOR_CATALOG.length} decor exportados a ${OUT_DIR.replace(ROOT + '/', '')}`);
