// Overlay modal de diálogo. Datos esperados:
//   { speaker, lines, onClose?, pauseKey? }
// `lines` puede ser:
//   - string[]                  → todas las líneas son del mismo speaker
//   - { speaker, text }[]       → cada línea tiene su propio speaker

const SPEAKER_COLORS = {
  'Tú': '#ffd166',
  'Bárbara': '#cc88ff',
  'Jorge': '#88dd66',
  'Profesora': '#88ddee',
  'Pablo': '#ff7766',
  'Anillo': '#eeeecc',
  '—': '#aaaaaa',
};

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
    const boxH = 56;
    const boxY = H - boxH - 4;

    this.add.rectangle(W / 2, boxY + boxH / 2, W - 8, boxH, 0x000000, 0.88)
      .setStrokeStyle(1, 0xffffff);

    this.nameTag = this.add.rectangle(20, boxY - 2, 60, 10, 0x222244)
      .setOrigin(0, 1).setStrokeStyle(1, 0xffffff);
    this.nameText = this.add.text(22, boxY - 11, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#fff',
    }).setOrigin(0, 0);

    this.lineText = this.add.text(12, boxY + 6, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#fff',
      wordWrap: { width: W - 24 },
    });

    this.hint = this.add.text(W - 12, boxY + boxH - 12, '[E] ▶', {
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
    if (typeof item === 'string') {
      text = item;
    } else if (item && typeof item === 'object') {
      speaker = item.speaker ?? speaker;
      text = item.text ?? '';
    }

    this.nameText.setText(speaker);
    const color = SPEAKER_COLORS[speaker] || '#ffffff';
    this.nameText.setColor(color);
    // Ajustar ancho del tag al nombre
    const tagW = Math.max(40, this.nameText.width + 8);
    this.nameTag.width = tagW;

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
