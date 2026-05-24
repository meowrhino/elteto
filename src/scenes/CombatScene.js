import { ensureSprite } from '../characters.js';
import { setChapter, CHAPTERS } from '../story.js';
import { audio } from '../audio.js';

// Combate por turnos.
// Datos esperados: { enemy, returnTo }
//   enemy: { id, name, hp, atk, dialogue?, texture? | charSprite?, special? }
//   - special === 'pablo' habilita la mecánica especial del bully:
//       * Hablar 1ª vez → su frase + comentarios del party
//       * Hablar 2ª vez → el Anillo del Club absorbe el malestar (paz)
//       * KO también vale (cargárselo)
export class CombatScene extends Phaser.Scene {
  constructor() {
    super('CombatScene');
  }

  init(data) {
    this.returnTo = data.returnTo;
    this.enemyCfg = data.enemy;
    this.enemyHp = data.enemy.hp;
    this.enemyHpMax = data.enemy.hp;
    // DIALOG = bloqueado mientras hay un DialogueScene encima.
    // Ningún branch de update() lo procesa, así que ninguna tecla dispara
    // nada hasta que la dialog se cierre y vuelva con enterState(...).
    this.state = 'ROOT'; // ROOT | SKILLS | ITEMS | MSG | ENEMY | END | DIALOG
    this.endResult = null;
    this.cursor = 0;
    this.message = '';
    this.pabloTalkCount = 0;
  }

  // ============================================================ create
  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.cameras.main.setBackgroundColor('#101018');

    // Suelo + horizonte
    this.add.rectangle(W / 2, 84, W, 4, 0x444466);
    this.add.rectangle(W / 2, H - 60, W - 8, 1, 0x888888);

    // Sprite del enemigo (centrado). Las texturas estáticas (book_enemy etc.)
    // son pequeñas y se escalan a x3; los charSprite ya son 24×32 y x2 basta.
    const tex = this.resolveEnemyTexture();
    const scale = this.enemyCfg.charSprite ? 2 : 3;
    this.enemySprite = this.add.image(W / 2, 50, tex).setOrigin(0.5, 0.5).setScale(scale);
    this.tweens.add({
      targets: this.enemySprite, y: '+=2',
      duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.buildHud();
    this.buildMessageBox();
    this.buildActionMenu();
    this.setupInput();

    // Resetear teclas al reanudar tras un diálogo
    if (!this._onResume) this._onResume = () => this.input.keyboard.resetKeys();
    this.events.off('resume', this._onResume);
    this.events.on('resume', this._onResume);

    this.refresh();
  }

  resolveEnemyTexture() {
    if (this.enemyCfg.texture) return this.enemyCfg.texture;
    if (this.enemyCfg.charSprite) return ensureSprite(this, this.enemyCfg.charSprite);
    return 'book_enemy';
  }

  buildHud() {
    const W = this.scale.width;
    this.enemyName = this.add.text(W / 2, 8, this.enemyCfg.name, {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffaaaa',
    }).setOrigin(0.5, 0);
    this.enemyHpText = this.add.text(W / 2, 18, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#fff',
    }).setOrigin(0.5, 0);

    this.playerHpText = this.add.text(8, 8, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#fff',
    });
    this.playerMpText = this.add.text(8, 18, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#aaccff',
    });
  }

  buildMessageBox() {
    const W = this.scale.width;
    this.msgBox = this.add.rectangle(W / 2, 100, W - 8, 18, 0x000000, 0.7)
      .setStrokeStyle(1, 0x444466);
    this.msgText = this.add.text(W / 2, 100, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#fff',
      align: 'center', wordWrap: { width: W - 16 },
    }).setOrigin(0.5, 0.5);
  }

  buildActionMenu() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.actions = [
      { id: 'attack', label: 'Atacar' },
      { id: 'skills', label: 'Habilidades' },
      { id: 'items', label: 'Objetos' },
      { id: 'talk', label: 'Hablar' },
    ];
    this.add.rectangle(W / 2, H - 22, W - 8, 38, 0x111122)
      .setStrokeStyle(1, 0xffffff);
    const baseX = 24, baseY = H - 32;
    this.actionTexts = this.actions.map((a, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      return this.add.text(baseX + col * 140, baseY + row * 14, a.label, {
        fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#fff',
      }).setOrigin(0, 0);
    });
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAction = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.keyEsc = this.input.keyboard.addKey('ESC');
  }

  // ============================================================ render
  refresh() {
    const s = this.registry.get('stats');
    this.playerHpText.setText(`PV ${s.hp}/${s.hpMax}`);
    this.playerMpText.setText(`PM ${s.mp}/${s.mpMax}`);
    this.enemyHpText.setText(`PV ${this.enemyHp}/${this.enemyHpMax}`);

    if (this.state === 'ROOT') {
      this.actionTexts.forEach((t, i) => {
        t.setText((i === this.cursor ? '> ' : '  ') + this.actions[i].label);
        t.setColor(i === this.cursor ? '#ffd166' : '#fff');
        t.setVisible(true);
      });
      this.msgText.setText(this.message || '¿Qué haces?');
    } else if (this.state === 'SKILLS') {
      this.renderList(this.registry.get('skills'), s => `${s.name} (PM:${s.mpCost} · ${s.dmg} dmg)`);
      this.msgText.setText('Elige habilidad   [ESC] volver');
    } else if (this.state === 'ITEMS') {
      // Filtra objetos consumibles (no 'key')
      const items = (this.registry.get('inventory') || []).filter(i => i.type !== 'key');
      this.renderList(items, it => `${it.name} x${it.count}`);
      this.msgText.setText('Elige objeto   [ESC] volver');
    } else {
      this.actionTexts.forEach(t => t.setVisible(false));
      this.msgText.setText(this.message + '   [E]');
    }
  }

  renderList(list, formatter) {
    const items = list.slice(0, 4);
    this.actionTexts.forEach((t, i) => {
      if (i < items.length) {
        t.setText((i === this.cursor ? '> ' : '  ') + formatter(items[i]));
        t.setColor(i === this.cursor ? '#ffd166' : '#fff');
        t.setVisible(true);
      } else t.setVisible(false);
    });
  }

  enterState(state, message = '') {
    this.state = state;
    this.message = message;
    this.cursor = 0;
    this.refresh();
  }

  // ============================================================ loop
  update() {
    const confirm = Phaser.Input.Keyboard.JustDown(this.keyAction)
      || Phaser.Input.Keyboard.JustDown(this.keySpace);
    const back = Phaser.Input.Keyboard.JustDown(this.keyEsc);

    if (this.state === 'ROOT') {
      this.handleGridNav();
      if (confirm) this.executeRoot(this.actions[this.cursor].id);
    } else if (this.state === 'SKILLS') {
      const skills = this.registry.get('skills');
      this.handleListNav(Math.min(skills.length, 4));
      if (back) return this.enterState('ROOT');
      if (confirm) this.useSkill(skills[this.cursor]);
    } else if (this.state === 'ITEMS') {
      const items = (this.registry.get('inventory') || []).filter(i => i.type !== 'key');
      this.handleListNav(Math.min(items.length, 4));
      if (back) return this.enterState('ROOT');
      if (confirm) this.useItem(items[this.cursor]);
    } else if (this.state === 'MSG') {
      if (confirm) {
        if (this.enemyHp <= 0) return this.victory();
        this.enemyTurn();
      }
    } else if (this.state === 'ENEMY') {
      if (confirm) {
        const s = this.registry.get('stats');
        if (s.hp <= 0) return this.defeat();
        this.enterState('ROOT');
      }
    } else if (this.state === 'END') {
      if (confirm) this.exitCombat();
    }
  }

  handleGridNav() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) && this.cursor % 2 === 1) {
      this.cursor--; this.refresh();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) && this.cursor % 2 === 0 && this.cursor + 1 < this.actions.length) {
      this.cursor++; this.refresh();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.cursor >= 2) {
      this.cursor -= 2; this.refresh();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && this.cursor + 2 < this.actions.length) {
      this.cursor += 2; this.refresh();
    }
  }

  handleListNav(len) {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.cursor > 0) {
      this.cursor--; this.refresh();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && this.cursor < len - 1) {
      this.cursor++; this.refresh();
    }
  }

  // ============================================================ acciones
  executeRoot(id) {
    audio.playSfx('confirm');
    // Check status del jugador: si está dormido o confundido, se procesa
    // antes de cualquier acción.
    if (this.tickPlayerStatus()) return;
    if (id === 'attack') this.doAttack();
    else if (id === 'skills') this.enterState('SKILLS');
    else if (id === 'items') this.enterState('ITEMS');
    else if (id === 'talk') this.doTalk();
  }

  // ============================================================ status effects
  // status.kind ∈ { 'dormido', 'confundido' }
  // status.turns: cuántos turnos quedan.
  //
  // tickPlayerStatus() y tickEnemyStatus() se llaman al inicio del turno
  // correspondiente. Si interceptan la acción, devuelven true y la lógica
  // normal se salta.

  tickPlayerStatus() {
    const s = this.registry.get('stats');
    const st = s.status;
    if (!st) return false;

    if (st.kind === 'dormido') {
      st.turns--;
      if (st.turns <= 0) s.status = null;
      this.registry.set('stats', s);
      this.enterState('MSG', 'Zzz... estás dormido. Pierdes el turno.');
      return true;
    }
    if (st.kind === 'confundido') {
      st.turns--;
      if (st.turns <= 0) s.status = null;
      // 50% se ataca a sí mismo
      if (Math.random() < 0.5) {
        const dmg = Math.max(1, s.atk);
        s.hp = Math.max(0, s.hp - dmg);
        this.registry.set('stats', s);
        this.flashPlayer();
        this.spawnDamagePopup(dmg, { x: 30, y: 30 }, '#dd66ff');
        this.enterState('MSG', `¡Confuso! Te golpeas a ti mismo. ${dmg} de daño.`);
        return true;
      }
      this.registry.set('stats', s);
      this.enterState('MSG', '¡Estás confundido! Por suerte aciertas...');
      return false; // sigue su acción normal
    }
    return false;
  }

  tickEnemyStatus() {
    const cfg = this.enemyCfg;
    if (!cfg._status) return false;
    const st = cfg._status;
    if (st.kind === 'dormido') {
      st.turns--;
      if (st.turns <= 0) cfg._status = null;
      this.enterState('ENEMY', `${cfg.name} duerme. Pierde el turno.`);
      return true;
    }
    if (st.kind === 'confundido') {
      st.turns--;
      if (st.turns <= 0) cfg._status = null;
      if (Math.random() < 0.5) {
        this.enemyHp = Math.max(0, this.enemyHp - 2);
        this.flashEnemy();
        this.spawnDamagePopup(2, this.enemySprite, '#dd66ff');
        this.enterState('ENEMY', `${cfg.name} se golpea a sí mismo.`);
        return true;
      }
    }
    return false;
  }

  applyEnemyStatus(kind, turns) {
    this.enemyCfg._status = { kind, turns };
  }

  doAttack() {
    const s = this.registry.get('stats');
    // Variación leve para que no sea siempre el mismo daño
    const dmg = Math.max(1, s.atk + Math.floor(Math.random() * 3) - 1);
    this.enemyHp -= dmg;
    this.flashEnemy();
    this.spawnDamagePopup(dmg, this.enemySprite);
    this.enterState('MSG', `Golpeas a ${this.enemyCfg.name}. ${dmg} de daño.`);
  }

  useSkill(skill) {
    if (!skill) return;
    const s = this.registry.get('stats');
    if (s.mp < skill.mpCost) {
      audio.playSfx('cancel');
      return this.enterState('ROOT', '¡No tienes PM suficientes!');
    }
    s.mp -= skill.mpCost;
    this.enemyHp -= skill.dmg;
    this.registry.set('stats', s);
    if (skill.dmg > 0) {
      this.flashEnemy();
      this.spawnDamagePopup(skill.dmg, this.enemySprite, '#ff6644');
    }
    // Status effects en habilidades específicas
    let extra = '';
    if (skill.id === 'silbar') {
      // 60% prob de dormir al enemigo
      if (Math.random() < 0.6) {
        this.applyEnemyStatus('dormido', 2);
        extra = ' ¡Se ha dormido!';
      }
    } else if (skill.id === 'bola_fuego') {
      // 25% prob de confundir
      if (Math.random() < 0.25) {
        this.applyEnemyStatus('confundido', 3);
        extra = ' ¡Confuso por el fuego!';
      }
    }
    this.enterState('MSG', `${skill.name}! ${skill.dmg} de daño.${extra}`);
  }

  useItem(it) {
    if (!it) return;
    const s = this.registry.get('stats');
    let msg = '';
    if (it.type === 'heal') {
      const heal = Math.min(it.amount, s.hpMax - s.hp);
      s.hp += heal;
      msg = `${it.name}: +${heal} PV.`;
    } else if (it.type === 'mana') {
      const mp = Math.min(it.amount, s.mpMax - s.mp);
      s.mp += mp;
      msg = `${it.name}: +${mp} PM.`;
    }
    it.count--;
    const inv = this.registry.get('inventory').filter(i => i.count > 0);
    this.registry.set('inventory', inv);
    this.registry.set('stats', s);
    this.enterState('MSG', msg);
  }

  doTalk() {
    if (this.enemyCfg.special === 'pablo') return this.doPabloTalk();
    // Diálogo simple (libro, otros enemigos)
    this.launchDialog({
      speaker: this.enemyCfg.name,
      lines: this.enemyCfg.dialogue || ['...'],
      onClose: () => this.enterState('MSG', `${this.enemyCfg.name} te observa, callado.`),
    });
  }

  // Mecánica especial: dos tipos de hablar para Pablo
  doPabloTalk() {
    this.pabloTalkCount++;
    if (this.pabloTalkCount === 1) {
      this.launchDialog({
        lines: [
          { speaker: 'Pablo', text: 'me voy a follar a tu madre' },
          { speaker: 'Tú', text: '¿¿¿qué has dicho???' },
          { speaker: 'Bárbara', text: 'Cálmate. Está intentando provocarte.' },
          { speaker: 'Jorge', text: '¡cárgatelo! ¡cárgatelo!' },
        ],
        onClose: () => this.enterState('ROOT', 'Inténtalo otra vez.'),
      });
    } else {
      // Segunda vez: el Anillo del Club absorbe el malestar
      this.launchDialog({
        lines: [
          { speaker: 'Tú', text: '... lo que sabes.' },
          { speaker: 'Anillo', text: '*el Anillo del Club brilla*' },
          { speaker: 'Anillo', text: '*absorbe el malestar de Pablo*' },
          { speaker: 'Pablo', text: '¿... eh? ¿qué ha pasado? lo siento.' },
        ],
        onClose: () => this.victoryPeaceful(),
      });
    }
  }

  // Centraliza el lanzamiento de DialogueScene desde el combate.
  // Marca CombatScene como ocupada (state='DIALOG') ANTES de hacer launch para
  // que ningún update() residual procese teclas durante la transición a la
  // dialog (entre el launch y el pause que ocurre en DialogueScene.create()).
  // Oculta la UI de acciones para evitar pintar el menú "fantasma" detrás del
  // cuadro de diálogo.
  launchDialog({ speaker, lines, onClose }) {
    if (this.state === 'DIALOG') return; // protección contra doble launch
    this.state = 'DIALOG';
    this.actionTexts.forEach(t => t.setVisible(false));
    this.msgText.setText('');
    const cb = typeof onClose === 'function' ? onClose : null;
    this.scene.launch('DialogueScene', {
      speaker,
      lines,
      pauseKey: 'CombatScene',
      onClose: () => { if (cb) cb(); },
    });
  }

  enemyTurn() {
    // Check status del enemigo antes de su acción
    if (this.tickEnemyStatus()) return;
    const s = this.registry.get('stats');
    const dmg = Math.max(1, this.enemyCfg.atk - s.def + Math.floor(Math.random() * 3) - 1);
    s.hp = Math.max(0, s.hp - dmg);
    this.registry.set('stats', s);
    this.flashPlayer();
    this.spawnDamagePopup(dmg, { x: 30, y: 30 }, '#ff8888');
    this.enterState('ENEMY', `${this.enemyCfg.name} te ataca. ${dmg} de daño.`);
  }

  flashEnemy() {
    audio.playSfx('hit');
    this.tweens.add({ targets: this.enemySprite, alpha: 0.2, duration: 80, yoyo: true, repeat: 2 });
    // Shake del sprite (offset relativo, no de cámara)
    const baseX = this.enemySprite.x;
    this.tweens.add({
      targets: this.enemySprite,
      x: baseX + 3,
      duration: 40, yoyo: true, repeat: 4,
      onComplete: () => this.enemySprite.x = baseX,
    });
  }

  flashPlayer() {
    audio.playSfx('hit');
    this.cameras.main.flash(120, 200, 40, 40);
    this.cameras.main.shake(120, 0.005);
  }

  // Muestra un número de daño que sube y se desvanece. Estilo Earthbound.
  spawnDamagePopup(amount, target, color = '#ffe066') {
    const x = target ? target.x : this.scale.width / 2;
    const y = target ? target.y - 12 : 60;
    const txt = this.add.text(x, y, String(amount), {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color,
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5, 0.5).setDepth(100);
    this.tweens.add({
      targets: txt,
      y: y - 16,
      alpha: { from: 1, to: 0 },
      duration: 700,
      onComplete: () => txt.destroy(),
    });
  }

  // ============================================================ desenlaces
  victory() {
    const defeated = this.registry.get('defeated') || {};
    defeated[this.enemyCfg.id] = true;
    this.registry.set('defeated', defeated);
    if (this.enemyCfg.id === 'pablo') setChapter(this.registry, CHAPTERS.PABLO_DONE);
    this.enterState('END', `¡Has derrotado a ${this.enemyCfg.name}!`);
    this.endResult = 'win';
  }

  victoryPeaceful() {
    const defeated = this.registry.get('defeated') || {};
    defeated[this.enemyCfg.id] = true;
    this.registry.set('defeated', defeated);
    setChapter(this.registry, CHAPTERS.PABLO_DONE);
    this.enterState('END', 'Pablo está libre. Vuelve al aula.');
    this.endResult = 'peace';
  }

  defeat() {
    const s = this.registry.get('stats');
    s.hp = s.hpMax;
    this.registry.set('stats', s);
    this.enterState('END', 'Te han dejado KO. Te reanimas.');
    this.endResult = 'lose';
  }

  exitCombat() {
    this.scene.start(this.returnTo);
  }
}
