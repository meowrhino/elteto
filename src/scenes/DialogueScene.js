import { portraitForSpeaker } from '../portraits.js';

// Overlay de diálogo. Modal: pausa la escena padre mientras está abierto.
// Datos esperados:
//   { speaker, lines, onClose?, pauseKey? }
// `lines` puede ser:
//   - string[]                  → todas son del speaker por defecto
//   - { speaker, text }[]       → cada línea con su propio speaker (multi-voz)
//
// Layout (coords del juego a 320×180):
//
//   ┌──────────────────────────────────────────────────────┐
//   │ Nombre del speaker (con color por persona)           │
//   ├──────────┬───────────────────────────────────────────┤
//   │ retrato  │ texto del diálogo wrap aquí...            │
//   │ 50×50    │                                           │
//   │          │                              [E] ▶        │
//   └──────────┴───────────────────────────────────────────┘
//
// Si el speaker no tiene retrato, el bloque de la izquierda no se dibuja
// y el texto ocupa todo el ancho.

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

// --- Constantes de layout (game space) ---
const BOX_H = 68;
const BOX_PAD_X = 6;
const BOX_PAD_Y = 5;
const NAME_BAR_H = 12;
const PORTRAIT_SIZE = 50;

export class DialogueScene extends Phaser.Scene {
  constructor() { super('DialogueScene'); }

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

    // Coordenadas absolutas para evitar líos con orígenes
    this.boxX = 4;
    this.boxY = H - BOX_H - 4;
    this.boxW = W - 8;
    this.boxH = BOX_H;

    // === Marco del cuadro (origin 0,0 para evitar ambigüedades) ===
    this.add.rectangle(this.boxX, this.boxY, this.boxW, this.boxH, 0x0e0e1a, 0.95)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xffffff);

    // Separador entre barra de nombre y contenido
    this.add.rectangle(
      this.boxX, this.boxY + NAME_BAR_H,
      this.boxW, 1,
      0x666688
    ).setOrigin(0, 0);

    // === Texto del nombre (dentro del propio cuadro, arriba) ===
    this.nameText = this.add.text(
      this.boxX + BOX_PAD_X,
      this.boxY + 2,
      '',
      { fontFamily: 'monospace', fontSize: '8px', color: '#fff' }
    ).setOrigin(0, 0);

    // === Retrato (oculto si el speaker no tiene) ===
    const portraitX = this.boxX + BOX_PAD_X;
    const portraitY = this.boxY + NAME_BAR_H + BOX_PAD_Y;
    this.portrait = this.add.image(portraitX, portraitY, '__DEFAULT')
      .setOrigin(0, 0)
      .setVisible(false);
    this.portraitFrame = this.add.rectangle(
      portraitX, portraitY, PORTRAIT_SIZE, PORTRAIT_SIZE
    ).setOrigin(0, 0).setStrokeStyle(1, 0x666688).setVisible(false);

    // === Texto del diálogo (su posición/anchura se recalcula en showCurrent) ===
    this.lineText = this.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '8px', color: '#fff',
      lineSpacing: 2,
    }).setOrigin(0, 0);

    // === Hint inferior derecha ===
    this.hint = this.add.text(
      this.boxX + this.boxW - BOX_PAD_X,
      this.boxY + this.boxH - 10,
      '[E] ▶',
      { fontFamily: 'monospace', fontSize: '8px', color: '#aaa' }
    ).setOrigin(1, 0);

    this.showCurrent();

    this.keyAdvance = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.keyEsc = this.input.keyboard.addKey('ESC');
    this.justOpened = true;
  }

  // Refresca el contenido del cuadro con la línea actual
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

    // ¿Hay retrato?
    const portraitKey = portraitForSpeaker(speaker);
    const hasPortrait = !!(portraitKey && this.textures.exists(portraitKey));
    if (hasPortrait) {
      const tex = this.textures.get(portraitKey).getSourceImage();
      const scale = PORTRAIT_SIZE / Math.max(tex.width, tex.height);
      this.portrait.setTexture(portraitKey);
      this.portrait.setScale(scale);
      this.portrait.setVisible(true);
      this.portraitFrame.setVisible(true);
    } else {
      this.portrait.setVisible(false);
      this.portraitFrame.setVisible(false);
    }

    // Posición y ancho del texto según haya o no retrato
    const textY = this.boxY + NAME_BAR_H + BOX_PAD_Y;
    let textX = this.boxX + BOX_PAD_X;
    let textWrap = this.boxW - BOX_PAD_X * 2;
    if (hasPortrait) {
      textX = this.boxX + BOX_PAD_X + PORTRAIT_SIZE + 6;
      textWrap = (this.boxX + this.boxW - BOX_PAD_X) - textX;
    }
    this.lineText.setPosition(textX, textY);
    this.lineText.setWordWrapWidth(textWrap);
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
