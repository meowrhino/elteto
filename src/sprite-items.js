// Sistema de items componibles tipo Picrew.
//
// Cada slot tiene varios items y cada item es una función drawer pura que
// recibe (g, colors). Render order matters — los slots posteriores se pintan
// sobre los anteriores.
//
// Para componer un personaje:
//   character = {
//     items: { headwear: 'dino_hood', hair_top: 'protag_fringe', eyes: 'lower_small', ... },
//     colors: { hair: 0x6a4a2a, skin: 0xf8d0aa, shirt: 0xe8e0d0, pants: 0x335533 },
//   }
//   paintSpriteFromItems(g, character)
//
// El catálogo de personajes vive en `src/data/characters.js`.
// La interfaz `g` es la misma que en sprite-defs.js (fillStyle/fillRect).

import { drawBody, shadeOf, SPRITE_W, SPRITE_H } from './sprite-defs.js';

export { SPRITE_W, SPRITE_H };

// ============================================================ SLOTS
// El order de slots aquí no importa — el order de RENDER se define abajo.
// Mantengo los slots como un objeto {slot: {itemId: drawFn}} para que
// el editor pueda iterar sus opciones por slot.

export const ITEMS = {

  // ---------- shirt_pattern (sobre la camiseta sólida que ya pintó drawBody) ----------
  shirt_pattern: {
    none: () => {},
    stripes_h_green: (g) => {
      g.fillStyle(0x5a7a3a);
      g.fillRect(2, 16, 20, 1); g.fillRect(2, 19, 20, 1); g.fillRect(2, 22, 20, 1);
    },
    stripes_h_brown_light: (g) => {
      g.fillStyle(0xc8a072);
      g.fillRect(2, 16, 20, 1); g.fillRect(2, 19, 20, 1); g.fillRect(2, 22, 20, 1);
    },
    stripes_h_grey_under_jacket: (g) => {
      g.fillStyle(0xc8c8c8).fillRect(9, 17, 6, 6);
      g.fillStyle(0x222222).fillRect(9, 18, 6, 1);
      g.fillStyle(0x222222).fillRect(9, 21, 6, 1);
    },
    nuggts_green: (g) => {
      g.fillStyle(0x6a8a3a).fillRect(10, 19, 4, 1);
      g.fillStyle(0x6a8a3a).fillRect(9, 20, 6, 1);
    },
  },

  // ---------- jacket / vest (encima del torso) ----------
  jacket: {
    none: () => {},
    leather_punk_pink_patch: (g) => {
      g.fillStyle(0x111111);
      g.fillRect(2, 14, 8, 10);
      g.fillRect(14, 14, 8, 10);
      g.fillRect(2, 22, 20, 2);
      g.fillStyle(0x2a2a2a);
      g.fillRect(8, 15, 1, 8);
      g.fillRect(15, 15, 1, 8);
      g.fillStyle(0xee6699).fillRect(3, 18, 3, 2);
      g.fillStyle(0xeeeeee).fillRect(3, 21, 3, 1);
    },
    black_open: (g) => {
      g.fillStyle(0x111111);
      g.fillRect(2, 14, 7, 10);
      g.fillRect(15, 14, 7, 10);
    },
    vest_green: (g, c) => {
      const vest = 0x4a6a3a;
      g.fillStyle(vest);
      g.fillRect(5, 16, 14, 8);
      g.fillRect(5, 14, 3, 2);
      g.fillRect(16, 14, 3, 2);
      // Cuello en V (deja ver la piel + un punto de camisa)
      g.fillStyle(c.skin);
      g.fillRect(10, 16, 4, 2);
      g.fillStyle(c.shirt);
      g.fillRect(11, 18, 2, 1);
    },
  },

  // ---------- eyebrows ----------
  eyebrows: {
    none: () => {},
    angry: (g) => {
      g.fillStyle(0x222222);
      g.fillRect(8, 7, 3, 1);
      g.fillRect(13, 7, 3, 1);
    },
  },

  // ---------- eyes ----------
  eyes: {
    none: () => {},
    default: (g) => {
      // Estándar: 2x2 dots + brilho
      g.fillStyle(0x222222);
      g.fillRect(9, 8, 2, 2);
      g.fillRect(13, 8, 2, 2);
      g.fillStyle(0xffffff);
      g.fillRect(10, 8, 1, 1);
      g.fillRect(14, 8, 1, 1);
    },
    low_2x2: (g) => {
      // Una fila más bajo, sin brilho — para Martina (afro tapa arriba)
      g.fillStyle(0x222222);
      g.fillRect(9, 9, 2, 2);
      g.fillRect(13, 9, 2, 2);
    },
    lower_small: (g) => {
      // Para protag bajo capucha y Jorge bajo flequillo: 2x1 más bajo
      g.fillStyle(0x222222);
      g.fillRect(9, 9, 2, 1);
      g.fillRect(13, 9, 2, 1);
    },
    barbara_angry: (g) => {
      // 2x2 estándar, las cejas las pone el slot eyebrows
      g.fillStyle(0x222222);
      g.fillRect(9, 8, 2, 2);
      g.fillRect(13, 8, 2, 2);
    },
    tired: (g, c) => {
      // Pablo: parche de piel arriba (despeja la zona), eyes 3x1, ojeras debajo
      g.fillStyle(c.skin);
      g.fillRect(9, 8, 6, 2);
      g.fillStyle(0x222222);
      g.fillRect(8, 9, 3, 1);
      g.fillRect(13, 9, 3, 1);
      g.fillStyle(shadeOf(c.skin, -40));
      g.fillRect(8, 10, 3, 1);
      g.fillRect(13, 10, 3, 1);
    },
    behind_round_glasses: (g) => {
      // Nivea: puntitos 1x1 dentro de los cristales tintados
      g.fillStyle(0x222222);
      g.fillRect(8, 9, 1, 1);
      g.fillRect(15, 9, 1, 1);
    },
  },

  // ---------- mouth ----------
  mouth: {
    none: () => {},
    default: (g) => {
      g.fillStyle(0x442211).fillRect(11, 11, 2, 1);
    },
    low_dark: (g) => {
      // Para Jorge — boca bajo el mostacho
      g.fillStyle(0x331100).fillRect(11, 13, 2, 1);
    },
    smile_small_brown: (g) => {
      g.fillStyle(0x331100).fillRect(11, 12, 2, 1);
    },
  },

  // ---------- facial_hair ----------
  facial_hair: {
    none: () => {},
    mustache_brown: (g) => {
      g.fillStyle(0x4a2a18);
      g.fillRect(9, 11, 6, 1);
      g.fillRect(10, 12, 4, 1);
    },
  },

  // ---------- mask ----------
  mask: {
    none: () => {},
    black_pablo: (g) => {
      g.fillStyle(0x222222);
      g.fillRect(6, 11, 12, 4);
      g.fillRect(7, 15, 10, 1);
      g.fillStyle(0x000000).fillRect(10, 14, 4, 1);
    },
  },

  // ---------- glasses ----------
  glasses: {
    none: () => {},
    round_dark: (g) => {
      g.fillStyle(0x222222);
      // Lente izq
      g.fillRect(7, 8, 4, 1); g.fillRect(7, 10, 4, 1);
      g.fillRect(7, 9, 1, 1); g.fillRect(10, 9, 1, 1);
      // Lente der
      g.fillRect(13, 8, 4, 1); g.fillRect(13, 10, 4, 1);
      g.fillRect(13, 9, 1, 1); g.fillRect(16, 9, 1, 1);
      // Puente
      g.fillRect(11, 9, 2, 1);
      // Cristales tintados
      g.fillStyle(0xeef4ff);
      g.fillRect(8, 9, 2, 1);
      g.fillRect(14, 9, 2, 1);
    },
  },

  // ---------- blush ----------
  blush: {
    none: () => {},
    pink_light: (g) => {
      g.fillStyle(0xff99aa);
      g.fillRect(7, 10, 1, 1);
      g.fillRect(16, 10, 1, 1);
    },
  },

  // ---------- freckles ----------
  freckles: {
    none: () => {},
    light: (g, c) => {
      g.fillStyle(shadeOf(c.skin, -50));
      g.fillRect(8, 10, 1, 1);
      g.fillRect(11, 10, 1, 1);
      g.fillRect(15, 10, 1, 1);
    },
  },

  // ---------- earrings ----------
  earrings: {
    none: () => {},
    hoops_large_silver: (g) => {
      // Jorge: aros grandes
      g.fillStyle(0xcccccc);
      g.fillRect(4, 10, 2, 1);
      g.fillRect(4, 11, 1, 1);
      g.fillRect(5, 12, 1, 1);
      g.fillRect(18, 10, 2, 1);
      g.fillRect(19, 11, 1, 1);
      g.fillRect(18, 12, 1, 1);
    },
    hoops_small_grey: (g) => {
      // Barbara, Martina: aros pequeños
      g.fillStyle(0x888888);
      g.fillRect(4, 9, 1, 1);
      g.fillRect(19, 9, 1, 1);
    },
    martina_side_studs: (g) => {
      g.fillStyle(0x888888);
      g.fillRect(5, 11, 1, 1);
      g.fillRect(18, 11, 1, 1);
    },
    tiny_grey_pablo: (g) => {
      g.fillStyle(0x666666);
      g.fillRect(2, 12, 1, 1);
      g.fillRect(21, 12, 1, 1);
    },
  },

  // ---------- hair_sides (asoma por los lados de la cabeza) ----------
  hair_sides: {
    none: () => {},
    pablo_teal: (g) => {
      g.fillStyle(0x3a8a8a);
      g.fillRect(3, 8, 2, 7);
      g.fillRect(19, 8, 2, 7);
      g.fillRect(4, 15, 1, 1);
      g.fillRect(19, 15, 1, 1);
    },
    barbara_purple_tips: (g) => {
      const bottom = 0x4a2a78;
      const bottomHi = 0x6a3a98;
      g.fillStyle(bottom);
      g.fillRect(4, 10, 3, 5);
      g.fillRect(17, 10, 3, 5);
      g.fillRect(5, 15, 3, 2);
      g.fillRect(16, 15, 3, 2);
      g.fillStyle(bottomHi);
      g.fillRect(4, 11, 1, 3);
      g.fillRect(19, 11, 1, 3);
    },
  },

  // ---------- hair_top (pelo visible arriba) ----------
  hair_top: {
    none: () => {},
    short_normal: (g, c) => {
      g.fillStyle(c.hair);
      g.fillRect(5, 1, 14, 5);
      g.fillRect(4, 2, 16, 4);
      g.fillRect(4, 6, 2, 4);
      g.fillRect(18, 6, 2, 4);
      g.fillRect(6, 5, 12, 2);
    },
    spiky: (g, c) => {
      g.fillStyle(c.hair);
      g.fillRect(5, 0, 1, 3);
      g.fillRect(8, 0, 1, 2);
      g.fillRect(11, 0, 1, 3);
      g.fillRect(14, 0, 1, 2);
      g.fillRect(17, 0, 1, 3);
      g.fillRect(4, 2, 16, 4);
      g.fillRect(4, 6, 2, 3);
      g.fillRect(18, 6, 2, 3);
      g.fillRect(6, 5, 12, 2);
    },
    long_straight: (g, c) => {
      g.fillStyle(c.hair);
      g.fillRect(5, 0, 14, 6);
      g.fillRect(4, 1, 16, 5);
      g.fillRect(3, 6, 3, 10);
      g.fillRect(18, 6, 3, 10);
      g.fillRect(4, 16, 3, 2);
      g.fillRect(17, 16, 3, 2);
      g.fillRect(6, 5, 12, 2);
      g.fillRect(12, 7, 6, 2);
    },
    bob: (g, c) => {
      g.fillStyle(c.hair);
      g.fillRect(5, 0, 14, 6);
      g.fillRect(4, 1, 16, 5);
      g.fillRect(4, 6, 2, 7);
      g.fillRect(18, 6, 2, 7);
      g.fillRect(6, 5, 12, 2);
    },
    afro_curly: (g, c) => {
      const hair = c.hair;
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
      // Devolver el "pelo de flequillo bajo" para que la cara visible sea pequeña
      g.fillStyle(c.skin);
      g.fillRect(7, 7, 10, 6);
      g.fillStyle(hair);
      g.fillRect(8, 7, 8, 1);
    },
    ginger_wavy: (g, c) => {
      const hair = c.hair;
      const hairShade = shadeOf(hair, -30);
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
    },
    punk_short_with_sideburns: (g, c) => {
      const hair = c.hair;
      g.fillStyle(hair);
      g.fillRect(6, 1, 12, 4);
      g.fillRect(5, 2, 14, 4);
      g.fillRect(7, 0, 10, 1);
      g.fillRect(5, 5, 2, 2);   // patilla izq
      g.fillRect(17, 5, 2, 2);  // patilla der
      g.fillStyle(shadeOf(hair, -30));
      g.fillRect(5, 6, 14, 1);
    },
    white_bob_top: (g) => {
      const top = 0xeeeeee;
      const topShade = 0xc8c8c8;
      g.fillStyle(top);
      g.fillRect(5, 0, 14, 7);
      g.fillRect(4, 1, 16, 6);
      g.fillRect(4, 7, 3, 3);
      g.fillRect(17, 7, 3, 3);
      g.fillStyle(topShade);
      g.fillRect(6, 1, 1, 1);
      g.fillRect(16, 1, 1, 1);
      g.fillRect(7, 5, 10, 2);
    },
    pablo_purple_bangs: (g) => {
      const purple = 0x4a2a78;
      g.fillStyle(purple);
      g.fillRect(5, 7, 14, 1);
      g.fillRect(8, 8, 8, 1);
      g.fillRect(4, 7, 1, 1);
      g.fillRect(19, 7, 1, 1);
    },
    protag_brown_fringe: (g, c) => {
      g.fillStyle(c.hair);
      g.fillRect(7, 5, 10, 2);
      g.fillRect(6, 7, 1, 2);
      g.fillRect(17, 7, 1, 2);
    },
  },

  // ---------- headwear (gorro/capucha) ----------
  headwear: {
    none: () => {},
    dino_hood_green: (g) => {
      const hood = 0x5a7a3a;
      const hoodShade = 0x3a5a25;
      const spike = 0xd4a32a;
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
      // Cuernos del dino
      g.fillStyle(spike);
      g.fillRect(7, 0, 1, 2);
      g.fillRect(11, 0, 1, 2);
      g.fillRect(15, 0, 1, 2);
      // Ojos blancos a los lados (decoración de la capucha)
      g.fillStyle(0xeeeeee);
      g.fillRect(4, 4, 2, 2);
      g.fillRect(18, 4, 2, 2);
      g.fillStyle(0x222222);
      g.fillRect(5, 5, 1, 1);
      g.fillRect(18, 5, 1, 1);
    },
    beanie_white: (g) => {
      const beanie = 0xeeeae0;
      const beanieFold = 0xc8c4ba;
      g.fillStyle(beanie);
      g.fillRect(6, 0, 12, 2);
      g.fillRect(5, 1, 14, 3);
      g.fillRect(3, 2, 18, 3);
      g.fillRect(2, 4, 20, 2);
      g.fillStyle(beanieFold).fillRect(2, 6, 20, 1);
    },
  },

  // ---------- extras (decoración sobre todo lo demás) ----------
  extras: {
    none: () => {},
    // (placeholder para halos, accesorios, etc.)
  },
};

// ============================================================ RENDER ORDER
// Slot de abajo a arriba (cada uno se pinta sobre los anteriores).
export const RENDER_ORDER = [
  'shirt_pattern',
  'jacket',
  'eyebrows',
  'eyes',
  'mouth',
  'facial_hair',
  'mask',
  'glasses',
  'blush',
  'freckles',
  'earrings',
  'hair_sides',
  'hair_top',
  'headwear',
  'extras',
];

// ============================================================ paintSpriteFromItems
export function paintSpriteFromItems(g, character) {
  const colors = character.colors;
  drawBody(g, colors);
  for (const slot of RENDER_ORDER) {
    const itemId = character.items?.[slot];
    if (!itemId || itemId === 'none') continue;
    const item = ITEMS[slot]?.[itemId];
    if (typeof item === 'function') item(g, colors);
  }
}

// ============================================================ utilidades
export function listSlots() { return Object.keys(ITEMS); }
export function listItems(slot) { return Object.keys(ITEMS[slot] || {}); }

// Clave determinista de textura para el sistema items.
export function itemsKey(character) {
  const items = character.items || {};
  const colors = character.colors || {};
  const itemPart = RENDER_ORDER.map(s => `${s}:${items[s] || 'none'}`).join('|');
  const colorPart = ['hair', 'skin', 'shirt', 'pants']
    .map(k => (colors[k] >>> 0).toString(16))
    .join('_');
  return `chr_${colorPart}_${itemPart}`;
}
