// Tabla central de retratos Picrew. Mapea ids/speakers a claves de textura
// y a sus ficheros en disco.
//
// Crédito de los retratos: Picrew - Image Maker by Nuggts
//   https://picrew.me/ja/image_maker/1868017

export const PORTRAIT_KEYS = {
  protag: 'portrait_protag',
  jorge: 'portrait_jorge',
  barbara: 'portrait_barbara',
  pablo: 'portrait_pablo',
  nivea: 'portrait_nivea',
  martina: 'portrait_martina',
};

// Fichero por clave de textura
export const PORTRAIT_FILES = {
  [PORTRAIT_KEYS.protag]: 'personajes/prota.png',
  [PORTRAIT_KEYS.jorge]: 'personajes/jorge.png',
  [PORTRAIT_KEYS.barbara]: 'personajes/barbara.png',
  [PORTRAIT_KEYS.pablo]: 'personajes/pablo.png',
  [PORTRAIT_KEYS.nivea]: 'personajes/nivea (profesora).png',
  [PORTRAIT_KEYS.martina]: 'personajes/martina (bibliotecaria).png',
};

// id interno del personaje (party/NPC) -> retrato
const BY_ID = {
  protag: PORTRAIT_KEYS.protag,
  jorge: PORTRAIT_KEYS.jorge,
  barbara: PORTRAIT_KEYS.barbara,
  pablo: PORTRAIT_KEYS.pablo,
  pablo_npc: PORTRAIT_KEYS.pablo,
  nivea: PORTRAIT_KEYS.nivea,
  profesora: PORTRAIT_KEYS.nivea, // alias por compatibilidad
  martina: PORTRAIT_KEYS.martina,
  bibliotecaria: PORTRAIT_KEYS.martina,
};

// Nombre visible del speaker en el diálogo -> retrato
const BY_SPEAKER = {
  'Tú': PORTRAIT_KEYS.protag,
  'Jorge': PORTRAIT_KEYS.jorge,
  'Bárbara': PORTRAIT_KEYS.barbara,
  'Pablo': PORTRAIT_KEYS.pablo,
  'Nivea': PORTRAIT_KEYS.nivea,
  'Profesora': PORTRAIT_KEYS.nivea,
  'Martina': PORTRAIT_KEYS.martina,
  'Bibliotecaria': PORTRAIT_KEYS.martina,
};

export function portraitForCharId(id) {
  return BY_ID[id] || null;
}

export function portraitForSpeaker(name) {
  return BY_SPEAKER[name] || null;
}

// Color del nombre por speaker, compartido por DialogueScene y ForumScene.
export const SPEAKER_COLORS = {
  'Tú': '#ffd166',
  'Bárbara': '#cc88ff',
  'Jorge': '#88dd66',
  'Nivea': '#88ddee',
  'Profesora': '#88ddee',
  'Martina': '#aa66cc',
  'Bibliotecaria': '#aa66cc',
  'Pablo': '#ff7766',
  'Anillo': '#eeeecc',
  '—': '#aaaaaa',
};

export function colorForSpeaker(name) {
  return SPEAKER_COLORS[name] || '#ffffff';
}
