import { ensureSprite, SPRITE_W, SPRITE_H } from '../characters.js';
import { bus } from '../events.js';

// Acepta número (0xRRGGBB) o string ('#rrggbb' / 'rrggbb') y devuelve int.
function toInt(c) {
  if (typeof c === 'number') return c;
  if (typeof c === 'string') {
    const s = c.startsWith('#') ? c.slice(1) : c;
    return parseInt(s, 16);
  }
  return 0x000000;
}

// Base de cualquier sala del juego.
// Las salas concretas extienden esta clase y definen su geometría en buildRoom().
//
// La sala se encarga de:
//   - generar texturas estáticas (suelo, escaleras, decoración)
//   - construir grupos de plataformas, escaleras, puertas, NPCs y enemigos
//   - spawnear al protagonista y a sus followers
//   - gestionar input básico (movimiento, climbing, E, TAB, "-")
//   - integrar modo visión (sepia) y countdown de lifespan
//
// Las salas no deberían tocar nada de input/física: solo "decorar" el mundo.
export class RoomScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.worldWidth = 320;
    this.worldHeight = 180;
    this.bgColor = '#1a1a2a';
  }

  // ============================================================ create
  create() {
    this.cameras.main.setBackgroundColor(this.bgColor);
    this.makeStaticTextures();

    // Grupos físicos
    this.platforms = this.physics.add.staticGroup();
    this.climbs = this.physics.add.staticGroup();
    this.doors = this.physics.add.staticGroup();
    this.signs = this.physics.add.staticGroup();
    this.npcs = this.physics.add.staticGroup();
    this.enemies = this.physics.add.staticGroup();
    this.decor = this.add.group();

    this.labels = [];
    // trail se inicializa en spawnPartyAndFollowers() — pre-rellenado para
    // que los followers no salten al spawn en el primer frame.

    this.buildRoom();
    this.spawnPartyAndFollowers();
    this.setupCamera();
    this.setupInput();
    this.setupHints();
    this.subscribeEvents();
    this.buildLifespanLabels();

    // Aplicar sepia si venimos de otra sala con visión activada
    this.applySepia(!!(this.registry.get('flags') || {}).sepia);
  }

  spawnPartyAndFollowers() {
    const party = this.registry.get('party');
    const playerState = this.registry.get('player');
    const playerKey = ensureSprite(this, party[0].sprite);
    this.player = this.physics.add.sprite(playerState.x, playerState.y, playerKey);
    this.player.setCollideWorldBounds(true);
    // Cuerpo de colisión más pequeño que el sprite, para que pisar escaleras
    // y bordes sea más permisivo
    this.player.body.setSize(SPRITE_W - 4, SPRITE_H - 2);
    this.player.body.setOffset(2, 1);
    this.player.setDepth(10); // por encima de los followers
    this.physics.add.collider(this.player, this.platforms);

    // Followers — sin físicas, posicionados desde el trail del player.
    // Se spawn DESPLAZADOS a la izquierda para que sean visibles ya en frame 0
    // (si nacieran sobre el player, el último insertado lo tapa hasta que el
    // trail se llene y se separen).
    this.followers = [];
    this.trail = [];
    const FOLLOWER_GAP = 14;
    const FOLLOWER_LAG = 20; // frames de lag entre cada follower
    for (let i = 1; i < party.length; i++) {
      const k = ensureSprite(this, party[i].sprite);
      const offset = i * FOLLOWER_GAP;
      const f = this.add.sprite(playerState.x - offset, playerState.y, k);
      f.setDepth(10 - i); // detrás del player y entre sí
      this.followers.push(f);
    }
    // Pre-llenar el trail simulando que el player ha caminado hacia la derecha
    // hasta llegar al spawn. Así trail[length-lag] coincide con la posición
    // donde nace cada follower y no hay "salto" hacia el player en frame 1.
    const PREFILL = (party.length) * FOLLOWER_LAG;
    const RATE = FOLLOWER_GAP / FOLLOWER_LAG; // px por frame
    for (let t = 0; t < PREFILL; t++) {
      const age = PREFILL - t; // frames hacia atrás
      this.trail.push({ x: playerState.x - age * RATE, y: playerState.y });
    }
  }

  setupCamera() {
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAction = this.input.keyboard.addKey('E');
    this.keyMenu = this.input.keyboard.addKey('TAB');
    this.keyVision = this.input.keyboard.addKey('MINUS');
    this.input.keyboard.addCapture('TAB');

    // Cuando la sala se reanuda tras diálogo/menú/combate, reseteamos
    // el estado de teclas para que un E o TAB pulsados no disparen nada
    if (!this._onResume) this._onResume = () => this.input.keyboard.resetKeys();
    this.events.off('resume', this._onResume);
    this.events.on('resume', this._onResume);
  }

  setupHints() {
    this.hintText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#fff',
      backgroundColor: '#000', padding: { x: 2, y: 1 }, align: 'center',
    }).setDepth(100).setVisible(false);
  }

  subscribeEvents() {
    this._unsubFirstVision = bus(this.registry).on('first-vision', () => this.onFirstVision());
    this.events.once('shutdown', () => this._unsubFirstVision && this._unsubFirstVision());
  }

  // Override en subclases para reaccionar al primer toggle de visión
  onFirstVision() {}

  // ============================================================ texturas estáticas
  makeStaticTextures() {
    if (this.textures.exists('tile')) return;
    const g = this.add.graphics();

    // Tiles de suelo
    g.fillStyle(0x6b4226).fillRect(0, 0, 16, 16);
    g.fillStyle(0x8b5a36).fillRect(0, 0, 16, 3);
    g.generateTexture('tile', 16, 16); g.clear();

    g.fillStyle(0x4a3018).fillRect(0, 0, 16, 16);
    g.fillStyle(0x4caf50).fillRect(0, 0, 16, 4);
    g.fillStyle(0x66bb6a).fillRect(2, 0, 2, 2);
    g.fillStyle(0x66bb6a).fillRect(10, 1, 2, 2);
    g.generateTexture('grass', 16, 16); g.clear();

    // Climbables
    g.fillStyle(0xc88a3a);
    g.fillRect(3, 0, 2, 16); g.fillRect(11, 0, 2, 16);
    g.fillRect(2, 2, 12, 2); g.fillRect(2, 8, 12, 2); g.fillRect(2, 14, 12, 2);
    g.generateTexture('ladder', 16, 16); g.clear();

    g.fillStyle(0xb88a3a).fillRect(7, 0, 2, 16);
    g.fillStyle(0xa07020).fillRect(7, 4, 2, 1);
    g.fillStyle(0xa07020).fillRect(7, 11, 2, 1);
    g.generateTexture('rope', 16, 16); g.clear();

    g.lineStyle(1, 0x888888);
    for (let i = 0; i <= 16; i += 4) {
      g.beginPath(); g.moveTo(0, i); g.lineTo(16, i); g.strokePath();
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 16); g.strokePath();
    }
    g.generateTexture('lattice', 16, 16); g.clear();

    // Puerta y cartel
    g.fillStyle(0x4a2511).fillRect(0, 0, 16, 24);
    g.fillStyle(0x2a1408).fillRect(2, 2, 12, 20);
    g.fillStyle(0xffd166).fillRect(11, 12, 2, 2);
    g.generateTexture('door', 16, 24); g.clear();

    g.fillStyle(0xeeeeee).fillRect(0, 0, 8, 6);
    g.fillStyle(0x4a2511).fillRect(3, 6, 2, 4);
    g.generateTexture('sign', 8, 10); g.clear();

    // Decoración / props
    g.fillStyle(0x7a1f1f).fillRect(0, 0, 14, 12);
    g.fillStyle(0xeeeeee).fillRect(2, 2, 10, 8);
    g.fillStyle(0x7a1f1f).fillRect(6, 0, 2, 12);
    g.fillStyle(0xff0000).fillRect(4, 5, 2, 2);
    g.fillStyle(0xff0000).fillRect(8, 5, 2, 2);
    g.generateTexture('book_enemy', 14, 12); g.clear();

    g.fillStyle(0x3a1f0a).fillRect(0, 0, 16, 32);
    g.fillStyle(0xb88a3a).fillRect(1, 1, 14, 6);
    g.fillStyle(0x4a8aaa).fillRect(2, 2, 2, 5); g.fillStyle(0xaa4a4a).fillRect(5, 2, 2, 5);
    g.fillStyle(0x4aaa4a).fillRect(8, 2, 2, 5); g.fillStyle(0xaaaa4a).fillRect(11, 2, 2, 5);
    g.fillStyle(0xb88a3a).fillRect(1, 9, 14, 6);
    g.fillStyle(0xaa4a4a).fillRect(2, 10, 2, 5); g.fillStyle(0x4aaa4a).fillRect(5, 10, 2, 5);
    g.fillStyle(0x4a8aaa).fillRect(8, 10, 2, 5); g.fillStyle(0xaa4aaa).fillRect(11, 10, 2, 5);
    g.fillStyle(0xb88a3a).fillRect(1, 17, 14, 6);
    g.fillStyle(0x4aaa4a).fillRect(2, 18, 2, 5); g.fillStyle(0xaa4aaa).fillRect(5, 18, 2, 5);
    g.fillStyle(0xaaaa4a).fillRect(8, 18, 2, 5); g.fillStyle(0xaa4a4a).fillRect(11, 18, 2, 5);
    g.generateTexture('shelf', 16, 32); g.clear();

    g.fillStyle(0xffffff).fillCircle(3, 3, 3);
    g.fillStyle(0x222222).fillRect(2, 0, 2, 1); g.fillStyle(0x222222).fillRect(2, 5, 2, 1);
    g.fillStyle(0x222222).fillRect(0, 2, 1, 2); g.fillStyle(0x222222).fillRect(5, 2, 1, 2);
    g.generateTexture('ball', 6, 6); g.clear();

    g.fillStyle(0x6a4a2a).fillRect(0, 0, 32, 20);
    g.fillStyle(0x1a3a2a).fillRect(2, 2, 28, 16);
    g.fillStyle(0xffffff).fillRect(5, 6, 1, 1);
    g.fillStyle(0xffffff).fillRect(5, 8, 6, 1);
    g.fillStyle(0xffffff).fillRect(5, 12, 4, 1);
    g.generateTexture('chalkboard', 32, 20); g.clear();

    // Pizarra grande (para aula amueblada)
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
    g.fillStyle(0xeeeeee).fillRect(40, 16, 1, 12); // tiza vertical
    g.fillStyle(0xeeeeee).fillRect(48, 16, 1, 4);
    g.fillStyle(0xeeeeee).fillRect(48, 24, 1, 4);
    g.fillStyle(0xeeeeee).fillRect(48, 16, 6, 1);
    g.fillStyle(0xeeeeee).fillRect(48, 24, 6, 1);
    g.fillStyle(0xeeeeee).fillRect(53, 16, 1, 12);
    // bandeja de tizas
    g.fillStyle(0x4a3018).fillRect(0, 37, 80, 3);
    g.fillStyle(0xffffff).fillRect(8, 38, 4, 1);
    g.fillStyle(0xffaa44).fillRect(20, 38, 3, 1);
    g.generateTexture('chalkboard_big', 80, 40); g.clear();

    g.fillStyle(0x8b5a36).fillRect(0, 0, 14, 4);
    g.fillStyle(0x6b4226).fillRect(2, 4, 2, 6);
    g.fillStyle(0x6b4226).fillRect(10, 4, 2, 6);
    g.generateTexture('desk', 14, 10); g.clear();

    // Silla
    g.fillStyle(0x6b4226).fillRect(0, 0, 8, 1);     // asiento
    g.fillStyle(0x6b4226).fillRect(0, 1, 1, 4);     // respaldo
    g.fillStyle(0x6b4226).fillRect(0, 5, 1, 4);     // pata trasera
    g.fillStyle(0x6b4226).fillRect(7, 1, 1, 8);     // pata delantera
    g.generateTexture('chair', 8, 9); g.clear();

    // Mesa profesora (con libros y manzana encima)
    g.fillStyle(0xaa3333).fillRect(4, 0, 4, 3);     // libro rojo
    g.fillStyle(0x2266aa).fillRect(10, 1, 5, 2);    // libro azul
    g.fillStyle(0x33aa33).fillRect(18, 0, 1, 1);    // hojita de la manzana
    g.fillStyle(0xcc4444).fillRect(18, 1, 2, 2);    // manzana
    g.fillStyle(0x8b5a36).fillRect(0, 3, 24, 5);    // tablero
    g.fillStyle(0x6b4226).fillRect(2, 8, 2, 10);    // pata izq
    g.fillStyle(0x6b4226).fillRect(20, 8, 2, 10);   // pata der
    g.generateTexture('teacher_desk', 24, 18); g.clear();

    // Reloj de pared
    g.fillStyle(0x111111).fillCircle(7, 7, 7);
    g.fillStyle(0xeeeeee).fillCircle(7, 7, 6);
    g.fillStyle(0x111111).fillRect(7, 7, 1, -4);    // aguja minutera
    g.fillStyle(0x111111).fillRect(7, 7, 3, 1);     // aguja horaria
    g.fillStyle(0x111111).fillRect(7, 1, 1, 1);     // 12
    g.fillStyle(0x111111).fillRect(13, 7, 1, 1);    // 3
    g.fillStyle(0x111111).fillRect(7, 13, 1, 1);    // 6
    g.fillStyle(0x111111).fillRect(1, 7, 1, 1);     // 9
    g.generateTexture('clock', 14, 14); g.clear();

    // Póster (alfabeto/mapa estilizado)
    g.fillStyle(0xeeddaa).fillRect(0, 0, 24, 18);
    g.fillStyle(0x884422).fillRect(0, 0, 24, 1);
    g.fillStyle(0x884422).fillRect(0, 17, 24, 1);
    g.fillStyle(0x884422).fillRect(0, 0, 1, 18);
    g.fillStyle(0x884422).fillRect(23, 0, 1, 18);
    // Letras simuladas
    g.fillStyle(0x222222).fillRect(3, 3, 2, 2);
    g.fillStyle(0x222222).fillRect(7, 3, 2, 2);
    g.fillStyle(0x222222).fillRect(11, 3, 2, 2);
    g.fillStyle(0x222222).fillRect(15, 3, 2, 2);
    g.fillStyle(0x222222).fillRect(19, 3, 2, 2);
    g.fillStyle(0x222222).fillRect(3, 8, 2, 2);
    g.fillStyle(0x222222).fillRect(7, 8, 2, 2);
    g.fillStyle(0x222222).fillRect(11, 8, 2, 2);
    g.fillStyle(0x222222).fillRect(15, 8, 2, 2);
    g.fillStyle(0x222222).fillRect(19, 8, 2, 2);
    g.fillStyle(0x222222).fillRect(3, 13, 2, 2);
    g.fillStyle(0x222222).fillRect(7, 13, 2, 2);
    g.fillStyle(0x222222).fillRect(11, 13, 2, 2);
    g.fillStyle(0x222222).fillRect(15, 13, 2, 2);
    g.fillStyle(0x222222).fillRect(19, 13, 2, 2);
    g.generateTexture('poster', 24, 18); g.clear();

    // Lámpara colgante (biblioteca)
    g.fillStyle(0x222222).fillRect(5, 0, 2, 6);       // cable
    g.fillStyle(0xaa8844).fillRect(2, 6, 8, 2);       // soporte
    g.fillStyle(0xffe066).fillRect(1, 8, 10, 5);      // pantalla amarilla
    g.fillStyle(0xddaa33).fillRect(2, 13, 8, 1);      // borde inferior
    g.generateTexture('lamp', 12, 14); g.clear();

    // Mapa (de pared, para biblio)
    g.fillStyle(0x6b4226).fillRect(0, 0, 28, 1);       // listón superior
    g.fillStyle(0x6b4226).fillRect(0, 19, 28, 1);      // listón inferior
    g.fillStyle(0xeed8a0).fillRect(0, 1, 28, 18);      // papel
    g.fillStyle(0x5588cc).fillRect(0, 1, 28, 18);      // mar azul (sobrescribe)
    g.fillStyle(0xeed8a0).fillRect(2, 3, 8, 5);        // tierra 1
    g.fillStyle(0xeed8a0).fillRect(12, 4, 5, 6);
    g.fillStyle(0xeed8a0).fillRect(18, 6, 8, 8);
    g.fillStyle(0xeed8a0).fillRect(3, 11, 6, 5);
    g.fillStyle(0xcc4444).fillRect(15, 8, 1, 1);       // pin rojo
    g.generateTexture('map', 28, 20); g.clear();

    // Mesa de lectura (biblio, larga, con libro)
    g.fillStyle(0xaa3333).fillRect(8, 0, 5, 2);        // libro encima
    g.fillStyle(0xeeeeee).fillRect(9, 1, 3, 1);        // páginas
    g.fillStyle(0x8b5a36).fillRect(0, 2, 28, 4);       // tablero
    g.fillStyle(0x6b4226).fillRect(2, 6, 2, 8);        // pata izq
    g.fillStyle(0x6b4226).fillRect(24, 6, 2, 8);       // pata der
    g.generateTexture('reading_table', 28, 14); g.clear();

    // Estantería alta (variante grande, sin perder la 'shelf' existente)
    g.fillStyle(0x3a1f0a).fillRect(0, 0, 20, 48);
    for (let row = 0; row < 4; row++) {
      const yy = 2 + row * 12;
      g.fillStyle(0xb88a3a).fillRect(1, yy, 18, 8);
      // libros con tonos variados
      const cols = [0x4a8aaa, 0xaa4a4a, 0x4aaa4a, 0xaaaa4a, 0xaa4aaa, 0x88cc44];
      for (let i = 0; i < 6; i++) {
        const cx = 2 + i * 3;
        g.fillStyle(cols[(i + row) % cols.length]).fillRect(cx, yy + 1, 2, 6);
      }
    }
    g.generateTexture('shelf_tall', 20, 48); g.clear();

    // Nube
    g.fillStyle(0xffffff).fillRect(2, 1, 12, 4);
    g.fillStyle(0xffffff).fillRect(0, 2, 16, 2);
    g.fillStyle(0xffffff).fillRect(3, 0, 8, 1);
    g.generateTexture('cloud', 16, 5); g.clear();

    // Silueta de montaña (para parallax lejano del patio)
    g.fillStyle(0x3a3a5a).fillRect(0, 8, 32, 6);
    g.fillStyle(0x3a3a5a).fillRect(4, 5, 8, 8);
    g.fillStyle(0x3a3a5a).fillRect(14, 2, 10, 11);
    g.fillStyle(0x3a3a5a).fillRect(22, 6, 8, 8);
    g.generateTexture('mountain', 32, 14); g.clear();

    // Árbol (patio)
    g.fillStyle(0x4a2511).fillRect(7, 12, 2, 8);       // tronco
    g.fillStyle(0x2a6a2a).fillRect(2, 4, 12, 8);       // copa
    g.fillStyle(0x2a6a2a).fillRect(4, 2, 8, 4);
    g.fillStyle(0x3aaa3a).fillRect(3, 5, 2, 2);        // toques de luz
    g.fillStyle(0x3aaa3a).fillRect(10, 6, 2, 2);
    g.generateTexture('tree', 16, 20); g.clear();

    // Vallado bajo (patio, atrás del juego)
    g.fillStyle(0x8b6a36).fillRect(0, 0, 32, 1);       // listón superior
    g.fillStyle(0x8b6a36).fillRect(0, 5, 32, 1);       // listón inferior
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x8b6a36).fillRect(2 + i * 8, 0, 2, 10);
    }
    g.generateTexture('fence', 32, 10); g.clear();

    // Papelera (patio)
    g.fillStyle(0x555555).fillRect(0, 1, 8, 9);
    g.fillStyle(0x333333).fillRect(0, 0, 8, 2);        // borde superior
    g.fillStyle(0x777777).fillRect(1, 3, 1, 6);        // brillo
    g.generateTexture('bin', 8, 10); g.clear();

    g.destroy();
  }

  // ============================================================ interior
  // Dibuja un "interior" de habitación: pared trasera + zócalo + opcionalmente techo.
  // Llamar desde buildRoom() antes de añadir decor/NPCs/puertas para que quede atrás.
  //
  // opts:
  //   wallColor      — color sólido de la pared (hex 0xRRGGBB o '#rgb')
  //   floorTop       — y del borde superior del suelo (default: worldHeight - 20)
  //   ceilingHeight  — altura del techo (rectángulo arriba). 0 = sin techo distinto.
  //   ceilingColor   — color del techo (si ceilingHeight > 0)
  //   baseboardColor — color del zócalo (franja oscura encima del suelo)
  //   baseboardH     — alto del zócalo (default 4 px)
  buildInterior(opts = {}) {
    const W = this.worldWidth;
    const H = this.worldHeight;
    const wallColor      = toInt(opts.wallColor ?? 0x3b3656);
    const floorTop       = opts.floorTop ?? (H - 20);
    const ceilingHeight  = opts.ceilingHeight ?? 0;
    const ceilingColor   = toInt(opts.ceilingColor ?? this.bgColor);
    const baseboardColor = toInt(opts.baseboardColor ?? 0x221b34);
    const baseboardH     = opts.baseboardH ?? 4;

    // Techo
    if (ceilingHeight > 0) {
      this.add.rectangle(0, 0, W, ceilingHeight, ceilingColor)
        .setOrigin(0, 0).setDepth(-100).setScrollFactor(1);
    }

    // Pared trasera (de debajo del techo hasta el suelo)
    const wallTop = ceilingHeight;
    const wallH   = floorTop - wallTop;
    this.add.rectangle(0, wallTop, W, wallH, wallColor)
      .setOrigin(0, 0).setDepth(-90).setScrollFactor(1);

    // Zócalo
    this.add.rectangle(0, floorTop - baseboardH, W, baseboardH, baseboardColor)
      .setOrigin(0, 0).setDepth(-80).setScrollFactor(1);

    return { wallTop, wallH, floorTop };
  }

  // ============================================================ ventana con parallax
  // Ventana con vista al exterior: cielo + colina + sol con parallax recortado al marco.
  // El contenido es ancho (para que el parallax nunca lo deje sin cielo bajo el hueco)
  // y se enmascara al rect interior usando una geometryMask.
  //
  // opts: { x, y, w=48, h=32, skyColor, hillColor, frameColor, scrollFactor=0.55 }
  addWindow(opts) {
    const x = opts.x;
    const y = opts.y;
    const w = opts.w ?? 48;
    const h = opts.h ?? 32;
    const skyColor   = toInt(opts.skyColor   ?? 0x88c8ff);
    const hillColor  = toInt(opts.hillColor  ?? 0x3a7a3a);
    const frameColor = toInt(opts.frameColor ?? 0x4a2511);
    const sf = opts.scrollFactor ?? 0.55;

    const innerX = x + 2, innerY = y + 2;
    const innerW = w - 4, innerH = h - 4;

    // Máscara geométrica del hueco interior (no se mueve respecto al marco)
    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(innerX, innerY, innerW, innerH);
    const mask = maskGfx.createGeometryMask();

    // Cielo ancho — abarca varias veces la anchura del hueco para que el
    // parallax nunca lo deje "vacío" bajo la máscara.
    const skyW = innerW + this.worldWidth * 2;
    const skyX = innerX - this.worldWidth; // centrado a la izquierda del hueco
    const sky = this.add.rectangle(skyX, innerY, skyW, innerH, skyColor)
      .setOrigin(0, 0).setDepth(-75).setScrollFactor(sf, 1);
    sky.setMask(mask);

    // Colinas (más cercanas, parallax algo mayor)
    const hillH = Math.max(6, Math.floor(innerH * 0.35));
    const hill = this.add.rectangle(skyX, innerY + innerH - hillH, skyW, hillH, hillColor)
      .setOrigin(0, 0).setDepth(-74).setScrollFactor(Math.min(1, sf + 0.2), 1);
    hill.setMask(mask);

    // Sol — anclado al marco (sin parallax) para que siempre quede visible
    // dentro de la ventana cuando se cruza por delante de ella.
    this.add.circle(innerX + innerW - 8, innerY + 6, 2.5, 0xffe066)
      .setDepth(-73).setScrollFactor(1, 1);

    // Marco (sin parallax — pegado a la pared)
    const t = 2;
    this.add.rectangle(x, y, w, t, frameColor).setOrigin(0, 0).setDepth(-72);
    this.add.rectangle(x, y + h - t, w, t, frameColor).setOrigin(0, 0).setDepth(-72);
    this.add.rectangle(x, y, t, h, frameColor).setOrigin(0, 0).setDepth(-72);
    this.add.rectangle(x + w - t, y, t, h, frameColor).setOrigin(0, 0).setDepth(-72);
    // travesaños en cruz
    this.add.rectangle(x + Math.floor(w / 2) - 1, y, t, h, frameColor).setOrigin(0, 0).setDepth(-72);
    this.add.rectangle(x, y + Math.floor(h / 2) - 1, w, t, frameColor).setOrigin(0, 0).setDepth(-72);
    // alféizar
    this.add.rectangle(x - 2, y + h, w + 4, 2, frameColor).setOrigin(0, 0).setDepth(-71);

    return { x, y, w, h };
  }

  // ============================================================ builders
  addPlatform(x, y, w = 1, h = 1, tex = 'tile') {
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        this.platforms.create(x + i * 16, y + j * 16, tex).setOrigin(0, 0).refreshBody();
      }
    }
  }

  addClimb(x, y, h = 1, type = 'ladder') {
    for (let j = 0; j < h; j++) {
      this.climbs.create(x, y + j * 16, type).setOrigin(0, 0).refreshBody();
    }
  }

  addDoor(x, y, target, spawnX, spawnY, label = 'entrar') {
    const door = this.doors.create(x, y, 'door').setOrigin(0, 0).refreshBody();
    door.setData({ target, spawnX, spawnY, label });
    return door;
  }

  addSign(x, y, text) {
    const sign = this.signs.create(x, y, 'sign').setOrigin(0, 0).refreshBody();
    sign.setData('text', text);
    return sign;
  }

  /**
   * Crea un NPC con un sprite generado por la factory de characters.
   * opts: { id?, name, dialogue, sprite, lifespan?, onTalk? }
   *   - dialogue: string[] | { speaker, text }[]
   *   - onTalk: función opcional que recibe (scene) y reemplaza el openDialogue por defecto
   */
  addNpc(x, y, opts) {
    const defeated = this.registry.get('defeated') || {};
    if (opts.id && defeated[opts.id]) return null;
    const key = ensureSprite(this, opts.sprite);
    const npc = this.npcs.create(x, y, key).setOrigin(0, 0).refreshBody();
    npc.setData('id', opts.id || null);
    npc.setData('name', opts.name);
    npc.setData('dialogue', opts.dialogue);
    npc.setData('onTalk', opts.onTalk || null);
    npc.setData('lifespan', opts.lifespan ?? Math.floor(60 + Math.random() * 90));
    return npc;
  }

  /**
   * Crea un enemigo. opts:
   *   { id, name, hp, atk, dialogue?, texture? | charSprite?, special? }
   * Si pasa `charSprite`, se genera el sprite con la factory de personajes.
   * Si pasa `texture`, se usa una textura estática (ej. 'book_enemy').
   */
  addEnemy(x, y, opts) {
    const defeated = this.registry.get('defeated') || {};
    if (defeated[opts.id]) return null;
    let key = opts.texture;
    if (!key && opts.charSprite) key = ensureSprite(this, opts.charSprite);
    if (!key) key = 'book_enemy';
    const e = this.enemies.create(x, y, key).setOrigin(0, 0).refreshBody();
    e.setData('config', opts);
    return e;
  }

  addDecor(x, y, tex) {
    const d = this.add.image(x, y, tex).setOrigin(0, 0);
    this.decor.add(d);
    return d;
  }

  // ============================================================ visión / lifespan
  buildLifespanLabels() {
    const mkText = () => this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#fff',
      backgroundColor: '#000', padding: { x: 1, y: 0 },
    }).setDepth(50).setVisible(false);

    const party = this.registry.get('party');
    this.labels = [];
    this.labels.push({ sprite: this.player, get: () => party[0].lifespan, text: mkText() });
    this.followers.forEach((f, i) => {
      this.labels.push({ sprite: f, get: () => party[i + 1].lifespan, text: mkText() });
    });
    this.npcs.getChildren().forEach(n => {
      this.labels.push({ sprite: n, get: () => n.getData('lifespan') ?? 0, text: mkText() });
    });
  }

  updateLifespanLabels() {
    const on = this.sepiaOn;
    for (const l of this.labels) {
      l.text.setVisible(on);
      if (!on) continue;
      const v = Math.max(0, Math.ceil(l.get()));
      l.text.setText(`${v}s`);
      const top = l.sprite.getTopCenter();
      l.text.setPosition(top.x - 8, top.y - 10);
    }
  }

  decrementLifespans(dtSec) {
    if (!this.sepiaOn) return;
    const party = this.registry.get('party');
    party.forEach(p => { if (p.lifespan > 0) p.lifespan = Math.max(0, p.lifespan - dtSec); });
    this.registry.set('party', party);
    this.npcs.getChildren().forEach(n => {
      let l = n.getData('lifespan') ?? 0;
      if (l <= 0) return;
      l = Math.max(0, l - dtSec);
      n.setData('lifespan', l);
      if (l === 0) {
        n.setTint(0x666666);
        if (!n.getData('deathDialogue')) n.setData('dialogue', ['(no responde)']);
      }
    });
  }

  applySepia(on) {
    this.sepiaOn = on;
    if (this.cameras.main.postFX) {
      this.cameras.main.postFX.clear();
      if (on) this.cameras.main.postFX.addColorMatrix().sepia();
    }
    this.updateLifespanLabels();
  }

  toggleVision() {
    const flags = this.registry.get('flags') || {};
    const was = !!flags.sepia;
    flags.sepia = !was;
    this.registry.set('flags', flags);
    this.applySepia(!was);
    if (!was && !flags.firstVisionDone) {
      flags.firstVisionDone = true;
      this.registry.set('flags', flags);
      bus(this.registry).emit('first-vision');
    }
  }

  // ============================================================ loop principal
  update(time, delta) {
    const dt = delta / 1000;

    // Detectar solapamientos del frame
    let onClimb = false, activeDoor = null, activeSign = null, activeNpc = null, activeEnemy = null;
    this.physics.overlap(this.player, this.climbs, () => { onClimb = true; });
    this.physics.overlap(this.player, this.doors, (_, d) => { activeDoor = d; });
    this.physics.overlap(this.player, this.signs, (_, s) => { activeSign = s; });
    this.physics.overlap(this.player, this.npcs, (_, n) => { activeNpc = n; });
    this.physics.overlap(this.player, this.enemies, (_, e) => { activeEnemy = e; });

    // Combate al tocar enemigo
    if (activeEnemy) {
      const cfg = activeEnemy.getData('config');
      const state = this.registry.get('player');
      state.x = Math.max(8, this.player.x - 20);
      state.y = this.player.y;
      state.scene = this.scene.key;
      this.scene.start('CombatScene', { enemy: cfg, returnTo: this.scene.key });
      return;
    }

    // Movimiento horizontal
    const speed = 80, climbSpeed = 60;
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    else this.player.setVelocityX(0);

    // Climbing
    const climbing = onClimb && (this.cursors.up.isDown || this.cursors.down.isDown);
    if (climbing) {
      this.player.body.setAllowGravity(false);
      this.player.setVelocityY(this.cursors.up.isDown ? -climbSpeed : climbSpeed);
    } else {
      this.player.body.setAllowGravity(true);
    }

    // Interacción (E): NPC > puerta
    if (Phaser.Input.Keyboard.JustDown(this.keyAction)) {
      if (activeNpc) { this.interactWithNpc(activeNpc); return; }
      if (activeDoor) { this.enterDoor(activeDoor); return; }
    }

    // Menú (TAB)
    if (Phaser.Input.Keyboard.JustDown(this.keyMenu)) { this.openMenu(); return; }

    // Modo visión
    if (Phaser.Input.Keyboard.JustDown(this.keyVision)) this.toggleVision();

    this.updateHint(activeNpc, activeDoor, activeSign);
    this.updateFollowers();
    this.decrementLifespans(dt);
    this.updateLifespanLabels();
    this.persistPlayerPosition();
  }

  // ============================================================ helpers de update
  interactWithNpc(npc) {
    const onTalk = npc.getData('onTalk');
    if (typeof onTalk === 'function') { onTalk(this, npc); return; }
    const lines = npc.getData('dialogue') || ['(no responde)'];
    this.openDialogue(npc.getData('name'), lines);
  }

  enterDoor(door) {
    this.registry.set('player', {
      x: door.getData('spawnX'),
      y: door.getData('spawnY'),
      scene: door.getData('target'),
    });
    this.scene.start(door.getData('target'));
  }

  updateHint(npc, door, sign) {
    if (npc) {
      this.hintText.setText(`[E] ${npc.getData('name')}`);
      this.hintText.setPosition(npc.x - 4, npc.y - 10);
      this.hintText.setVisible(true);
    } else if (door) {
      this.hintText.setText(`[E] ${door.getData('label')}`);
      this.hintText.setPosition(door.x - 6, door.y - 10);
      this.hintText.setVisible(true);
    } else if (sign) {
      this.hintText.setText(sign.getData('text'));
      this.hintText.setPosition(sign.x - 4, sign.y - 18);
      this.hintText.setVisible(true);
    } else {
      this.hintText.setVisible(false);
    }
  }

  updateFollowers() {
    this.trail.push({ x: this.player.x, y: this.player.y });
    if (this.trail.length > 240) this.trail.shift();
    this.followers.forEach((f, i) => {
      const lag = (i + 1) * 20;
      const idx = Math.max(0, this.trail.length - lag);
      const pos = this.trail[idx];
      f.x = Phaser.Math.Linear(f.x, pos.x, 0.35);
      f.y = Phaser.Math.Linear(f.y, pos.y, 0.35);
    });
  }

  persistPlayerPosition() {
    const state = this.registry.get('player');
    state.x = this.player.x;
    state.y = this.player.y;
    state.scene = this.scene.key;
  }

  // ============================================================ launchers de overlays
  openDialogue(speaker, lines, onClose = null) {
    this.scene.launch('DialogueScene', {
      speaker, lines, onClose, pauseKey: this.scene.key,
    });
  }

  openForum(messages, onClose = null) {
    this.scene.launch('ForumScene', {
      parentKey: this.scene.key, messages, onClose,
    });
  }

  openMenu() {
    this.scene.launch('MenuScene', { parentKey: this.scene.key });
    this.scene.pause();
  }
}
