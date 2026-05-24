// Catálogo central de todos los sprites del juego.
// Cada entrada es { id, spec } donde spec es lo que reciben los drawers
// (hair, skin, shirt, pants, hairStyle).
//
// Mantener esto sincronizado con las definiciones en src/state.js, src/enemies.js
// y los addNpc() de cada sala. El editor (tools/editor.html) también lee este
// catálogo como punto de partida.

export const SPRITE_CATALOG = [
  // ---- Party (src/state.js) ----
  { id: 'protag', spec: { hair: 0x6a4a2a, skin: 0xf8d0aa, shirt: 0xe8e0d0, pants: 0x335533, hairStyle: 'dino_hood_prota' } },
  { id: 'jorge',  spec: { hair: 0x4a2a78, skin: 0xf0c8a8, shirt: 0x1a1a1a, pants: 0x222222, hairStyle: 'punk_mustache' } },
  { id: 'barbara',spec: { hair: 0xe8e8ec, skin: 0xf0c8b0, shirt: 0x1a1a1a, pants: 0x111122, hairStyle: 'white_purple_bob' } },

  // ---- Pablo (src/enemies.js) ----
  { id: 'pablo',  spec: { hair: 0x4a2a78, skin: 0xc89878, shirt: 0xeeeae0, pants: 0x222244, hairStyle: 'beanie_mask' } },

  // ---- Aula ----
  { id: 'nivea',  spec: { hair: 0xc4582a, skin: 0xf8d8b8, shirt: 0xeed8b8, pants: 0x554422, hairStyle: 'ginger_glasses' } },
  { id: 'marta',  spec: { hair: 0xc26a1f, skin: 0xffd8b8, shirt: 0xee88aa, pants: 0x442266, hairStyle: 'long' } },
  { id: 'dani',   spec: { hair: 0x553322, skin: 0xeec8aa, shirt: 0x88cc66, pants: 0x442200, hairStyle: 'spiky' } },
  { id: 'lucas',  spec: { hair: 0xaa8844, skin: 0xeec8aa, shirt: 0xddaa44, pants: 0x223344, hairStyle: 'normal' } },

  // ---- Biblioteca ----
  { id: 'martina',spec: { hair: 0xc8a878, skin: 0xffd8b8, shirt: 0x1a1a1a, pants: 0x222222, hairStyle: 'curly_afro' } },
  { id: 'lector', spec: { hair: 0x222244, skin: 0xeec8aa, shirt: 0x66aacc, pants: 0x224422, hairStyle: 'normal' } },

  // ---- Patio ----
  { id: 'ivan',   spec: { hair: 0x222222, skin: 0xeec8aa, shirt: 0x44aaee, pants: 0x222222, hairStyle: 'normal' } },
  { id: 'sofia',  spec: { hair: 0xccaa22, skin: 0xeec8aa, shirt: 0xddee44, pants: 0x884422, hairStyle: 'long' } },
  { id: 'clara',  spec: { hair: 0x882244, skin: 0xffd8b8, shirt: 0xff44aa, pants: 0x442266, hairStyle: 'long' } },
];
