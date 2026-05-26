import { ensureSprite, SPRITE_W, SPRITE_H } from '../characters.js';
import { bus } from '../events.js';
import { linesFor } from '../data/dialogues.js';
import { getChapter } from '../story.js';
import { passesStoryFilter } from '../data/story-graph.js';
import { toSpec, lifespanOf, alphaOf } from '../data/characters.js';
import { audio } from '../audio.js';
import { DECOR_CATALOG } from '../decor-defs.js';
import { unlockAchievement, showAchievementToast } from './AchievementToast.js';
import { registerTalk } from '../data/achievements.js';

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

    // Tinte nocturno si es de noche (azul oscuro, sutil)
    this.applyNightTint();

    // BGM por sala (si está muteado, no hace nada). El preset se elige
    // por nombre de escena en kebab-case (Pasillo → pasillo, AulaMusica → aula_musica).
    const bgmKey = this.scene.key
      .replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    audio.playBgm(bgmKey);
  }

  applyNightTint() {
    const flags = this.registry.get('flags') || {};
    if (flags.timeOfDay !== 'night') return;
    // Overlay azul oscuro semi-transparente que cubre toda la sala
    const W = this.worldWidth;
    const H = this.worldHeight;
    this.add.rectangle(0, 0, W, H, 0x000033, 0.45)
      .setOrigin(0, 0)
      .setDepth(50)
      .setScrollFactor(1);
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

    // Sombra del player (sigue su posición en update)
    this.playerShadow = this.add.ellipse(
      this.player.x, this.player.y + SPRITE_H / 2 - 1,
      SPRITE_W - 4, 4, 0x000000, 0.35,
    ).setDepth(0);

    // Followers — sin físicas, posicionados desde el trail del player.
    // Se spawn DESPLAZADOS a la izquierda para que sean visibles ya en frame 0
    // (si nacieran sobre el player, el último insertado lo tapa hasta que el
    // trail se llene y se separen).
    this.followers = [];
    this.followerShadows = [];
    this.trail = [];
    const FOLLOWER_GAP = 14;
    const FOLLOWER_LAG = 20; // frames de lag entre cada follower
    for (let i = 1; i < party.length; i++) {
      const k = ensureSprite(this, party[i].sprite);
      const offset = i * FOLLOWER_GAP;
      const f = this.add.sprite(playerState.x - offset, playerState.y, k);
      f.setDepth(10 - i); // detrás del player y entre sí
      this.followers.push(f);
      // Sombra
      const sh = this.add.ellipse(f.x, f.y + SPRITE_H / 2 - 1,
        SPRITE_W - 4, 4, 0x000000, 0.35).setDepth(0);
      this.followerShadows.push(sh);
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
  // Fallback runtime: si algún PNG no se cargó (red caída, repo sin
  // assets), se regenera procedurally. En el flujo normal todas las
  // texturas vienen de BootScene.preload + assets/sprites/decor/*.png.
  makeStaticTextures() {
    if (this.textures.exists('tile')) return;
    const g = this.add.graphics();

    for (const { id, w, h, paint } of DECOR_CATALOG) {
      if (!this.textures.exists(id)) {
        paint(g);
        g.generateTexture(id, w, h);
        g.clear();
      }
    }
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
    // Sombra elíptica bajo los pies del NPC (suaviza la sensación flotante)
    this.add.ellipse(x + SPRITE_W / 2, y + SPRITE_H - 1, SPRITE_W - 4, 4, 0x000000, 0.35)
      .setDepth(-1);
    // Idle bounce: oscilación vertical sutil. Desfase aleatorio para que no
    // se muevan todos los NPCs sincronizados.
    this.tweens.add({
      targets: npc,
      y: y - 0.6,
      duration: 1400 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: Math.random() * 1000,
    });
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
    if (!was) unlockAchievement(this, 'vision_first');
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
  // Resolución de diálogo:
  //   1. onTalk (cutscene con lógica) → mando control a la sala
  //   2. dialogue inline (override en addNpc) → uso esas líneas
  //   3. catálogo data/dialogues.js indexado por (id, storyId) → líneas planas
  //   4. fallback ('(no responde)')
  interactWithNpc(npc) {
    // Logro de "primer diálogo" — se dispara siempre que hablas con un NPC.
    unlockAchievement(this, 'first_dialogue');

    // Registrar al NPC en flags.talkedTo y comprobar 'meet_all'.
    const id = npc.getData('id');
    if (id) {
      const meetAll = registerTalk(this.registry, id);
      if (meetAll) showAchievementToast(this, meetAll);
    }

    const onTalk = npc.getData('onTalk');
    if (typeof onTalk === 'function') { onTalk(this, npc); return; }
    let lines = npc.getData('dialogue');
    if (!lines) {
      if (id) lines = linesFor(id, getChapter(this.registry));
    }
    if (!lines) lines = ['(no responde)'];
    this.openDialogue(npc.getData('name'), lines);
  }

  enterDoor(door) {
    audio.playSfx('door');
    const target = door.getData('target');
    // Logros por entrar a salas especiales
    if (target === 'Astral') unlockAchievement(this, 'astral');
    if (target === 'SuenoPablo') unlockAchievement(this, 'sueno_pablo');
    this.registry.set('player', {
      x: door.getData('spawnX'),
      y: door.getData('spawnY'),
      scene: target,
    });
    this.scene.start(target);
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
      // Sombra del follower
      const sh = this.followerShadows[i];
      if (sh) { sh.x = f.x; sh.y = f.y + SPRITE_H / 2 - 1; }
    });
    // Sombra del player
    if (this.playerShadow) {
      this.playerShadow.x = this.player.x;
      this.playerShadow.y = this.player.y + SPRITE_H / 2 - 1;
    }
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

  // ============================================================ data-driven build
  // Construye los campos planos de una sala desde un objeto de datos.
  // Lo que necesita lógica (cutscenes, NPCs dinámicos según capítulo, salas
  // con plataformas elevadas) se sigue añadiendo en la clase concreta.
  //
  // Acepta los siguientes campos opcionales en `data`:
  //   - interior      → opts para buildInterior()
  //   - lambrin       → { y, h, color, railY, railH, railColor }
  //   - windows[]     → opts para addWindow()
  //   - floorY        → y del suelo (default 160)
  //   - floorTex      → textura del suelo (default 'tile')
  //   - decor[]       → { x, y, tex }
  //   - doors[]       → { x, y, target, spawnX, spawnY, label }
  //   - signs[]       → { x, y, text }
  //   - npcs[]        → { x, y, id, name, sprite }
  //                     sprite es un id de characters.js (string)
  buildFromData(data) {
    if (data.interior) this.buildInterior(data.interior);

    if (data.lambrin) {
      const l = data.lambrin;
      this.add.rectangle(0, l.y, this.worldWidth, l.h, l.color)
        .setOrigin(0, 0).setDepth(-85).setScrollFactor(1);
      if (l.railColor != null) {
        this.add.rectangle(0, l.railY, this.worldWidth, l.railH, l.railColor)
          .setOrigin(0, 0).setDepth(-84).setScrollFactor(1);
      }
    }

    if (data.windows) {
      for (const w of data.windows) this.addWindow(w);
    }

    const floorY = data.floorY ?? 160;
    const floorTex = data.floorTex ?? 'tile';
    for (let x = 0; x < this.worldWidth; x += 16) {
      this.addPlatform(x, floorY, 1, 1, floorTex);
    }

    // storyId actual para filtros condicionales (onlyIn / notIn)
    const storyId = getChapter(this.registry);

    if (data.decor) {
      for (const d of data.decor) {
        if (!passesStoryFilter(storyId, d)) continue;
        const sprite = this.addDecor(d.x, d.y, d.tex);
        this.applyDecorBehavior(d, sprite);
      }
    }

    if (data.doors) {
      for (const d of data.doors) {
        if (!passesStoryFilter(storyId, d)) continue;
        this.addDoor(d.x, d.y, d.target, d.spawnX, d.spawnY, d.label);
      }
    }

    if (data.signs) {
      for (const s of data.signs) {
        if (!passesStoryFilter(storyId, s)) continue;
        this.addSign(s.x, s.y, s.text);
      }
    }

    if (data.npcs) {
      for (const n of data.npcs) {
        if (!passesStoryFilter(storyId, n)) continue;
        const npc = this.addNpc(n.x, n.y, {
          id: n.id,
          name: n.name,
          sprite: typeof n.sprite === 'string' ? toSpec(n.sprite) : n.sprite,
          lifespan: lifespanOf(n.sprite || n.id),
        });
        if (npc) {
          const a = alphaOf(n.sprite || n.id);
          if (a !== 1) npc.setAlpha(a);
        }
      }
    }

    if (data.ambient) this.spawnAmbient(data.ambient);
  }

  // Animaciones sutiles + decoraciones reactivas por tipo de decor.
  applyDecorBehavior(d, sprite) {
    // Halo cálido bajo lámparas + leve titileo
    if (d.tex === 'lamp') {
      const halo = this.add.ellipse(d.x + 6, d.y + 16, 28, 12, 0xffe066, 0.18)
        .setDepth(-30);
      this.tweens.add({
        targets: halo,
        alpha: { from: 0.14, to: 0.22 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Aguja del reloj rotando (una vuelta por minuto)
    if (d.tex === 'clock') {
      const hand = this.add.rectangle(d.x + 7, d.y + 7, 1, 4, 0x222222)
        .setOrigin(0.5, 1)
        .setDepth(1);
      this.tweens.add({
        targets: hand,
        angle: 360,
        duration: 60000,
        repeat: -1,
        ease: 'Linear',
      });
    }

    // Caldera: llama parpadeante (otro rect superpuesto que cambia altura)
    if (d.tex === 'boiler') {
      const flame = this.add.rectangle(d.x + 10, d.y + 21, 4, 4, 0xffe066)
        .setOrigin(0.5, 1)
        .setDepth(1);
      this.tweens.add({
        targets: flame,
        scaleY: { from: 0.8, to: 1.2 },
        scaleX: { from: 0.9, to: 1.1 },
        alpha: { from: 0.8, to: 1 },
        duration: 240,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Soda machine: zumbido visual (offset Y -1 alternando)
    if (d.tex === 'soda_machine') {
      this.tweens.add({
        targets: sprite,
        y: d.y - 0.5,
        duration: 90,
        yoyo: true,
        repeat: -1,
      });
    }

    // Árbol: una hoja amarilla cae periódicamente
    if (d.tex === 'tree') {
      const dropLeaf = () => {
        const leaf = this.add.rectangle(d.x + 4 + Math.random() * 8, d.y + 6, 2, 2, 0xffcc44)
          .setDepth(0);
        this.tweens.add({
          targets: leaf,
          y: d.y + 16,
          x: leaf.x + (Math.random() * 6 - 3),
          alpha: { from: 1, to: 0 },
          duration: 2200,
          ease: 'Sine.easeIn',
          onComplete: () => leaf.destroy(),
        });
      };
      // Una hoja cada 3-6 segundos
      this.time.addEvent({
        delay: 3000 + Math.random() * 3000,
        callback: dropLeaf,
        loop: true,
      });
    }

    // Pizarra: pequeño polvo de tiza que cae aleatoriamente (sutil)
    // Lo dejamos solo para chalkboard_big, no para la chica.
    if (d.tex === 'chalkboard_big') {
      this.time.addEvent({
        delay: 5000 + Math.random() * 5000,
        loop: true,
        callback: () => {
          const dust = this.add.rectangle(
            d.x + 4 + Math.random() * 70,
            d.y + 38,
            1, 1, 0xeeeeee,
          ).setDepth(0);
          this.tweens.add({
            targets: dust,
            y: dust.y + 12,
            alpha: { from: 1, to: 0 },
            duration: 1500,
            onComplete: () => dust.destroy(),
          });
        },
      });
    }
  }

  // Partículas ambientales que aportan vida a una sala.
  // ambient = { dust?: true, pollen?: true }
  spawnAmbient(ambient) {
    if (ambient.dust) this.spawnDust(0xccbb88, 0.35);
    if (ambient.pollen) this.spawnDust(0xffd166, 0.5);
  }

  spawnDust(color, alpha) {
    // 18 motas flotantes, posición y velocidad aleatoria.
    for (let i = 0; i < 18; i++) {
      const x = Math.random() * this.worldWidth;
      const y = 20 + Math.random() * 100;
      const dot = this.add.rectangle(x, y, 1, 1, color, alpha).setDepth(-20);
      this.tweens.add({
        targets: dot,
        y: y + 8 + Math.random() * 12,
        x: x + (Math.random() * 12 - 6),
        alpha: { from: alpha, to: alpha * 0.3 },
        duration: 4000 + Math.random() * 4000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000,
      });
    }
  }
}
