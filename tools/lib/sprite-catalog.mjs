// Catálogo de sprites — wrapper sobre src/data/characters.js.
// Devuelve un array [{id, spec}] consumible por el script de exportación,
// con specs ya en formato ITEMS.

import { CHARACTERS, toSpec, ALL_CHARACTER_IDS } from '../../src/data/characters.js';

export const SPRITE_CATALOG = ALL_CHARACTER_IDS.map(id => ({
  id,
  spec: toSpec(id),
  meta: { name: CHARACTERS[id].name, portrait: CHARACTERS[id].portrait || null },
}));
