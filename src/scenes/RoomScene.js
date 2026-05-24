import { ensureSprite, SPRITE_W, SPRITE_H } from '../characters.js';
import { bus } from '../events.js';

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
      fontFamily: 'monospace', fontSize: '8px', color: '#fff',
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

    g.fillStyle(0x8b5a36).fillRect(0, 0, 14, 4);
    g.fillStyle(0x6b4226).fillRect(2, 4, 2, 6);
    g.fillStyle(0x6b4226).fillRect(10, 4, 2, 6);
    g.generateTexture('desk', 14, 10);

    g.destroy();
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
      fontFamily: 'monospace', fontSize: '7px', color: '#fff',
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
