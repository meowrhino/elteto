// Definiciones de drawers para los props/decor del juego. Cada función
// recibe un `g` con la interfaz mínima `fillStyle(int).fillRect(x,y,w,h)`
// y `fillCircle(x,y,r)`. Se usa desde:
//   - Phaser (g = scene.add.graphics()) → makeStaticTextures como fallback.
//   - Node (g = PixelCanvas) → tools/export-decor.mjs para generar PNGs.
//
// Para añadir un decor nuevo: define la función paintX(g) y añádela a DECOR.

export function paintTile(g) {
  // Tablones de madera con veta y juntas
  g.fillStyle(0x6b4226).fillRect(0, 0, 16, 16);
  g.fillStyle(0x8b5a36).fillRect(0, 0, 16, 3);    // canto superior claro
  g.fillStyle(0xaa6f4a).fillRect(0, 0, 16, 1);    // brillo
  g.fillStyle(0x4a2818).fillRect(0, 3, 16, 1);    // sombra bajo canto
  g.fillStyle(0x7a4a26).fillRect(2, 6, 12, 1);    // veta
  g.fillStyle(0x7a4a26).fillRect(4, 11, 10, 1);   // veta
  g.fillStyle(0x4a2818).fillRect(0, 15, 16, 1);   // junta inferior
  // Nudos
  g.fillStyle(0x4a2818).fillRect(5, 9, 1, 1);
  g.fillStyle(0x4a2818).fillRect(11, 5, 1, 1);
}

export function paintGrass(g) {
  // Tierra
  g.fillStyle(0x4a3018).fillRect(0, 0, 16, 16);
  g.fillStyle(0x6a4828).fillRect(0, 4, 16, 1);    // veta tierra
  g.fillStyle(0x3a2410).fillRect(0, 10, 16, 1);   // veta más oscura
  // Hierba (capa superior)
  g.fillStyle(0x3a8f40).fillRect(0, 0, 16, 4);    // base hierba
  g.fillStyle(0x4caf50).fillRect(0, 0, 16, 3);    // hierba media
  g.fillStyle(0x66bb6a).fillRect(0, 0, 16, 1);    // brillo arriba
  // Briznas que sobresalen
  g.fillStyle(0x88dd80);
  g.fillRect(2, 0, 1, 2); g.fillRect(6, 0, 1, 2);
  g.fillRect(10, 0, 1, 2); g.fillRect(14, 0, 1, 2);
  // Florecitas / piedras
  g.fillStyle(0xffe066).fillRect(4, 1, 1, 1);
  g.fillStyle(0xee8888).fillRect(12, 2, 1, 1);
}

export function paintLadder(g) {
  // Largueros con sombra a la derecha
  g.fillStyle(0xc88a3a).fillRect(3, 0, 2, 16);
  g.fillStyle(0xa07020).fillRect(4, 0, 1, 16);    // sombra larguero izq
  g.fillStyle(0xc88a3a).fillRect(11, 0, 2, 16);
  g.fillStyle(0xa07020).fillRect(12, 0, 1, 16);   // sombra larguero der
  // Brillos
  g.fillStyle(0xeeaa66).fillRect(3, 0, 1, 16);
  g.fillStyle(0xeeaa66).fillRect(11, 0, 1, 16);
  // Peldaños con sombra inferior
  for (const y of [2, 8, 14]) {
    g.fillStyle(0xc88a3a).fillRect(2, y, 12, 2);
    g.fillStyle(0xa07020).fillRect(2, y + 1, 12, 1);
  }
}

export function paintRope(g) {
  // Cuerda trenzada: alternancia de tonos para sugerir trenzado
  g.fillStyle(0xb88a3a).fillRect(7, 0, 2, 16);
  g.fillStyle(0xddaa66).fillRect(7, 0, 1, 16);    // brillo izq
  // Nudos de trenza (anillos cada 4 px)
  for (let y = 1; y < 16; y += 3) {
    g.fillStyle(0x8a6020).fillRect(7, y, 2, 1);
  }
  // Pequeño nudo más visible al inicio
  g.fillStyle(0x5a3a10).fillRect(6, 0, 4, 1);
}

export function paintLattice(g) {
  // Rejilla cruzada con marco doble (sugerir alambre)
  g.fillStyle(0xaaaaaa);
  for (let i = 0; i <= 16; i += 4) {
    g.fillRect(0, i, 16, 1);
    g.fillRect(i, 0, 1, 16);
  }
  // Sombras de las intersecciones
  g.fillStyle(0x666666);
  for (let i = 0; i <= 16; i += 4) {
    g.fillRect(i, i, 1, 1);
  }
  // Tornillos de fijación en las esquinas
  g.fillStyle(0x333333);
  g.fillRect(0, 0, 1, 1); g.fillRect(15, 0, 1, 1);
  g.fillRect(0, 15, 1, 1); g.fillRect(15, 15, 1, 1);
}

export function paintDoor(g) {
  // Marco exterior con brillo y sombra
  g.fillStyle(0x4a2511).fillRect(0, 0, 16, 24);
  g.fillStyle(0x6a3a18).fillRect(0, 0, 16, 1);    // brillo arriba
  g.fillStyle(0x6a3a18).fillRect(0, 0, 1, 24);    // brillo izq
  g.fillStyle(0x2a1408).fillRect(15, 0, 1, 24);   // sombra der
  // Hoja interior
  g.fillStyle(0x6a3a18).fillRect(2, 2, 12, 20);
  // Dos paneles (típica puerta con marquetería)
  g.fillStyle(0x4a2511).fillRect(3, 3, 10, 8);
  g.fillStyle(0x4a2511).fillRect(3, 13, 10, 8);
  g.fillStyle(0x8a5a2a).fillRect(3, 3, 10, 1);    // borde claro panel 1
  g.fillStyle(0x8a5a2a).fillRect(3, 13, 10, 1);   // borde claro panel 2
  // Pomo dorado con brillo
  g.fillStyle(0xddaa44).fillRect(11, 12, 2, 2);
  g.fillStyle(0xffe066).fillRect(11, 12, 1, 1);   // brillo
  g.fillStyle(0x886622).fillRect(12, 13, 1, 1);   // sombra
}

export function paintSign(g) {
  // Tabla con borde
  g.fillStyle(0x4a2511).fillRect(0, 0, 8, 6);     // marco
  g.fillStyle(0xeeddaa).fillRect(1, 1, 6, 4);     // papel
  g.fillStyle(0x222222).fillRect(2, 2, 4, 1);     // texto línea 1
  g.fillStyle(0x222222).fillRect(2, 4, 3, 1);     // texto línea 2
  // Mástil
  g.fillStyle(0x4a2511).fillRect(3, 6, 2, 4);
  g.fillStyle(0x6a3a18).fillRect(3, 6, 1, 4);     // brillo
}

export function paintBookEnemy(g) {
  // Libro abierto con tapa roja
  g.fillStyle(0x7a1f1f).fillRect(0, 0, 14, 12);
  g.fillStyle(0xaa3333).fillRect(0, 0, 14, 1);    // brillo arriba
  g.fillStyle(0x4a0808).fillRect(0, 11, 14, 1);   // sombra
  // Páginas blancas (un poco encogidas, como abultadas)
  g.fillStyle(0xeeeeee).fillRect(2, 2, 10, 8);
  g.fillStyle(0xccccaa).fillRect(2, 9, 10, 1);    // sombra páginas
  // Lomo central
  g.fillStyle(0x7a1f1f).fillRect(6, 0, 2, 12);
  g.fillStyle(0x4a0808).fillRect(7, 0, 1, 12);
  // Ojos rojos brillantes (poseído)
  g.fillStyle(0x440000).fillRect(3, 4, 3, 3);
  g.fillStyle(0xff2222).fillRect(4, 5, 2, 2);
  g.fillStyle(0xffaa88).fillRect(4, 5, 1, 1);     // brillo
  g.fillStyle(0x440000).fillRect(8, 4, 3, 3);
  g.fillStyle(0xff2222).fillRect(8, 5, 2, 2);
  g.fillStyle(0xffaa88).fillRect(8, 5, 1, 1);
}

export function paintShelf(g) {
  // Cuerpo de madera oscura con brillo izquierdo
  g.fillStyle(0x3a1f0a).fillRect(0, 0, 16, 32);
  g.fillStyle(0x5a3018).fillRect(0, 0, 1, 32);
  g.fillStyle(0x1a0a00).fillRect(15, 0, 1, 32);   // sombra der
  const rows = [
    [0x4a8aaa, 0xaa4a4a, 0x4aaa4a, 0xaaaa4a],
    [0xaa4a4a, 0x4aaa4a, 0x4a8aaa, 0xaa4aaa],
    [0x4aaa4a, 0xaa4aaa, 0xaaaa4a, 0xaa4a4a],
  ];
  for (let r = 0; r < 3; r++) {
    const yy = 1 + r * 8;
    // Estante (madera más clara con sombra debajo)
    g.fillStyle(0xb88a3a).fillRect(1, yy, 14, 6);
    g.fillStyle(0xd0aa55).fillRect(1, yy, 14, 1); // brillo superior
    g.fillStyle(0x886020).fillRect(1, yy + 5, 14, 1); // sombra
    // Libros con cubierta y "páginas" abajo
    for (let i = 0; i < 4; i++) {
      const xx = 2 + i * 3;
      g.fillStyle(rows[r][i]).fillRect(xx, yy + 1, 2, 4);
      g.fillStyle(0xffffff).fillRect(xx, yy + 5, 2, 1); // páginas
    }
  }
}

export function paintBall(g) {
  // Pelota tipo fútbol clásica (blanca con pentágonos)
  g.fillStyle(0xeeeeee).fillCircle(3, 3, 3);
  g.fillStyle(0xffffff).fillCircle(3, 2, 2);      // brillo superior
  // Pentágonos negros
  g.fillStyle(0x222222);
  g.fillRect(2, 0, 2, 1); g.fillRect(2, 5, 2, 1);
  g.fillRect(0, 2, 1, 2); g.fillRect(5, 2, 1, 2);
  g.fillRect(2, 2, 2, 2);                          // centro
}

export function paintChalkboard(g) {
  // Versión pequeña (32x20). Mismo estilo que la grande pero compacta.
  g.fillStyle(0x6a4a2a).fillRect(0, 0, 32, 20);
  g.fillStyle(0x8a6a3a).fillRect(0, 0, 32, 1);    // brillo superior
  g.fillStyle(0x3a2010).fillRect(0, 19, 32, 1);   // sombra inferior
  // Esquinas con tornillos
  g.fillStyle(0x222222).fillRect(1, 1, 1, 1);
  g.fillStyle(0x222222).fillRect(30, 1, 1, 1);
  // Pizarra
  g.fillStyle(0x1a3a2a).fillRect(2, 2, 28, 16);
  // Polvo de tiza
  g.fillStyle(0x556a5a);
  g.fillRect(8, 4, 1, 1); g.fillRect(22, 6, 1, 1);
  g.fillRect(15, 12, 1, 1); g.fillRect(25, 14, 1, 1);
  // Texto
  g.fillStyle(0xffffff).fillRect(5, 6, 1, 1);
  g.fillStyle(0xffffff).fillRect(5, 8, 6, 1);
  g.fillStyle(0xffffff).fillRect(5, 12, 4, 1);
  g.fillStyle(0xffffff).fillRect(12, 14, 8, 1);
  // Bandeja
  g.fillStyle(0x4a3018).fillRect(0, 17, 32, 2);
  g.fillStyle(0xffffff).fillRect(3, 18, 3, 1);    // tiza
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
  // Tablero con brillo y sombra
  g.fillStyle(0x8b5a36).fillRect(0, 0, 14, 4);
  g.fillStyle(0xaa7040).fillRect(0, 0, 14, 1);    // brillo
  g.fillStyle(0x6b4226).fillRect(0, 3, 14, 1);    // sombra
  // Patas
  g.fillStyle(0x6b4226).fillRect(2, 4, 2, 6);
  g.fillStyle(0x6b4226).fillRect(10, 4, 2, 6);
  g.fillStyle(0x4a2818).fillRect(3, 4, 1, 6);     // sombra pata izq
  g.fillStyle(0x4a2818).fillRect(11, 4, 1, 6);    // sombra pata der
}

export function paintChair(g) {
  // Asiento con brillo
  g.fillStyle(0x6b4226).fillRect(0, 0, 8, 1);
  g.fillStyle(0x8b5a36).fillRect(0, 0, 8, 1);
  // Respaldo (barras verticales)
  g.fillStyle(0x6b4226).fillRect(0, 1, 1, 4);
  g.fillStyle(0x6b4226).fillRect(3, 1, 1, 4);     // barra media
  // Patas con sombra
  g.fillStyle(0x6b4226).fillRect(0, 5, 1, 4);
  g.fillStyle(0x4a2818).fillRect(1, 5, 1, 4);
  g.fillStyle(0x6b4226).fillRect(7, 1, 1, 8);
  g.fillStyle(0x4a2818).fillRect(7, 8, 1, 1);
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
  // Listones de madera arriba y abajo (con brillo y sombra)
  g.fillStyle(0x6b4226).fillRect(0, 0, 28, 1);
  g.fillStyle(0x8b5a36).fillRect(0, 0, 28, 1);
  g.fillStyle(0x6b4226).fillRect(0, 19, 28, 1);
  g.fillStyle(0x4a2818).fillRect(0, 19, 28, 1);
  // Pomos en los extremos de los listones (para enrollar)
  g.fillStyle(0xddaa44).fillRect(0, 0, 1, 1);
  g.fillStyle(0xddaa44).fillRect(27, 0, 1, 1);
  g.fillStyle(0xddaa44).fillRect(0, 19, 1, 1);
  g.fillStyle(0xddaa44).fillRect(27, 19, 1, 1);
  // Mar azul de fondo (gradiente)
  g.fillStyle(0x5588cc).fillRect(0, 1, 28, 18);
  g.fillStyle(0x6699dd).fillRect(0, 1, 28, 6);     // mar más claro arriba
  // Continentes con sombra
  g.fillStyle(0xeed8a0).fillRect(2, 3, 8, 5);
  g.fillStyle(0xcca878).fillRect(2, 7, 8, 1);       // costa sombreada
  g.fillStyle(0xeed8a0).fillRect(12, 4, 5, 6);
  g.fillStyle(0xcca878).fillRect(12, 9, 5, 1);
  g.fillStyle(0xeed8a0).fillRect(18, 6, 8, 8);
  g.fillStyle(0xcca878).fillRect(18, 13, 8, 1);
  g.fillStyle(0xeed8a0).fillRect(3, 11, 6, 5);
  g.fillStyle(0xcca878).fillRect(3, 15, 6, 1);
  // Detalles: pin rojo + cordillera + río
  g.fillStyle(0x882200).fillRect(15, 8, 1, 1);     // pin sombra
  g.fillStyle(0xff4444).fillRect(14, 7, 1, 1);     // pin cabeza
  g.fillStyle(0x886622).fillRect(20, 9, 4, 1);     // cordillera
  g.fillStyle(0x4488aa).fillRect(5, 4, 1, 4);      // río
}

export function paintReadingTable(g) {
  // Libro abierto encima (con páginas blancas y texto)
  g.fillStyle(0xaa3333).fillRect(7, 0, 7, 2);
  g.fillStyle(0xee9999).fillRect(7, 0, 7, 1);
  g.fillStyle(0xfff8e0).fillRect(8, 1, 5, 1);     // páginas
  g.fillStyle(0x222222).fillRect(9, 1, 1, 1);
  g.fillStyle(0x222222).fillRect(11, 1, 1, 1);
  // Lápiz al lado
  g.fillStyle(0xffe066).fillRect(18, 1, 3, 1);
  g.fillStyle(0x553311).fillRect(21, 1, 1, 1);    // punta
  // Tablero con veta
  g.fillStyle(0x8b5a36).fillRect(0, 2, 28, 4);
  g.fillStyle(0xaa7040).fillRect(0, 2, 28, 1);    // brillo
  g.fillStyle(0x6b4226).fillRect(0, 5, 28, 1);    // sombra
  g.fillStyle(0x7a4a26).fillRect(4, 3, 20, 1);    // veta
  // Patas con sombra
  g.fillStyle(0x6b4226).fillRect(2, 6, 2, 8);
  g.fillStyle(0x4a2818).fillRect(3, 6, 1, 8);
  g.fillStyle(0x6b4226).fillRect(24, 6, 2, 8);
  g.fillStyle(0x4a2818).fillRect(25, 6, 1, 8);
}

export function paintShelfTall(g) {
  // Estructura
  g.fillStyle(0x3a1f0a).fillRect(0, 0, 20, 48);
  g.fillStyle(0x5a3018).fillRect(0, 0, 1, 48);
  g.fillStyle(0x1a0a00).fillRect(19, 0, 1, 48);
  // Coronación
  g.fillStyle(0x5a3018).fillRect(0, 0, 20, 1);
  for (let row = 0; row < 4; row++) {
    const yy = 2 + row * 12;
    // Estante
    g.fillStyle(0xb88a3a).fillRect(1, yy, 18, 8);
    g.fillStyle(0xd0aa55).fillRect(1, yy, 18, 1);
    g.fillStyle(0x886020).fillRect(1, yy + 7, 18, 1);
    const cols = [0x4a8aaa, 0xaa4a4a, 0x4aaa4a, 0xaaaa4a, 0xaa4aaa, 0x88cc44];
    // Libros con detalle
    for (let i = 0; i < 6; i++) {
      const xx = 2 + i * 3;
      const col = cols[(i + row) % cols.length];
      g.fillStyle(col).fillRect(xx, yy + 1, 2, 5);
      // Banda decorativa dorada en algunos libros
      if ((i + row) % 3 === 0) {
        g.fillStyle(0xddaa44).fillRect(xx, yy + 3, 2, 1);
      }
      g.fillStyle(0xffffff).fillRect(xx, yy + 6, 2, 1); // páginas
    }
  }
}

export function paintCloud(g) {
  // Sombra inferior (gris claro)
  g.fillStyle(0xccccdd).fillRect(2, 4, 12, 1);
  g.fillStyle(0xccccdd).fillRect(0, 3, 16, 1);
  // Cuerpo blanco
  g.fillStyle(0xffffff).fillRect(2, 1, 12, 3);
  g.fillStyle(0xffffff).fillRect(0, 2, 16, 2);
  g.fillStyle(0xffffff).fillRect(3, 0, 8, 1);
  // Brillos
  g.fillStyle(0xffffff).fillRect(4, 0, 1, 1);
}

export function paintMountain(g) {
  // Tres montañas con nieve en las cumbres y sombra a la derecha
  g.fillStyle(0x3a3a5a).fillRect(0, 8, 32, 6);
  // Montaña izq
  g.fillStyle(0x3a3a5a).fillRect(4, 5, 8, 8);
  g.fillStyle(0x5a5a7a).fillRect(4, 5, 4, 8);     // cara iluminada
  g.fillStyle(0xeeeeee).fillRect(6, 5, 4, 1);     // nieve cumbre
  // Montaña central (la más alta)
  g.fillStyle(0x3a3a5a).fillRect(14, 2, 10, 11);
  g.fillStyle(0x5a5a7a).fillRect(14, 2, 5, 11);   // cara iluminada
  g.fillStyle(0xeeeeee).fillRect(16, 2, 6, 2);    // nieve cumbre
  g.fillStyle(0xcccce0).fillRect(15, 4, 3, 1);    // brillo nieve
  // Montaña der
  g.fillStyle(0x3a3a5a).fillRect(22, 6, 8, 8);
  g.fillStyle(0x5a5a7a).fillRect(22, 6, 4, 8);
  g.fillStyle(0xeeeeee).fillRect(24, 6, 4, 1);
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
  // Listones horizontales con brillo y sombra
  g.fillStyle(0x8b6a36).fillRect(0, 0, 32, 1);
  g.fillStyle(0xaa8246).fillRect(0, 0, 32, 1);    // brillo
  g.fillStyle(0x8b6a36).fillRect(0, 5, 32, 1);
  g.fillStyle(0x6a4a16).fillRect(0, 5, 32, 1);    // sombra
  // Postes verticales con punta y sombra
  for (let i = 0; i < 4; i++) {
    const x = 2 + i * 8;
    g.fillStyle(0x8b6a36).fillRect(x, 0, 2, 10);
    g.fillStyle(0xaa8246).fillRect(x, 0, 1, 10);  // brillo izq
    g.fillStyle(0x6a4a16).fillRect(x + 1, 0, 1, 10); // sombra der
    // Punta del poste
    g.fillStyle(0x6a4a16).fillRect(x, 0, 2, 1);
  }
}

export function paintBin(g) {
  // Cuerpo metálico
  g.fillStyle(0x555555).fillRect(0, 2, 8, 8);
  g.fillStyle(0x777777).fillRect(0, 2, 1, 8);     // brillo izq
  g.fillStyle(0x333333).fillRect(7, 2, 1, 8);     // sombra der
  // Tapa
  g.fillStyle(0x333333).fillRect(0, 0, 8, 2);
  g.fillStyle(0x555555).fillRect(0, 0, 8, 1);     // brillo tapa
  // Asa de la tapa
  g.fillStyle(0x222222).fillRect(3, 0, 2, 1);
  // Banda decorativa
  g.fillStyle(0x444444).fillRect(0, 6, 8, 1);
  // Base
  g.fillStyle(0x222222).fillRect(0, 9, 8, 1);
}

// ============================================================ decor único por sala

// Gimnasio
export function paintScoreboard(g) {
  // Carcasa metálica
  g.fillStyle(0x222222).fillRect(0, 0, 32, 16);
  g.fillStyle(0x444444).fillRect(0, 0, 32, 1);
  g.fillStyle(0x000000).fillRect(0, 15, 32, 1);
  // Pantalla negra
  g.fillStyle(0x080808).fillRect(2, 2, 28, 12);
  // Dígitos LED rojos: "07  12"
  g.fillStyle(0xff2222);
  // "07"
  g.fillRect(4, 4, 3, 1); g.fillRect(4, 4, 1, 4); g.fillRect(6, 4, 1, 8);
  g.fillRect(9, 4, 1, 8); g.fillRect(10, 4, 2, 1); g.fillRect(10, 7, 2, 1);
  g.fillRect(12, 4, 1, 8); g.fillRect(10, 11, 2, 1);
  // ":" separador
  g.fillRect(15, 6, 1, 1); g.fillRect(15, 10, 1, 1);
  // "12"
  g.fillRect(18, 4, 1, 8);
  g.fillRect(21, 4, 1, 1); g.fillRect(20, 4, 1, 1); g.fillRect(22, 4, 1, 1);
  g.fillRect(22, 5, 1, 3); g.fillRect(20, 8, 3, 1); g.fillRect(20, 8, 1, 4);
  g.fillRect(20, 11, 3, 1);
}

export function paintBasket(g) {
  // Tablero blanco
  g.fillStyle(0xeeeeee).fillRect(2, 0, 8, 8);
  g.fillStyle(0xff2222).fillRect(4, 2, 4, 4);     // cuadrado interior
  // Aro naranja
  g.fillStyle(0xff8822).fillRect(3, 8, 6, 1);
  g.fillStyle(0xcc5500).fillRect(3, 9, 6, 1);
  // Red blanca
  g.fillStyle(0xeeeeee);
  for (let i = 0; i < 6; i++) {
    if (i % 2 === 0) g.fillRect(3 + i, 10, 1, 5);
    else g.fillRect(3 + i, 10, 1, 3);
  }
  // Poste
  g.fillStyle(0x666666).fillRect(0, 14, 12, 1);
  g.fillStyle(0x444444).fillRect(0, 15, 12, 1);
  g.fillStyle(0x666666).fillRect(5, 15, 2, 5);
}

export function paintMat(g) {
  // Colchoneta apilada (2 capas)
  g.fillStyle(0x3a6a8a).fillRect(0, 0, 16, 3);
  g.fillStyle(0x5a8aaa).fillRect(0, 0, 16, 1);    // brillo
  g.fillStyle(0x2a4a6a).fillRect(0, 2, 16, 1);
  g.fillStyle(0xcc4444).fillRect(0, 3, 16, 3);
  g.fillStyle(0xee6666).fillRect(0, 3, 16, 1);    // brillo
  g.fillStyle(0x882222).fillRect(0, 5, 16, 1);
}

// Comedor
export function paintTray(g) {
  // Bandeja con comida
  g.fillStyle(0x888888).fillRect(0, 1, 8, 3);     // bandeja
  g.fillStyle(0xaaaaaa).fillRect(0, 1, 8, 1);     // brillo
  g.fillStyle(0x666666).fillRect(0, 3, 8, 1);     // sombra
  // Comida (puré + pieza)
  g.fillStyle(0xddaa66).fillRect(1, 0, 3, 1);     // puré amarillo
  g.fillStyle(0x886622).fillRect(5, 0, 2, 1);     // carne marrón
}

export function paintSodaMachine(g) {
  // Marco
  g.fillStyle(0xcc2222).fillRect(0, 0, 16, 32);
  g.fillStyle(0xee4444).fillRect(0, 0, 16, 1);
  g.fillStyle(0x882222).fillRect(0, 31, 16, 1);
  g.fillStyle(0x882222).fillRect(15, 0, 1, 32);
  // Pantalla / logo
  g.fillStyle(0xffffff).fillRect(2, 2, 12, 4);
  g.fillStyle(0xcc2222).fillRect(4, 3, 8, 2);     // "logo" rojo
  // Cristal mostrando latas
  g.fillStyle(0x88ccee).fillRect(2, 7, 12, 14);
  g.fillStyle(0xaaddff).fillRect(2, 7, 12, 1);    // reflejo
  // Latas (3 columnas x 3 filas)
  const cans = [0xcc2222, 0x22aa44, 0x2266cc];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      g.fillStyle(cans[col]).fillRect(3 + col * 4, 8 + row * 4, 3, 3);
      g.fillStyle(0xffffff).fillRect(3 + col * 4, 8 + row * 4, 3, 1);
    }
  }
  // Botonera
  g.fillStyle(0x222222).fillRect(2, 22, 12, 6);
  for (let i = 0; i < 6; i++) {
    g.fillStyle(0xffe066).fillRect(3 + (i % 3) * 4, 23 + Math.floor(i / 3) * 3, 2, 2);
  }
  // Salida de latas
  g.fillStyle(0x222222).fillRect(2, 29, 12, 2);
}

// Aula música
export function paintPiano(g) {
  // Mueble negro/marrón oscuro
  g.fillStyle(0x222222).fillRect(0, 0, 24, 16);
  g.fillStyle(0x444444).fillRect(0, 0, 24, 1);    // brillo
  g.fillStyle(0x000000).fillRect(0, 15, 24, 1);
  // Atril plegable (parte superior)
  g.fillStyle(0x331111).fillRect(2, 0, 20, 2);
  g.fillStyle(0xeeeeee).fillRect(4, 1, 16, 1);    // hoja blanca
  // Teclas blancas
  g.fillStyle(0xffffff).fillRect(2, 12, 20, 4);
  // Líneas entre teclas blancas
  g.fillStyle(0x444444);
  for (let i = 1; i < 8; i++) {
    g.fillRect(2 + i * 2.5, 12, 1, 4);
  }
  // Teclas negras
  g.fillStyle(0x000000);
  g.fillRect(4, 12, 1, 2); g.fillRect(7, 12, 1, 2);
  g.fillRect(12, 12, 1, 2); g.fillRect(15, 12, 1, 2); g.fillRect(18, 12, 1, 2);
  // Patas
  g.fillStyle(0x222222).fillRect(2, 16, 2, 4);
  g.fillStyle(0x222222).fillRect(20, 16, 2, 4);
}

export function paintMusicStand(g) {
  // Atril metálico negro
  // Soporte de partituras (rectángulo inclinado)
  g.fillStyle(0x222222).fillRect(0, 0, 10, 6);
  g.fillStyle(0xeeeeee).fillRect(1, 1, 8, 4);     // partitura
  g.fillStyle(0x222222);
  g.fillRect(2, 2, 6, 1); g.fillRect(2, 4, 5, 1); // pentagrama
  // Notas musicales (puntos negros)
  g.fillStyle(0x000000);
  g.fillRect(3, 2, 1, 1); g.fillRect(5, 3, 1, 1); g.fillRect(7, 2, 1, 1);
  // Vara central
  g.fillStyle(0x222222).fillRect(4, 6, 2, 10);
  // Base trípode
  g.fillStyle(0x222222).fillRect(1, 16, 8, 1);
  g.fillStyle(0x222222).fillRect(0, 17, 2, 1);
  g.fillStyle(0x222222).fillRect(8, 17, 2, 1);
}

// Sótano
export function paintBoiler(g) {
  // Cuerpo cilíndrico (rectángulo con bordes redondeados visualmente)
  g.fillStyle(0x666666).fillRect(0, 2, 20, 22);
  g.fillStyle(0x888888).fillRect(0, 2, 20, 1);    // brillo arriba
  g.fillStyle(0xaaaaaa).fillRect(2, 4, 16, 1);
  g.fillStyle(0x444444).fillRect(0, 23, 20, 1);   // sombra abajo
  g.fillStyle(0x222222).fillRect(0, 24, 20, 0);
  // Tapa superior
  g.fillStyle(0x444444).fillRect(2, 0, 16, 3);
  g.fillStyle(0x666666).fillRect(2, 0, 16, 1);
  // Manómetros (2 círculos amarillos)
  g.fillStyle(0xffe066).fillCircle(6, 12, 3);
  g.fillStyle(0xffe066).fillCircle(14, 12, 3);
  g.fillStyle(0x222222).fillRect(6, 12, 1, -2);
  g.fillStyle(0x222222).fillRect(14, 12, 2, 1);
  // Llama bajo (sugerencia de fuego)
  g.fillStyle(0xff6622).fillRect(6, 19, 8, 4);
  g.fillStyle(0xffaa22).fillRect(8, 20, 4, 3);
  g.fillStyle(0xffe066).fillRect(9, 21, 2, 2);
  // Tubos a los lados
  g.fillStyle(0x666666).fillRect(0, 8, 2, 4);
  g.fillStyle(0x666666).fillRect(18, 8, 2, 4);
}

export function paintPipe(g) {
  // Tubería metálica horizontal con uniones
  g.fillStyle(0x666666).fillRect(0, 1, 32, 4);
  g.fillStyle(0x888888).fillRect(0, 1, 32, 1);    // brillo
  g.fillStyle(0x444444).fillRect(0, 4, 32, 1);    // sombra
  // Uniones cada 8 px
  g.fillStyle(0x444444);
  for (let i = 0; i < 4; i++) {
    g.fillRect(i * 8 + 3, 0, 2, 6);
    g.fillStyle(0x222222).fillRect(i * 8 + 4, 0, 1, 6); g.fillStyle(0x444444);
  }
}

// Cuarto del protagonista
export function paintBed(g) {
  // Estructura de la cama (marco)
  g.fillStyle(0x6b4226).fillRect(0, 6, 32, 6);
  g.fillStyle(0x8b5a36).fillRect(0, 6, 32, 1);
  g.fillStyle(0x4a2818).fillRect(0, 11, 32, 1);
  // Cabecero
  g.fillStyle(0x6b4226).fillRect(0, 0, 4, 12);
  g.fillStyle(0x8b5a36).fillRect(0, 0, 4, 1);
  g.fillStyle(0x4a2818).fillRect(3, 0, 1, 12);
  // Pies de cama
  g.fillStyle(0x6b4226).fillRect(28, 4, 4, 8);
  // Sábanas y manta
  g.fillStyle(0xddccaa).fillRect(4, 4, 24, 4);    // sábana
  g.fillStyle(0xeeddbb).fillRect(4, 4, 24, 1);    // brillo
  g.fillStyle(0x4488aa).fillRect(4, 8, 24, 3);    // manta azul
  g.fillStyle(0x66aacc).fillRect(4, 8, 24, 1);    // brillo manta
  // Almohada
  g.fillStyle(0xffffff).fillRect(5, 2, 7, 4);
  g.fillStyle(0xddccaa).fillRect(5, 5, 7, 1);     // sombra
}

export function paintBandPoster(g) {
  // Póster oscuro con texto/símbolo
  g.fillStyle(0x111111).fillRect(0, 0, 16, 16);
  g.fillStyle(0x333333).fillRect(0, 0, 16, 1);
  g.fillStyle(0x000000).fillRect(0, 15, 16, 1);
  // "Logo" central (estilo metal): un rayo amarillo
  g.fillStyle(0xffe066);
  g.fillRect(7, 2, 2, 4);
  g.fillRect(5, 6, 6, 1);
  g.fillRect(7, 7, 2, 6);
  g.fillRect(9, 7, 3, 1);
  // Texto debajo (letras blancas estilizadas)
  g.fillStyle(0xffffff);
  g.fillRect(3, 13, 2, 1); g.fillRect(6, 13, 2, 1);
  g.fillRect(9, 13, 2, 1); g.fillRect(12, 13, 2, 1);
  // Chinchetas
  g.fillStyle(0xcc4444);
  g.fillRect(1, 1, 1, 1); g.fillRect(14, 1, 1, 1);
  g.fillRect(1, 14, 1, 1); g.fillRect(14, 14, 1, 1);
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
  // Decor único por sala
  { id: 'scoreboard',     w: 32, h: 16, paint: paintScoreboard },
  { id: 'basket',         w: 12, h: 20, paint: paintBasket },
  { id: 'mat',            w: 16, h: 6,  paint: paintMat },
  { id: 'tray',           w: 8,  h: 4,  paint: paintTray },
  { id: 'soda_machine',   w: 16, h: 32, paint: paintSodaMachine },
  { id: 'piano',          w: 24, h: 20, paint: paintPiano },
  { id: 'music_stand',    w: 10, h: 18, paint: paintMusicStand },
  { id: 'boiler',         w: 20, h: 24, paint: paintBoiler },
  { id: 'pipe',           w: 32, h: 6,  paint: paintPipe },
  { id: 'bed',            w: 32, h: 12, paint: paintBed },
  { id: 'band_poster',    w: 16, h: 16, paint: paintBandPoster },
];
