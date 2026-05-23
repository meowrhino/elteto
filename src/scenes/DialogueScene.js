import { portraitForSpeaker } from '../portraits.js';

// Overlay modal de diálogo. Datos esperados:
//   { speaker, lines, onClose?, pauseKey? }
// `lines` puede ser:
//   - string[]                  → todas son del speaker por defecto
//   - { speaker, text }[]       → cada línea con su propio speaker
//
// Si el speaker tiene un retrato Picrew cargado, se muestra a la izquierda.

const SPEAKER_COLORS = {
  'Tú': '#ffd166',
  'Bárbara': '#cc88ff',
  'Jorge': '#88dd66',
  'Nivea': '#88ddee',
  'Martina': '#aa66cc',
  'Pablo': '#ff7766',
  'Anillo': '#eeeecc',
  '—': '#aaaaaa',
};

const PORTRAIT_SIZE = 44; // px en el espacio del juego

export class DialogueScene extends Phaser.Scene {
  constructor() {
    super('DialogueScene');
  }

  init(data) {
    this.defaultSpeaker = data.speaker || '';
    this.lines = Array.isArray(data.lines) ? data.lines : [String(data.lines || '')];
    this.idx = 0;
    this.onClose = typeof data.onClose === 'function' ? data.onClose : null;
    this.pauseKey = data.pauseKey || null;
  }

  create() {
    if (this.pauseKey) this.scene.pause(this.pauseKey);

    const W = this.scale.width;
    const H = this.scale.height;
    const boxH = 60;
    this.boxY = H - boxH - 4;

    // Caja de diálogo
    this.add.rectangle(W / 2, this.boxY + boxH / 2, W - 8, boxH, 0x000000, 0.88)
      .setStrokeStyle(1, 0xffffff);

    // Tag con el nombre del speaker (encima de la caja)
    this.nameTag = this.add.rectangle(20, this.boxY - 2, 60, 10, 0x222244)
      .setOrigin(0, 1).setStrokeStyle(1, 0xffffff);
    this.nameText = this.add.text(22, this.boxY - 11, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#fff',
    }).setOrigin(0, 0);

    // Retrato (oculto si el speaker no tiene)
    this.portrait = this.add.image(0, 0, '__DEFAULT')
      .setOrigin(0, 0).setVisible(false);
    this.portraitFrame = this.add.rectangle(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE)
      .setOrigin(0, 0).setStrokeStyle(1, 0x666688).setVisible(false);

    // Texto del diálogo (se reposiciona según haya o no retrato)
    this.lineText = this.add.text(12, this.boxY + 6, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#fff',
      wordWrap: { width: W - 24 },
    });

    this.hint = this.add.text(W - 12, this.boxY + boxH - 10, '[E] ▶', {
      fontFamily: 'monospace', fontSize: '8px', color: '#aaa',
    }).setOrigin(1, 0);

    this.showCurrent();

    this.keyAdvance = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.keyEsc = this.input.keyboard.addKey('ESC');
    this.justOpened = true;
  }

  showCurrent() {
    const item = this.lines[this.idx];
    let speaker = this.defaultSpeaker;
    let text = '';
    if (typeof item === 'string') text = item;
    else if (item && typeof item === 'object') {
      speaker = item.speaker ?? speaker;
      text = item.text ?? '';
    }

    // Nombre + color
    this.nameText.setText(speaker);
    this.nameText.setColor(SPEAKER_COLORS[speaker] || '#ffffff');
    this.nameTag.width = Math.max(40, this.nameText.width + 8);

    // Retrato
    const W = this.scale.width;
    const portraitKey = portraitForSpeaker(speaker);
    if (portraitKey && this.textures.exists(portraitKey)) {
      const tex = this.textures.get(portraitKey).getSourceImage();
      const scale = PORTRAIT_SIZE / Math.max(tex.width, tex.height);
      this.portrait.setTexture(portraitKey);
      this.portrait.setScale(scale);
      this.portrait.setPosition(8, this.boxY + 8);
      this.portraitFrame.setPosition(8, this.boxY + 8);
      this.portrait.setVisible(true);
      this.portraitFrame.setVisible(true);
      // Texto desplazado a la derecha del retrato
      this.lineText.setPosition(8 + PORTRAIT_SIZE + 6, this.boxY + 8);
      this.lineText.setWordWrapWidth(W - (8 + PORTRAIT_SIZE + 18));
    } else {
      this.portrait.setVisible(false);
      this.portraitFrame.setVisible(false);
      this.lineText.setPosition(12, this.boxY + 8);
      this.lineText.setWordWrapWidth(W - 24);
    }
    this.lineText.setText(text);

    const isLast = this.idx >= this.lines.length - 1;
    this.hint.setText(isLast ? '[E] cerrar' : '[E] ▶');
  }

  update() {
    if (this.justOpened) { this.justOpened = false; return; }
    const advance = Phaser.Input.Keyboard.JustDown(this.keyAdvance)
      || Phaser.Input.Keyboard.JustDown(this.keySpace);
    const close = Phaser.Input.Keyboard.JustDown(this.keyEsc);

    if (close) { this.closeDialogue(); return; }
    if (!advance) return;

    if (this.idx >= this.lines.length - 1) this.closeDialogue();
    else { this.idx++; this.showCurrent(); }
  }

  closeDialogue() {
    const cb = this.onClose;
    const pk = this.pauseKey;
    this.scene.stop();
    if (pk) this.scene.resume(pk);
    if (cb) cb();
  }
}
