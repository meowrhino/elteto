import { ensureSprite } from '../characters.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.tabs = ['Inventario', 'Personaje', 'Habilidades', 'Equipo'];
    this.tabIdx = 0;
    this.itemCursor = 0;
    this.charCursor = 0;
    this.flash = '';
  }

  init(data) {
    this.parentKey = data.parentKey;
    this.itemCursor = 0;
    this.charCursor = 0;
    this.flash = '';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75);
    this.add.rectangle(W / 2, H / 2, W - 12, H - 12, 0x111122)
      .setStrokeStyle(1, 0xffffff);

    this.tabTexts = this.tabs.map((label, i) => {
      const tw = (W - 16) / this.tabs.length;
      const x = 8 + i * tw + tw / 2;
      return this.add.text(x, 14, label, {
        fontFamily: 'monospace', fontSize: '8px', color: '#aaa',
      }).setOrigin(0.5, 0.5);
    });
    this.tabUnderline = this.add.rectangle(0, 22, 60, 1, 0xffd166).setOrigin(0.5, 0);

    // Texto genérico para Inventario/Habilidades/Equipo
    this.content = this.add.text(14, 32, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#fff',
      lineSpacing: 2, wordWrap: { width: W - 28 },
    });

    // Avatar e info para la pestaña Personaje
    const party = this.registry.get('party');
    const firstKey = ensureSprite(this, party[0].sprite);
    this.charAvatar = this.add.image(40, 70, firstKey).setScale(3).setVisible(false);
    this.charAvatarFrame = this.add.rectangle(40, 70, 40, 52)
      .setStrokeStyle(1, 0x666688).setVisible(false);
    this.charInfo = this.add.text(72, 40, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#fff', lineSpacing: 3,
    }).setVisible(false);
    this.charArrows = this.add.text(20, 110, '', {
      fontFamily: 'monospace', fontSize: '7px', color: '#888',
    }).setVisible(false);

    this.flashText = this.add.text(W / 2, H - 22, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffd166',
    }).setOrigin(0.5, 0.5);
    this.footer = this.add.text(W / 2, H - 10, '', {
      fontFamily: 'monospace', fontSize: '7px', color: '#888',
    }).setOrigin(0.5, 0.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyAction = this.input.keyboard.addKey('E');
    this.keyTab = this.input.keyboard.addKey('TAB');
    this.keyEsc = this.input.keyboard.addKey('ESC');
    this.input.keyboard.addCapture('TAB');

    this.justOpened = true;
    this.refresh();
  }

  refresh() {
    this.tabTexts.forEach((t, i) => t.setColor(i === this.tabIdx ? '#ffd166' : '#888'));
    const activeTab = this.tabTexts[this.tabIdx];
    this.tabUnderline.setPosition(activeTab.x, 22).setSize(activeTab.width + 8, 1);

    const isChar = this.tabIdx === 1;
    this.charAvatar.setVisible(isChar);
    this.charAvatarFrame.setVisible(isChar);
    this.charInfo.setVisible(isChar);
    this.charArrows.setVisible(isChar);

    if (isChar) {
      this.content.setText('');
      this.updateCharCard();
    } else {
      const renderers = [
        () => this.renderInventario(),
        null,
        () => this.renderHabilidades(),
        () => this.renderEquipo(),
      ];
      this.content.setText(renderers[this.tabIdx]());
    }

    this.flashText.setText(this.flash);
    this.footer.setText(this.footerHint());
  }

  footerHint() {
    if (this.tabIdx === 0) return '↑↓ elegir · [E] usar · ← → pestaña · [TAB] cerrar';
    if (this.tabIdx === 1) return '↑↓ cambiar personaje · ← → pestaña · [TAB] cerrar';
    return '← → pestaña · [TAB]/[ESC] cerrar';
  }

  updateCharCard() {
    const party = this.registry.get('party');
    if (this.charCursor >= party.length) this.charCursor = party.length - 1;
    const c = party[this.charCursor];
    const key = ensureSprite(this, c.sprite);
    this.charAvatar.setTexture(key);

    const isHero = this.charCursor === 0;
    const stats = isHero ? this.registry.get('stats') : null;
    const lines = [];
    lines.push(`${this.charCursor + 1}/${party.length}   ${c.name}`);
    lines.push('');
    if (stats) {
      lines.push(`PV  ${stats.hp}/${stats.hpMax}`);
      lines.push(`PM  ${stats.mp}/${stats.mpMax}`);
      lines.push(`ATK ${stats.atk}   DEF ${stats.def}`);
    } else {
      lines.push('(no combate)');
      lines.push('');
      lines.push('');
    }
    lines.push('');
    lines.push(`Tiempo: ${Math.max(0, Math.ceil(c.lifespan))}s`);
    this.charInfo.setText(lines.join('\n'));

    this.charArrows.setText(party.length > 1 ? '↑   ↓' : '');
  }

  renderInventario() {
    const inv = this.registry.get('inventory') || [];
    if (inv.length === 0) return '(vacío)';
    if (this.itemCursor >= inv.length) this.itemCursor = inv.length - 1;
    return inv.map((it, i) => {
      const pre = i === this.itemCursor ? '> ' : '  ';
      return `${pre}${it.name} x${it.count}\n     ${it.desc}`;
    }).join('\n');
  }

  renderHabilidades() {
    const sk = this.registry.get('skills') || [];
    if (sk.length === 0) return '(ninguna)';
    return sk.map(s => `• ${s.name}  (PM:${s.mpCost})\n    ${s.desc}`).join('\n');
  }

  renderEquipo() {
    const eq = this.registry.get('equipment') || {};
    return [
      `Arma:       ${eq.arma || '—'}`,
      `Armadura:   ${eq.armadura || '—'}`,
      `Accesorio:  ${eq.accesorio || '—'}`,
    ].join('\n');
  }

  update() {
    if (this.justOpened) { this.justOpened = false; return; }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.tabIdx = (this.tabIdx - 1 + this.tabs.length) % this.tabs.length;
      this.itemCursor = 0; this.flash = ''; this.refresh();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.tabIdx = (this.tabIdx + 1) % this.tabs.length;
      this.itemCursor = 0; this.flash = ''; this.refresh();
    }

    if (this.tabIdx === 0) {
      const inv = this.registry.get('inventory') || [];
      if (inv.length > 0) {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.itemCursor > 0) {
          this.itemCursor--; this.refresh();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && this.itemCursor < inv.length - 1) {
          this.itemCursor++; this.refresh();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyAction)) {
          this.useItem(inv[this.itemCursor]);
        }
      }
    } else if (this.tabIdx === 1) {
      const party = this.registry.get('party');
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.charCursor > 0) {
        this.charCursor--; this.refresh();
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down) && this.charCursor < party.length - 1) {
        this.charCursor++; this.refresh();
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyTab)
        || Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.close();
    }
  }

  useItem(item) {
    if (!item || item.count <= 0) return;
    const s = this.registry.get('stats');
    if (item.type === 'heal') {
      if (s.hp >= s.hpMax) { this.flash = 'PV ya al máximo.'; this.refresh(); return; }
      const heal = Math.min(item.amount, s.hpMax - s.hp);
      s.hp += heal;
      this.flash = `${item.name}: +${heal} PV.`;
    } else if (item.type === 'mana') {
      if (s.mp >= s.mpMax) { this.flash = 'PM ya al máximo.'; this.refresh(); return; }
      const mp = Math.min(item.amount, s.mpMax - s.mp);
      s.mp += mp;
      this.flash = `${item.name}: +${mp} PM.`;
    } else {
      this.flash = 'No se puede usar aquí.';
      this.refresh();
      return;
    }
    item.count--;
    const inv = this.registry.get('inventory').filter(i => i.count > 0);
    this.registry.set('inventory', inv);
    this.registry.set('stats', s);
    if (this.itemCursor >= inv.length) this.itemCursor = Math.max(0, inv.length - 1);
    this.refresh();
  }

  close() {
    if (this.parentKey) this.scene.resume(this.parentKey);
    this.scene.stop();
  }
}
