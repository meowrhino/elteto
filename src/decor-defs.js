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
  // Marco exterior con sombra (más oscuro abajo/derecha) y highlight arriba
  g.fillStyle(0x6a4a2a).fillRect(0, 0, 80, 40);          // marco base
  g.fillStyle(0x8a6a3a).fillRect(0, 0, 80, 1);            // highlight superior
  g.fillStyle(0x8a6a3a).fillRect(0, 0, 1, 40);            // highlight izq
  g.fillStyle(0x3a2010).fillRect(0, 39, 80, 1);           // sombra inferior
  g.fillStyle(0x3a2010).fillRect(79, 0, 1, 40);           // sombra der
  // Tornillos en las esquinas
  g.fillStyle(0x222222).fillRect(2, 2, 1, 1);
  g.fillStyle(0x222222).fillRect(77, 2, 1, 1);
  g.fillStyle(0x222222).fillRect(2, 34, 1, 1);
  g.fillStyle(0x222222).fillRect(77, 34, 1, 1);
  // Superficie de pizarra (con leve gradiente: top más oscuro)
  g.fillStyle(0x102e22).fillRect(2, 2, 76, 2);            // banda alta más oscura
  g.fillStyle(0x1a3a2a).fillRect(2, 4, 76, 32);           // verde pizarra
  g.fillStyle(0x0a2218).fillRect(2, 35, 76, 1);           // banda baja
  // Restos de tiza (polvo) — varios píxeles diseminados de gris claro
  const dust = 0x556a5a;
  g.fillStyle(dust);
  g.fillRect(8, 6, 1, 1);   g.fillRect(35, 5, 1, 1);
  g.fillRect(62, 7, 1, 1);  g.fillRect(15, 14, 1, 1);
  g.fillRect(45, 18, 1, 1); g.fillRect(70, 22, 1, 1);
  g.fillRect(25, 30, 1, 1); g.fillRect(55, 33, 1, 1);
  // Ecuación a la izquierda (más legible que antes)
  g.fillStyle(0xffffff);
  g.fillRect(6, 8, 10, 1);   // —
  g.fillRect(6, 11, 6, 1);   // —
  g.fillRect(20, 8, 1, 5);   // |
  g.fillRect(20, 8, 4, 1);   // —
  g.fillRect(20, 10, 3, 1);  // —
  // Diagrama a la derecha (cuadro con flecha)
  g.fillStyle(0xffe066);
  g.fillRect(46, 12, 14, 1); g.fillRect(46, 22, 14, 1);
  g.fillRect(46, 12, 1, 11); g.fillRect(59, 12, 1, 11);
  g.fillRect(60, 17, 4, 1);  // flecha →
  g.fillRect(62, 16, 1, 1); g.fillRect(63, 16, 1, 1);
  g.fillRect(62, 18, 1, 1); g.fillRect(63, 18, 1, 1);
  // Texto escrito largo (líneas más sueltas, "fluyendo")
  g.fillStyle(0xeeeeee);
  g.fillRect(6, 26, 18, 1);  g.fillRect(6, 28, 22, 1);
  g.fillRect(6, 30, 14, 1);  g.fillRect(6, 32, 19, 1);
  // Bandeja de tizas con dos tizas
  g.fillStyle(0x4a3018).fillRect(0, 36, 80, 4);
  g.fillStyle(0x6a4a2a).fillRect(0, 36, 80, 1);           // canto superior
  g.fillStyle(0xffffff).fillRect(8, 38, 6, 1);            // tiza blanca
  g.fillStyle(0xffffff).fillRect(8, 37, 1, 1);            // punto extremo
  g.fillStyle(0xffaa44).fillRect(20, 38, 4, 1);           // tiza naranja
  g.fillStyle(0x88ddee).fillRect(30, 38, 3, 1);           // tiza azul
  g.fillStyle(0xee8888).fillRect(60, 38, 4, 1);           // tiza roja
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
  // Libro rojo abierto con páginas
  g.fillStyle(0xaa3333).fillRect(3, 0, 6, 3);
  g.fillStyle(0xee9999).fillRect(3, 0, 6, 1);     // canto superior brillo
  g.fillStyle(0xfff8e0).fillRect(4, 1, 4, 1);     // páginas
  g.fillStyle(0x222222).fillRect(5, 1, 2, 1);     // texto
  // Libro azul cerrado
  g.fillStyle(0x2266aa).fillRect(10, 1, 6, 2);
  g.fillStyle(0x4488cc).fillRect(10, 1, 6, 1);    // canto sup
  g.fillStyle(0xffe066).fillRect(11, 2, 1, 1);    // detalle dorado
  // Manzana con tallo y hoja
  g.fillStyle(0x553311).fillRect(18, 0, 1, 1);    // tallo
  g.fillStyle(0x33aa33).fillRect(19, 0, 2, 1);    // hoja
  g.fillStyle(0xcc4444).fillRect(17, 1, 3, 2);    // cuerpo manzana
  g.fillStyle(0xee7766).fillRect(17, 1, 1, 1);    // brillo
  g.fillStyle(0x882222).fillRect(19, 2, 1, 1);    // sombra
  // Tablero con veta de madera
  g.fillStyle(0x8b5a36).fillRect(0, 3, 24, 5);
  g.fillStyle(0xa07040).fillRect(0, 3, 24, 1);    // brillo superior
  g.fillStyle(0x6b4226).fillRect(0, 7, 24, 1);    // sombra inferior
  g.fillStyle(0x7a4a26).fillRect(4, 5, 16, 1);    // veta
  // Patas con sombra
  g.fillStyle(0x6b4226).fillRect(2, 8, 2, 10);
  g.fillStyle(0x4a2818).fillRect(3, 8, 1, 10);    // sombra pata izq
  g.fillStyle(0x6b4226).fillRect(20, 8, 2, 10);
  g.fillStyle(0x4a2818).fillRect(21, 8, 1, 10);   // sombra pata der
  // Pequeño cajón al frente
  g.fillStyle(0x6b4226).fillRect(8, 5, 8, 2);
  g.fillStyle(0xddaa44).fillRect(11, 6, 2, 1);    // tirador
}

export function paintClock(g) {
  // Marco con sombra y highlight
  g.fillStyle(0x222222).fillCircle(7, 7, 7);
  g.fillStyle(0x444444).fillCircle(7, 6, 7);      // highlight superior
  g.fillStyle(0x111111).fillCircle(7, 8, 7);      // sombra inferior (sobreescribe parte)
  g.fillStyle(0xeeeeee).fillCircle(7, 7, 6);      // esfera blanca
  g.fillStyle(0xddccaa).fillCircle(7, 7, 6);      // tono crema (más cálido)
  g.fillStyle(0xeeddbb).fillCircle(7, 6, 5);      // brillo arriba
  // Marcas: las 4 cardinales más gruesas, las 8 secundarias finas
  g.fillStyle(0x222222);
  g.fillRect(7, 1, 1, 2);    // 12 (más larga)
  g.fillRect(11, 7, 2, 1);   // 3
  g.fillRect(7, 11, 1, 2);   // 6
  g.fillRect(1, 7, 2, 1);    // 9
  // Marcas secundarias (puntos)
  g.fillRect(10, 3, 1, 1);   // 1-2
  g.fillRect(11, 4, 1, 1);
  g.fillRect(11, 10, 1, 1);  // 4-5
  g.fillRect(10, 11, 1, 1);
  g.fillRect(4, 11, 1, 1);   // 7-8
  g.fillRect(3, 10, 1, 1);
  g.fillRect(3, 4, 1, 1);    // 10-11
  g.fillRect(4, 3, 1, 1);
  // Agujas
  g.fillStyle(0x222222).fillRect(7, 3, 1, 4);     // minutera (apunta a 12)
  g.fillStyle(0x553333).fillRect(7, 7, 3, 1);     // horaria (apunta a 3) tono cálido
  // Tornillo central
  g.fillStyle(0xaa4444).fillRect(7, 7, 1, 1);
}

export function paintPoster(g) {
  // Papel con leve gradiente (más blanco arriba, amarillento abajo)
  g.fillStyle(0xfff0c8).fillRect(0, 0, 24, 9);    // mitad superior clara
  g.fillStyle(0xeeddaa).fillRect(0, 9, 24, 9);    // mitad inferior cálida
  // Borde marrón con esquinas redondeadas (recortadas)
  g.fillStyle(0x884422).fillRect(1, 0, 22, 1);
  g.fillStyle(0x884422).fillRect(1, 17, 22, 1);
  g.fillStyle(0x884422).fillRect(0, 1, 1, 16);
  g.fillStyle(0x884422).fillRect(23, 1, 1, 16);
  // Chinchetas en las cuatro esquinas
  g.fillStyle(0xcc4444).fillRect(2, 1, 1, 1);
  g.fillStyle(0xcc4444).fillRect(21, 1, 1, 1);
  g.fillStyle(0xcc4444).fillRect(2, 16, 1, 1);
  g.fillStyle(0xcc4444).fillRect(21, 16, 1, 1);
  // Letras estilizadas: ABC, DEF, GHI (3 filas de 5 con colores)
  const palette = [0x222222, 0x884422, 0x226688, 0x886622, 0x884422];
  for (let row = 0; row < 3; row++) {
    const yy = 3 + row * 5;
    for (let col = 0; col < 5; col++) {
      const xx = 3 + col * 4;
      g.fillStyle(palette[col]).fillRect(xx, yy, 2, 2);
      // Sombra debajo de cada letra
      g.fillStyle(0x553300).fillRect(xx, yy + 2, 2, 1);
    }
  }
}

export function paintLamp(g) {
  // Cable más fino y largo
  g.fillStyle(0x111111).fillRect(5, 0, 1, 6);     // cable izq
  g.fillStyle(0x333333).fillRect(6, 0, 1, 6);     // cable der (highlight)
  // Soporte metálico
  g.fillStyle(0x553311).fillRect(3, 6, 6, 1);     // borde superior
  g.fillStyle(0xaa8844).fillRect(2, 7, 8, 1);     // metal
  g.fillStyle(0xddaa66).fillRect(2, 7, 8, 1);     // brillo
  // Pantalla acampanada (forma trapecio)
  g.fillStyle(0xddaa33).fillRect(2, 8, 8, 1);     // borde superior pantalla
  g.fillStyle(0xffe066).fillRect(1, 9, 10, 3);    // cuerpo amarillo
  g.fillStyle(0xfff0aa).fillRect(2, 9, 8, 1);     // brillo interior
  g.fillStyle(0xddaa33).fillRect(0, 12, 12, 1);   // borde más ancho
  g.fillStyle(0x886622).fillRect(0, 13, 12, 1);   // sombra inferior
  // Halo de luz (efecto glow simulado con un punto brillante centro)
  g.fillStyle(0xfff8dd).fillRect(5, 10, 2, 1);
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
  // Tronco con textura de corteza
  g.fillStyle(0x4a2511).fillRect(7, 11, 2, 9);
  g.fillStyle(0x6a3a18).fillRect(7, 11, 1, 9);    // brillo izq
  g.fillStyle(0x2a1408).fillRect(8, 14, 1, 3);    // sombra/grieta
  // Copa: capa exterior más oscura (silueta)
  g.fillStyle(0x1a4a1a).fillRect(2, 4, 12, 8);
  g.fillStyle(0x1a4a1a).fillRect(3, 3, 10, 1);
  g.fillStyle(0x1a4a1a).fillRect(4, 2, 8, 1);
  g.fillStyle(0x1a4a1a).fillRect(1, 6, 1, 3);     // bulto izq
  g.fillStyle(0x1a4a1a).fillRect(14, 6, 1, 3);    // bulto der
  // Copa media
  g.fillStyle(0x2a6a2a).fillRect(3, 4, 10, 7);
  g.fillStyle(0x2a6a2a).fillRect(4, 3, 8, 1);
  // Brillos de luz (hojas con luz)
  g.fillStyle(0x4abb4a);
  g.fillRect(4, 5, 2, 1); g.fillRect(7, 4, 1, 1);
  g.fillRect(10, 5, 2, 1); g.fillRect(5, 7, 1, 1);
  g.fillRect(9, 8, 2, 1); g.fillRect(4, 9, 1, 1);
  // Toques amarillos / frutos
  g.fillStyle(0xffcc44);
  g.fillRect(6, 6, 1, 1); g.fillRect(11, 7, 1, 1);
  // Pequeña sombra al pie del tronco
  g.fillStyle(0x000000).fillRect(5, 19, 6, 1);
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
