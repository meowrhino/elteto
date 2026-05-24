// Definiciones de drawers para los props/decor del juego. Cada función
// recibe un `g` con la interfaz mínima `fillStyle(int).fillRect(x,y,w,h)`
// y `fillCircle(x,y,r)`. Se usa desde:
//   - Phaser (g = scene.add.graphics()) → makeStaticTextures como fallback.
//   - Node (g = PixelCanvas) → tools/export-decor.mjs para generar PNGs.
//
// Para añadir un decor nuevo: define la función paintX(g) y añádela a DECOR.

export function paintTile(g) {
  g.fillStyle(0x6b4226).fillRect(0, 0, 16, 16);
  g.fillStyle(0x8b5a36).fillRect(0, 0, 16, 3);
}

export function paintGrass(g) {
  g.fillStyle(0x4a3018).fillRect(0, 0, 16, 16);
  g.fillStyle(0x4caf50).fillRect(0, 0, 16, 4);
  g.fillStyle(0x66bb6a).fillRect(2, 0, 2, 2);
  g.fillStyle(0x66bb6a).fillRect(10, 1, 2, 2);
}

export function paintLadder(g) {
  g.fillStyle(0xc88a3a);
  g.fillRect(3, 0, 2, 16); g.fillRect(11, 0, 2, 16);
  g.fillRect(2, 2, 12, 2); g.fillRect(2, 8, 12, 2); g.fillRect(2, 14, 12, 2);
}

export function paintRope(g) {
  g.fillStyle(0xb88a3a).fillRect(7, 0, 2, 16);
  g.fillStyle(0xa07020).fillRect(7, 4, 2, 1);
  g.fillStyle(0xa07020).fillRect(7, 11, 2, 1);
}

export function paintLattice(g) {
  // Rejilla con fillRect (líneas de 1px). Reescrito sin lineStyle para
  // mantener la API uniforme entre Phaser y PixelCanvas.
  g.fillStyle(0x888888);
  for (let i = 0; i <= 16; i += 4) {
    g.fillRect(0, i, 16, 1);  // línea horizontal
    g.fillRect(i, 0, 1, 16);  // línea vertical
  }
}

export function paintDoor(g) {
  g.fillStyle(0x4a2511).fillRect(0, 0, 16, 24);
  g.fillStyle(0x2a1408).fillRect(2, 2, 12, 20);
  g.fillStyle(0xffd166).fillRect(11, 12, 2, 2);
}

export function paintSign(g) {
  g.fillStyle(0xeeeeee).fillRect(0, 0, 8, 6);
  g.fillStyle(0x4a2511).fillRect(3, 6, 2, 4);
}

export function paintBookEnemy(g) {
  g.fillStyle(0x7a1f1f).fillRect(0, 0, 14, 12);
  g.fillStyle(0xeeeeee).fillRect(2, 2, 10, 8);
  g.fillStyle(0x7a1f1f).fillRect(6, 0, 2, 12);
  g.fillStyle(0xff0000).fillRect(4, 5, 2, 2);
  g.fillStyle(0xff0000).fillRect(8, 5, 2, 2);
}

export function paintShelf(g) {
  g.fillStyle(0x3a1f0a).fillRect(0, 0, 16, 32);
  const rows = [
    [0x4a8aaa, 0xaa4a4a, 0x4aaa4a, 0xaaaa4a],
    [0xaa4a4a, 0x4aaa4a, 0x4a8aaa, 0xaa4aaa],
    [0x4aaa4a, 0xaa4aaa, 0xaaaa4a, 0xaa4a4a],
  ];
  for (let r = 0; r < 3; r++) {
    const yy = 1 + r * 8;
    g.fillStyle(0xb88a3a).fillRect(1, yy, 14, 6);
    for (let i = 0; i < 4; i++) {
      g.fillStyle(rows[r][i]).fillRect(2 + i * 3, yy + 1, 2, 5);
    }
  }
}

export function paintBall(g) {
  g.fillStyle(0xffffff).fillCircle(3, 3, 3);
  g.fillStyle(0x222222).fillRect(2, 0, 2, 1); g.fillStyle(0x222222).fillRect(2, 5, 2, 1);
  g.fillStyle(0x222222).fillRect(0, 2, 1, 2); g.fillStyle(0x222222).fillRect(5, 2, 1, 2);
}

export function paintChalkboard(g) {
  g.fillStyle(0x6a4a2a).fillRect(0, 0, 32, 20);
  g.fillStyle(0x1a3a2a).fillRect(2, 2, 28, 16);
  g.fillStyle(0xffffff).fillRect(5, 6, 1, 1);
  g.fillStyle(0xffffff).fillRect(5, 8, 6, 1);
  g.fillStyle(0xffffff).fillRect(5, 12, 4, 1);
}

export function paintChalkboardBig(g) {
  g.fillStyle(0x6a4a2a).fillRect(0, 0, 80, 40);
  g.fillStyle(0x1a3a2a).fillRect(2, 2, 76, 36);
  g.fillStyle(0xffffff).fillRect(6, 8, 12, 1);
  g.fillStyle(0xffffff).fillRect(6, 11, 8, 1);
  g.fillStyle(0xffffff).fillRect(20, 9, 1, 4);
  g.fillStyle(0xffffff).fillRect(22, 8, 4, 1);
  g.fillStyle(0xffffff).fillRect(22, 12, 4, 1);
  g.fillStyle(0xffffff).fillRect(6, 20, 24, 1);
  g.fillStyle(0xffffff).fillRect(6, 23, 16, 1);
  g.fillStyle(0xffffff).fillRect(6, 26, 20, 1);
  g.fillStyle(0xeeeeee).fillRect(40, 16, 1, 12);
  g.fillStyle(0xeeeeee).fillRect(48, 16, 1, 4);
  g.fillStyle(0xeeeeee).fillRect(48, 24, 1, 4);
  g.fillStyle(0xeeeeee).fillRect(48, 16, 6, 1);
  g.fillStyle(0xeeeeee).fillRect(48, 24, 6, 1);
  g.fillStyle(0xeeeeee).fillRect(53, 16, 1, 12);
  g.fillStyle(0x4a3018).fillRect(0, 37, 80, 3);
  g.fillStyle(0xffffff).fillRect(8, 38, 4, 1);
  g.fillStyle(0xffaa44).fillRect(20, 38, 3, 1);
}

export function paintDesk(g) {
  g.fillStyle(0x8b5a36).fillRect(0, 0, 14, 4);
  g.fillStyle(0x6b4226).fillRect(2, 4, 2, 6);
  g.fillStyle(0x6b4226).fillRect(10, 4, 2, 6);
}

export function paintChair(g) {
  g.fillStyle(0x6b4226).fillRect(0, 0, 8, 1);
  g.fillStyle(0x6b4226).fillRect(0, 1, 1, 4);
  g.fillStyle(0x6b4226).fillRect(0, 5, 1, 4);
  g.fillStyle(0x6b4226).fillRect(7, 1, 1, 8);
}

export function paintTeacherDesk(g) {
  g.fillStyle(0xaa3333).fillRect(4, 0, 4, 3);     // libro rojo
  g.fillStyle(0x2266aa).fillRect(10, 1, 5, 2);    // libro azul
  g.fillStyle(0x33aa33).fillRect(18, 0, 1, 1);    // hojita manzana
  g.fillStyle(0xcc4444).fillRect(18, 1, 2, 2);    // manzana
  g.fillStyle(0x8b5a36).fillRect(0, 3, 24, 5);    // tablero
  g.fillStyle(0x6b4226).fillRect(2, 8, 2, 10);
  g.fillStyle(0x6b4226).fillRect(20, 8, 2, 10);
}

export function paintClock(g) {
  g.fillStyle(0x111111).fillCircle(7, 7, 7);
  g.fillStyle(0xeeeeee).fillCircle(7, 7, 6);
  g.fillStyle(0x111111).fillRect(7, 3, 1, 4);     // aguja minutera (rect normal hacia arriba)
  g.fillStyle(0x111111).fillRect(7, 7, 3, 1);     // aguja horaria
  g.fillStyle(0x111111).fillRect(7, 1, 1, 1);     // 12
  g.fillStyle(0x111111).fillRect(13, 7, 1, 1);    // 3
  g.fillStyle(0x111111).fillRect(7, 13, 1, 1);    // 6
  g.fillStyle(0x111111).fillRect(1, 7, 1, 1);     // 9
}

export function paintPoster(g) {
  g.fillStyle(0xeeddaa).fillRect(0, 0, 24, 18);
  g.fillStyle(0x884422).fillRect(0, 0, 24, 1);
  g.fillStyle(0x884422).fillRect(0, 17, 24, 1);
  g.fillStyle(0x884422).fillRect(0, 0, 1, 18);
  g.fillStyle(0x884422).fillRect(23, 0, 1, 18);
  for (let row = 0; row < 3; row++) {
    const yy = 3 + row * 5;
    for (let col = 0; col < 5; col++) {
      g.fillStyle(0x222222).fillRect(3 + col * 4, yy, 2, 2);
    }
  }
}

export function paintLamp(g) {
  g.fillStyle(0x222222).fillRect(5, 0, 2, 6);
  g.fillStyle(0xaa8844).fillRect(2, 6, 8, 2);
  g.fillStyle(0xffe066).fillRect(1, 8, 10, 5);
  g.fillStyle(0xddaa33).fillRect(2, 13, 8, 1);
}

export function paintMap(g) {
  g.fillStyle(0x6b4226).fillRect(0, 0, 28, 1);
  g.fillStyle(0x6b4226).fillRect(0, 19, 28, 1);
  g.fillStyle(0x5588cc).fillRect(0, 1, 28, 18);
  g.fillStyle(0xeed8a0).fillRect(2, 3, 8, 5);
  g.fillStyle(0xeed8a0).fillRect(12, 4, 5, 6);
  g.fillStyle(0xeed8a0).fillRect(18, 6, 8, 8);
  g.fillStyle(0xeed8a0).fillRect(3, 11, 6, 5);
  g.fillStyle(0xcc4444).fillRect(15, 8, 1, 1);
}

export function paintReadingTable(g) {
  g.fillStyle(0xaa3333).fillRect(8, 0, 5, 2);
  g.fillStyle(0xeeeeee).fillRect(9, 1, 3, 1);
  g.fillStyle(0x8b5a36).fillRect(0, 2, 28, 4);
  g.fillStyle(0x6b4226).fillRect(2, 6, 2, 8);
  g.fillStyle(0x6b4226).fillRect(24, 6, 2, 8);
}

export function paintShelfTall(g) {
  g.fillStyle(0x3a1f0a).fillRect(0, 0, 20, 48);
  for (let row = 0; row < 4; row++) {
    const yy = 2 + row * 12;
    g.fillStyle(0xb88a3a).fillRect(1, yy, 18, 8);
    const cols = [0x4a8aaa, 0xaa4a4a, 0x4aaa4a, 0xaaaa4a, 0xaa4aaa, 0x88cc44];
    for (let i = 0; i < 6; i++) {
      g.fillStyle(cols[(i + row) % cols.length]).fillRect(2 + i * 3, yy + 1, 2, 6);
    }
  }
}

export function paintCloud(g) {
  g.fillStyle(0xffffff).fillRect(2, 1, 12, 4);
  g.fillStyle(0xffffff).fillRect(0, 2, 16, 2);
  g.fillStyle(0xffffff).fillRect(3, 0, 8, 1);
}

export function paintMountain(g) {
  g.fillStyle(0x3a3a5a).fillRect(0, 8, 32, 6);
  g.fillStyle(0x3a3a5a).fillRect(4, 5, 8, 8);
  g.fillStyle(0x3a3a5a).fillRect(14, 2, 10, 11);
  g.fillStyle(0x3a3a5a).fillRect(22, 6, 8, 8);
}

export function paintTree(g) {
  g.fillStyle(0x4a2511).fillRect(7, 12, 2, 8);
  g.fillStyle(0x2a6a2a).fillRect(2, 4, 12, 8);
  g.fillStyle(0x2a6a2a).fillRect(4, 2, 8, 4);
  g.fillStyle(0x3aaa3a).fillRect(3, 5, 2, 2);
  g.fillStyle(0x3aaa3a).fillRect(10, 6, 2, 2);
}

export function paintFence(g) {
  g.fillStyle(0x8b6a36).fillRect(0, 0, 32, 1);
  g.fillStyle(0x8b6a36).fillRect(0, 5, 32, 1);
  for (let i = 0; i < 4; i++) {
    g.fillStyle(0x8b6a36).fillRect(2 + i * 8, 0, 2, 10);
  }
}

export function paintBin(g) {
  g.fillStyle(0x555555).fillRect(0, 1, 8, 9);
  g.fillStyle(0x333333).fillRect(0, 0, 8, 2);
  g.fillStyle(0x777777).fillRect(1, 3, 1, 6);
}

// Catálogo completo: { id, w, h, paint }
export const DECOR_CATALOG = [
  { id: 'tile',           w: 16, h: 16, paint: paintTile },
  { id: 'grass',          w: 16, h: 16, paint: paintGrass },
  { id: 'ladder',         w: 16, h: 16, paint: paintLadder },
  { id: 'rope',           w: 16, h: 16, paint: paintRope },
  { id: 'lattice',        w: 16, h: 16, paint: paintLattice },
  { id: 'door',           w: 16, h: 24, paint: paintDoor },
  { id: 'sign',           w: 8,  h: 10, paint: paintSign },
  { id: 'book_enemy',     w: 14, h: 12, paint: paintBookEnemy },
  { id: 'shelf',          w: 16, h: 32, paint: paintShelf },
  { id: 'ball',           w: 6,  h: 6,  paint: paintBall },
  { id: 'chalkboard',     w: 32, h: 20, paint: paintChalkboard },
  { id: 'chalkboard_big', w: 80, h: 40, paint: paintChalkboardBig },
  { id: 'desk',           w: 14, h: 10, paint: paintDesk },
  { id: 'chair',          w: 8,  h: 9,  paint: paintChair },
  { id: 'teacher_desk',   w: 24, h: 18, paint: paintTeacherDesk },
  { id: 'clock',          w: 14, h: 14, paint: paintClock },
  { id: 'poster',         w: 24, h: 18, paint: paintPoster },
  { id: 'lamp',           w: 12, h: 14, paint: paintLamp },
  { id: 'map',            w: 28, h: 20, paint: paintMap },
  { id: 'reading_table',  w: 28, h: 14, paint: paintReadingTable },
  { id: 'shelf_tall',     w: 20, h: 48, paint: paintShelfTall },
  { id: 'cloud',          w: 16, h: 5,  paint: paintCloud },
  { id: 'mountain',       w: 32, h: 14, paint: paintMountain },
  { id: 'tree',           w: 16, h: 20, paint: paintTree },
  { id: 'fence',          w: 32, h: 10, paint: paintFence },
  { id: 'bin',            w: 8,  h: 10, paint: paintBin },
];
