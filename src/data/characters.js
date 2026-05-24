// Catálogo central de personajes.
//
// Único sitio donde vive la apariencia de cada personaje del juego.
// state.js, enemies.js y las escenas referencian aquí por id en vez de
// inline-spec.
//
// Formato:
//   id: {
//     name,           // nombre visible en diálogos / menú
//     portrait,       // (opc.) clave de textura del retrato Picrew
//     lifespanDefault,// segundos visibles en modo visión
//     items: {...},   // composición de items (ver src/sprite-items.js)
//     colors: { hair, skin, shirt, pants },
//   }
//
// La función toSpec(id) devuelve el spec consumible por ensureSprite()
// (compatible con el flujo de paintSprite del juego — formato ITEMS).

import { PORTRAIT_KEYS } from '../portraits.js';

export const CHARACTERS = {

  // ============ PARTY ============

  protag: {
    name: 'Tú',
    portrait: PORTRAIT_KEYS.protag,
    lifespanDefault: 180,
    items: {
      headwear: 'dino_hood_green',
      hair_top: 'protag_brown_fringe',
      eyes: 'lower_small',
      mouth: 'default',
      freckles: 'light',
      shirt_pattern: 'stripes_h_green',
    },
    colors: { hair: 0x6a4a2a, skin: 0xf8d0aa, shirt: 0xe8e0d0, pants: 0x335533 },
  },

  jorge: {
    name: 'Jorge',
    portrait: PORTRAIT_KEYS.jorge,
    lifespanDefault: 140,
    items: {
      hair_top: 'punk_short_with_sideburns',
      eyebrows: 'angry',
      eyes: 'lower_small',
      mouth: 'low_dark',
      facial_hair: 'mustache_brown',
      earrings: 'hoops_large_silver',
      jacket: 'leather_punk_pink_patch',
    },
    colors: { hair: 0x4a2a78, skin: 0xf0c8a8, shirt: 0x1a1a1a, pants: 0x222222 },
  },

  barbara: {
    name: 'Bárbara',
    portrait: PORTRAIT_KEYS.barbara,
    lifespanDefault: 160,
    items: {
      hair_top: 'white_bob_top',
      hair_sides: 'barbara_purple_tips',
      eyebrows: 'angry',
      eyes: 'barbara_angry',
      mouth: 'default',
      earrings: 'hoops_small_grey',
      shirt_pattern: 'stripes_h_grey_under_jacket',
      jacket: 'black_open',
    },
    colors: { hair: 0xe8e8ec, skin: 0xf0c8b0, shirt: 0x1a1a1a, pants: 0x111122 },
  },

  // ============ ENEMIGOS / VILLANOS ============

  pablo: {
    name: 'Pablo',
    portrait: PORTRAIT_KEYS.pablo,
    lifespanDefault: 100,
    items: {
      headwear: 'beanie_white',
      hair_top: 'pablo_purple_bangs',
      hair_sides: 'pablo_teal',
      eyes: 'tired',
      mouth: 'none',
      mask: 'black_pablo',
      earrings: 'tiny_grey_pablo',
      shirt_pattern: 'nuggts_green',
    },
    colors: { hair: 0x4a2a78, skin: 0xc89878, shirt: 0xeeeae0, pants: 0x222244 },
  },

  // ============ NPCs CON RETRATO ============

  nivea: {
    name: 'Nivea',
    portrait: PORTRAIT_KEYS.nivea,
    lifespanDefault: 220,
    items: {
      hair_top: 'ginger_wavy',
      eyes: 'behind_round_glasses',
      glasses: 'round_dark',
      mouth: 'smile_small_brown',
      shirt_pattern: 'stripes_h_brown_light',
      jacket: 'vest_green',
    },
    colors: { hair: 0xc4582a, skin: 0xf8d8b8, shirt: 0xeed8b8, pants: 0x554422 },
  },

  martina: {
    name: 'Martina',
    portrait: PORTRAIT_KEYS.martina,
    lifespanDefault: 220,
    items: {
      hair_top: 'afro_curly',
      eyes: 'low_2x2',
      mouth: 'default',
      freckles: 'light',
      earrings: 'martina_side_studs',
    },
    colors: { hair: 0xc8a878, skin: 0xffd8b8, shirt: 0x1a1a1a, pants: 0x222222 },
  },

  // ============ NPCs SIN RETRATO ============

  marta: {
    name: 'Marta',
    lifespanDefault: 110,
    items: { hair_top: 'long_straight', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xc26a1f, skin: 0xffd8b8, shirt: 0xee88aa, pants: 0x442266 },
  },

  dani: {
    name: 'Dani',
    lifespanDefault: 140,
    items: { hair_top: 'spiky', eyes: 'default', mouth: 'default' },
    colors: { hair: 0x553322, skin: 0xeec8aa, shirt: 0x88cc66, pants: 0x442200 },
  },

  lucas: {
    name: 'Lucas',
    lifespanDefault: 4, // pista de que algo no va bien
    items: { hair_top: 'short_normal', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xaa8844, skin: 0xeec8aa, shirt: 0xddaa44, pants: 0x223344 },
  },

  lector: {
    name: 'Niño lector',
    lifespanDefault: 130,
    items: { hair_top: 'short_normal', eyes: 'default', mouth: 'default' },
    colors: { hair: 0x222244, skin: 0xeec8aa, shirt: 0x66aacc, pants: 0x224422 },
  },

  ivan: {
    name: 'Iván',
    lifespanDefault: 110,
    items: { hair_top: 'short_normal', eyes: 'default', mouth: 'default' },
    colors: { hair: 0x222222, skin: 0xeec8aa, shirt: 0x44aaee, pants: 0x222222 },
  },

  sofia: {
    name: 'Sofía',
    lifespanDefault: 150,
    items: { hair_top: 'long_straight', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xccaa22, skin: 0xeec8aa, shirt: 0xddee44, pants: 0x884422 },
  },

  clara: {
    name: 'Clara',
    lifespanDefault: 90,
    items: { hair_top: 'long_straight', eyes: 'default', mouth: 'default' },
    colors: { hair: 0x882244, skin: 0xffd8b8, shirt: 0xff44aa, pants: 0x442266 },
  },

  // ============ ADULTOS (personal del cole, nuevas salas) ============
  // Todos usan items existentes de src/sprite-items.js.

  manolo: {
    name: 'Manolo',
    lifespanDefault: 600,
    items: { hair_top: 'short_normal', eyes: 'default', mouth: 'default', facial_hair: 'mustache_brown' },
    colors: { hair: 0x666666, skin: 0xddb088, shirt: 0x336633, pants: 0x222222 },
  },

  pepa: {
    name: 'Pepa',
    lifespanDefault: 500,
    items: { hair_top: 'bob', eyes: 'default', mouth: 'default' },
    colors: { hair: 0x6a4a2a, skin: 0xeec8aa, shirt: 0xffffff, pants: 0xcccccc },
  },

  pepe: {
    name: 'Pepe',
    lifespanDefault: 400,
    items: { hair_top: 'spiky', eyes: 'default', mouth: 'default' },
    colors: { hair: 0x2a1a08, skin: 0xddb088, shirt: 0xff4444, pants: 0x222244 },
  },

  luz: {
    name: 'Luz',
    lifespanDefault: 350,
    items: { hair_top: 'long_straight', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xddaa66, skin: 0xffd8b8, shirt: 0x884488, pants: 0x222222 },
  },

  galan: {
    name: 'Galán',
    lifespanDefault: 250,
    items: { hair_top: 'short_normal', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xeecc88, skin: 0xffd8b8, shirt: 0xee2222, pants: 0x000000 },
  },

  sara: {
    name: 'Sara',
    lifespanDefault: 80,
    items: { hair_top: 'long_straight', eyes: 'default', mouth: 'default' },
    colors: { hair: 0x111111, skin: 0xffd8b8, shirt: 0x222222, pants: 0x444444 },
  },

  tania: {
    name: 'Tania',
    lifespanDefault: 70,
    items: { hair_top: 'afro_curly', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xff44aa, skin: 0xeec8aa, shirt: 0x000000, pants: 0x223344 },
  },

  // ============ ENTIDADES NO HUMANAS ============

  peluche: {
    name: 'Peluche',
    lifespanDefault: 999, // no muere
    items: { hair_top: 'short_normal', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xaa6633, skin: 0xddaa66, shirt: 0xff88aa, pants: 0xaa4488 },
  },

  fantasma: {
    name: '???',
    lifespanDefault: 30,
    alpha: 0.55,                    // translúcido
    items: { hair_top: 'long_straight', eyes: 'default', mouth: 'default' },
    colors: { hair: 0xeeeeee, skin: 0xccccdd, shirt: 0xaaaabb, pants: 0x888899 },
  },
};

/**
 * Spec consumible por ensureSprite/paintSprite. Devuelve formato ITEMS.
 * Es el objeto a pasar al builder addNpc({ sprite: toSpec('marta'), ... }).
 */
export function toSpec(id) {
  const c = CHARACTERS[id];
  if (!c) {
    console.warn(`[characters] id desconocido: ${id}`);
    return null;
  }
  return { items: c.items, colors: c.colors };
}

export function nameOf(id) { return CHARACTERS[id]?.name || id; }
export function lifespanOf(id) { return CHARACTERS[id]?.lifespanDefault ?? 120; }
export function alphaOf(id) { return CHARACTERS[id]?.alpha ?? 1; }
export function portraitOf(id) { return CHARACTERS[id]?.portrait || null; }

export const ALL_CHARACTER_IDS = Object.keys(CHARACTERS);
