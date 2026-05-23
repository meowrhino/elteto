// Factory de sprites de personaje a 16×24 px.
// Cada estilo de pelo (hairStyle) dibuja sobre la silueta base
// para conseguir un look reconocible aun con tan pocos píxeles.

const W = 16;
const H = 24;

// ---------- partes comunes ----------

function drawBody(g, opts) {
  const { skin, shirt, pants } = opts;
  const shoes = opts.shoes ?? 0x222222;

  // Cara (incluye frente — el pelo cubrirá lo que toque)
  g.fillStyle(skin).fillRect(4, 3, 8, 7);

  // Cuello
  g.fillStyle(skin).fillRect(6, 10, 4, 1);

  // Torso / camiseta
  g.fillStyle(shirt).fillRect(1, 11, 14, 7);
  // Hueco para el cuello visible
  g.fillStyle(skin).fillRect(7, 11, 2, 1);
  // Manos asomando
  g.fillStyle(skin).fillRect(0, 16, 1, 1);
  g.fillStyle(skin).fillRect(15, 16, 1, 1);

  // Pantalón
  g.fillStyle(pants).fillRect(3, 18, 10, 4);
  // Separación de piernas
  g.fillStyle(0x000000).fillRect(7, 18, 2, 4);

  // Zapatos
  g.fillStyle(shoes).fillRect(3, 22, 4, 2);
  g.fillStyle(shoes).fillRect(9, 22, 4, 2);
}

function drawFace(g) {
  // Ojos por defecto
  g.fillStyle(0x222222).fillRect(6, 6, 1, 1);
  g.fillStyle(0x222222).fillRect(9, 6, 1, 1);
  // Boca
  g.fillStyle(0x442211).fillRect(7, 8, 2, 1);
}

// ---------- estilos de pelo / cabeza ----------

// Protagonista: pelo rizado rubio puffy
function drawCurly(g, opts) {
  const h = opts.hair;
  g.fillStyle(h);
  // Volumen superior
  g.fillRect(3, 0, 10, 4);
  g.fillRect(2, 1, 12, 3);
  g.fillRect(1, 2, 14, 2);
  // Picos pequeños arriba (rizos)
  g.fillRect(4, 0, 1, 1);
  g.fillRect(7, 0, 1, 1);
  g.fillRect(11, 0, 1, 1);
  // Sienes que bajan
  g.fillRect(2, 4, 2, 4);
  g.fillRect(12, 4, 2, 4);
  // Mechones sueltos al costado
  g.fillRect(1, 4, 1, 2);
  g.fillRect(14, 4, 1, 2);
  // Flequillo
  g.fillRect(4, 3, 8, 1);
  // Pecas (3 puntitos)
  g.fillStyle(0xc4906a);
  g.fillRect(5, 7, 1, 1);
  g.fillRect(10, 7, 1, 1);
  g.fillRect(8, 7, 1, 1);
}

// Jorge: capucha de dinosaurio verde con cuernos y orejas
function drawDinoHood(g, opts) {
  const hood = 0x5a7a3a;
  const spike = 0xd4a32a;
  const peek = opts.hair;

  // Hood
  g.fillStyle(hood);
  g.fillRect(2, 0, 12, 5);
  g.fillRect(1, 1, 14, 5);
  g.fillRect(2, 5, 2, 5);
  g.fillRect(12, 5, 2, 5);

  // Cuernos / espinas amarillas
  g.fillStyle(spike);
  g.fillRect(5, 0, 1, 1);
  g.fillRect(8, 0, 1, 1);
  g.fillRect(11, 0, 1, 1);

  // Ojos del dino (botones blancos)
  g.fillStyle(0xeeeeee);
  g.fillRect(3, 3, 1, 1);
  g.fillRect(12, 3, 1, 1);

  // Pelo asomando bajo el hood
  g.fillStyle(peek);
  g.fillRect(5, 4, 6, 2);
}

// Bárbara: bob blanco arriba, morado abajo, mechones rectos
function drawWhitePurpleBob(g, opts) {
  const top = 0xe8e8ec;
  const bottom = 0x4a2a78;

  // Top blanco
  g.fillStyle(top);
  g.fillRect(3, 0, 10, 4);
  g.fillRect(2, 1, 12, 3);
  g.fillRect(2, 4, 2, 2);
  g.fillRect(12, 4, 2, 2);
  // Flequillo recto
  g.fillRect(4, 3, 8, 2);

  // Bottom morado (sienes largas)
  g.fillStyle(bottom);
  g.fillRect(2, 6, 2, 4);
  g.fillRect(12, 6, 2, 4);
  g.fillRect(3, 10, 2, 1);
  g.fillRect(11, 10, 2, 1);

  // Pendiente estrella (puntito)
  g.fillStyle(0xc8c8d0);
  g.fillRect(2, 8, 1, 1);
  g.fillRect(13, 8, 1, 1);
}

// Pablo: pelo morado corto + mostacho
function drawPunkMustache(g, opts) {
  const h = opts.hair;

  // Pelo corto top
  g.fillStyle(h);
  g.fillRect(4, 0, 8, 2);
  g.fillRect(3, 1, 10, 2);
  g.fillRect(3, 3, 1, 2);
  g.fillRect(12, 3, 1, 2);

  // Cejas marcadas
  g.fillStyle(0x222222);
  g.fillRect(5, 5, 2, 1);
  g.fillRect(9, 5, 2, 1);

  // Mostacho marrón debajo de la nariz
  g.fillStyle(0x6a4022);
  g.fillRect(6, 7, 4, 1);

  // Boca tapada por el mostacho — pequeño puntito de boca
  g.fillStyle(0x331100).fillRect(7, 9, 2, 1);

  // Pendientes en las orejas
  g.fillStyle(0xcccccc);
  g.fillRect(3, 7, 1, 1);
  g.fillRect(12, 7, 1, 1);
}

// Profesora: pelo rojizo + gafas
function drawGingerGlasses(g, opts) {
  const h = opts.hair;

  // Pelo rojizo media melena
  g.fillStyle(h);
  g.fillRect(3, 0, 10, 4);
  g.fillRect(2, 1, 12, 4);
  g.fillRect(2, 5, 2, 5);
  g.fillRect(12, 5, 2, 5);
  // Flequillo lateral
  g.fillRect(4, 4, 6, 1);

  // Gafas redondas (marco oscuro)
  g.fillStyle(0x222222);
  // Cuadro izq
  g.fillRect(4, 5, 3, 1);
  g.fillRect(4, 7, 3, 1);
  g.fillRect(4, 6, 1, 1);
  g.fillRect(6, 6, 1, 1);
  // Cuadro der
  g.fillRect(9, 5, 3, 1);
  g.fillRect(9, 7, 3, 1);
  g.fillRect(9, 6, 1, 1);
  g.fillRect(11, 6, 1, 1);
  // Puente
  g.fillRect(7, 6, 2, 1);

  // Cristales tintados sutiles
  g.fillStyle(0xddeeff);
  g.fillRect(5, 6, 1, 1);
  g.fillRect(10, 6, 1, 1);
}

// Estilos básicos (NPCs secundarios)
function drawNormal(g, opts) {
  const h = opts.hair;
  g.fillStyle(h);
  g.fillRect(3, 0, 10, 4);
  g.fillRect(2, 1, 12, 3);
  g.fillRect(2, 4, 1, 3);
  g.fillRect(13, 4, 1, 3);
  g.fillRect(4, 4, 8, 1);
}

function drawSpiky(g, opts) {
  const h = opts.hair;
  g.fillStyle(h);
  g.fillRect(3, 0, 1, 2);
  g.fillRect(5, 0, 1, 1);
  g.fillRect(7, 0, 1, 2);
  g.fillRect(9, 0, 1, 1);
  g.fillRect(11, 0, 1, 2);
  g.fillRect(2, 1, 12, 3);
  g.fillRect(2, 4, 1, 2);
  g.fillRect(13, 4, 1, 2);
  g.fillRect(4, 4, 1, 1);
  g.fillRect(11, 4, 1, 1);
}

function drawLong(g, opts) {
  const h = opts.hair;
  g.fillStyle(h);
  g.fillRect(3, 0, 10, 4);
  g.fillRect(2, 1, 12, 3);
  // Sienes largas
  g.fillRect(2, 4, 2, 7);
  g.fillRect(12, 4, 2, 7);
  g.fillRect(3, 11, 2, 1);
  g.fillRect(11, 11, 2, 1);
  // Flequillo + mechón sobre un ojo
  g.fillRect(4, 4, 8, 1);
  g.fillRect(8, 5, 3, 2);
}

// ---------- API pública ----------

const DRAWERS = {
  curly: drawCurly,
  dino_hood: drawDinoHood,
  white_purple_bob: drawWhitePurpleBob,
  punk_mustache: drawPunkMustache,
  ginger_glasses: drawGingerGlasses,
  normal: drawNormal,
  spiky: drawSpiky,
  long: drawLong,
  bald: () => {},
};

/**
 * Genera (si no existe) la textura del personaje con la apariencia dada
 * y devuelve la clave de textura.
 */
export function ensureSprite(scene, opts) {
  const key = spriteKey(opts);
  if (scene.textures.exists(key)) return key;
  const g = scene.add.graphics();
  drawBody(g, opts);
  drawFace(g);
  const drawer = DRAWERS[opts.hairStyle] || drawNormal;
  drawer(g, opts);
  g.generateTexture(key, W, H);
  g.destroy();
  return key;
}

/** Clave determinista basada en la apariencia. */
export function spriteKey(opts) {
  const s = opts.hairStyle || 'normal';
  return `char_${s}_${(opts.hair >>> 0).toString(16)}_${(opts.skin >>> 0).toString(16)}_${(opts.shirt >>> 0).toString(16)}_${(opts.pants >>> 0).toString(16)}`;
}

export const SPRITE_W = W;
export const SPRITE_H = H;
