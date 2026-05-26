import { portraitForSpeaker, colorForSpeaker } from '../portraits.js';
import { audio, voiceFor } from '../audio.js';

// Overlay de diálogo. Modal: pausa la escena padre mientras está abierto.
//
// Datos esperados:
//   { speaker, lines, onClose?, pauseKey? }
//   lines: string[] | { speaker, text }[]
//
// Rediseño:
//   ┌────────────────────────────────────────────────────────┐
//   │ ▌ Nombre del speaker (color)               [E] ▶       │  ← barra superior
//   ├────────────────────────────────────────────────────────┤
//   │ ┌────┐                                                 │
//   │ │ rt │   Texto del diálogo wrapped... aparece          │
//   │ │ 48 │   con typewriter effect y babble sincronizado.  │
//   │ └────┘                                          ▼      │  ← triángulo "más" animado
//   └────────────────────────────────────────────────────────┘
//   Color del borde superior = color del speaker.
//   Sombra inferior 1px más oscura para sensación 3D.
//   Pulsar [E] mientras se escribe: completa el texto de golpe.
//   Pulsar [E] cuando está completo: avanza línea o cierra.

const BOX_H = 64;
const PAD_X = 6;
const PAD_Y = 4;
const NAME_H = 12;
const PORTRAIT_SIZE = 48;
const TYPE_MS = 28;  // ms por carácter

export class DialogueScene extends Phaser.Scene {
  constructor() { super('DialogueScene'); }

  init(data) {
    this.defaultSpeaker = data.speaker || '';
    this.lines = Array.isArray(data.lines) ? data.lines : [String(data.lines || '')];
    this.idx = 0;
    this.onClose = typeof data.onClose === 'function' ? data.onClose : null;
    this.pauseKey = data.pauseKey || null;
    this.typing = false;
    this.fullText = '';
    this.typedChars = 0;
  }

  create() {
    if (this.pauseKey) this.scene.pause(this.pauseKey);

    const W = this.scale.width;
    const H = this.scale.height;

    this.boxX = 4;
    this.boxY = H - BOX_H - 4;
    this.boxW = W - 8;
    this.boxH = BOX_H;

    // Sombra inferior (efecto de profundidad)
    this.add.rectangle(this.boxX + 1, this.boxY + this.boxH, this.boxW, 2, 0x000000, 0.7)
      .setOrigin(0, 0);

    // Marco exterior (color del speaker; se actualiza en showCurrent)
    this.outerFrame = this.add.rectangle(this.boxX, this.boxY, this.boxW, this.boxH, 0x000000, 1)
      .setOrigin(0, 0).setStrokeStyle(1, 0xffffff);

    // Marco interior
    this.innerBg = this.add.rectangle(this.boxX + 1, this.boxY + 1, this.boxW - 2, this.boxH - 2, 0x1a1a2a, 0.96)
      .setOrigin(0, 0);

    // Barra de nombre con fondo más oscuro
    this.nameBar = this.add.rectangle(this.boxX + 1, this.boxY + 1, this.boxW - 2, NAME_H, 0x0a0a14, 1)
      .setOrigin(0, 0);

    // Línea decorativa bajo la barra de nombre
    this.add.rectangle(this.boxX + 1, this.boxY + 1 + NAME_H, this.boxW - 2, 1, 0x666688, 1)
      .setOrigin(0, 0);

    // Mini-glifo a la izquierda del nombre (▌ vertical en color del speaker)
    this.nameGlyph = this.add.rectangle(this.boxX + 3, this.boxY + 3, 2, NAME_H - 4, 0xffffff)
      .setOrigin(0, 0);

    // Nombre
    this.nameText = this.add.text(
      this.boxX + 8, this.boxY + 2, '',
      { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#fff' }
    ).setOrigin(0, 0);

    // Retrato con marco
    const portraitX = this.boxX + PAD_X;
    const portraitY = this.boxY + NAME_H + PAD_Y;
    this.portraitFrame = this.add.rectangle(portraitX - 1, portraitY - 1, PORTRAIT_SIZE + 2, PORTRAIT_SIZE + 2, 0x444466)
      .setOrigin(0, 0).setVisible(false);
    this.portraitBg = this.add.rectangle(portraitX, portraitY, PORTRAIT_SIZE, PORTRAIT_SIZE, 0x0a0a14)
      .setOrigin(0, 0).setVisible(false);
    this.portrait = this.add.image(portraitX, portraitY, '__DEFAULT')
      .setOrigin(0, 0).setVisible(false);

    // Texto del diálogo
    this.lineText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '8px',
      color: '#ffffff', lineSpacing: 3,
    }).setOrigin(0, 0);

    // Hint top-right (siempre visible, indica acción de E)
    this.hint = this.add.text(
      this.boxX + this.boxW - PAD_X, this.boxY + 2, '[E] ▶',
      { fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#888' }
    ).setOrigin(1, 0);

    // Triángulo animado bottom-right: parpadea cuando hay más por leer
    this.nextArrow = this.add.text(
      this.boxX + this.boxW - PAD_X - 2, this.boxY + this.boxH - 10, '▼',
      { fontFamily: '"Press Start 2P", monospace', fontSize: '8px', color: '#ffd166' }
    ).setOrigin(1, 0).setVisible(false);
    this.tweens.add({
      targets: this.nextArrow,
      y: this.nextArrow.y + 1,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

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

    // Color del speaker → glyph + nombre + borde superior
    const color = colorForSpeaker(speaker);
    const colorInt = parseInt(color.slice(1), 16);
    this.nameText.setText(speaker).setColor(color);
    this.nameGlyph.setFillStyle(colorInt);
    this.outerFrame.setStrokeStyle(1, colorInt);

    // Retrato
    const portraitKey = portraitForSpeaker(speaker);
    const hasPortrait = !!(portraitKey && this.textures.exists(portraitKey));
    if (hasPortrait) {
      const tex = this.textures.get(portraitKey).getSourceImage();
      const scale = PORTRAIT_SIZE / Math.max(tex.width, tex.height);
      this.portrait.setTexture(portraitKey).setScale(scale).setVisible(true);
      this.portraitFrame.setVisible(true);
      this.portraitBg.setVisible(true);
    } else {
      this.portrait.setVisible(false);
      this.portraitFrame.setVisible(false);
      this.portraitBg.setVisible(false);
    }

    // Posición y wrap del texto según haya o no retrato
    const textY = this.boxY + NAME_H + PAD_Y + 2;
    let textX = this.boxX + PAD_X;
    let textWrap = this.boxW - PAD_X * 2;
    if (hasPortrait) {
      textX = this.boxX + PAD_X + PORTRAIT_SIZE + 6;
      textWrap = (this.boxX + this.boxW - PAD_X) - textX - 4;
    }
    this.lineText.setPosition(textX, textY).setWordWrapWidth(textWrap);

    // Typewriter effect
    this.fullText = text;
    this.typedChars = 0;
    this.lineText.setText('');
    this.typing = true;
    this.nextArrow.setVisible(false);
    this.startTypewriter(speaker);

    // Hint según última línea
    const isLast = this.idx >= this.lines.length - 1;
    this.hint.setText(isLast ? '[E] cerrar' : '[E] siguiente');
  }

  startTypewriter(speaker) {
    if (this._typeTimer) this._typeTimer.remove(false);
    const voice = voiceFor(speaker);
    this._typeTimer = this.time.addEvent({
      delay: TYPE_MS,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.typedChars++;
        this.lineText.setText(this.fullText.slice(0, this.typedChars));
        // Tick de voz solo en caracteres no-espacio para evitar babble vacío
        if (this.typedChars % 2 === 0 && this.fullText[this.typedChars - 1] !== ' ') {
          audio.playVoiceTick(voice);
        }
        if (this.typedChars >= this.fullText.length) {
          this.typing = false;
          this.nextArrow.setVisible(true);
        }
      },
    });
  }

  // Completar texto de golpe
  finishTyping() {
    if (this._typeTimer) this._typeTimer.remove(false);
    this.typedChars = this.fullText.length;
    this.lineText.setText(this.fullText);
    this.typing = false;
    this.nextArrow.setVisible(true);
  }

  update() {
    if (this.justOpened) { this.justOpened = false; return; }
    const advance = Phaser.Input.Keyboard.JustDown(this.keyAdvance)
      || Phaser.Input.Keyboard.JustDown(this.keySpace);
    const close = Phaser.Input.Keyboard.JustDown(this.keyEsc);

    if (close) { this.closeDialogue(); return; }
    if (!advance) return;

    // Si está escribiendo, [E] completa la línea de golpe.
    if (this.typing) { this.finishTyping(); return; }

    // Texto completo: avanzar o cerrar
    if (this.idx >= this.lines.length - 1) this.closeDialogue();
    else { this.idx++; this.showCurrent(); }
  }

  closeDialogue() {
    if (this._typeTimer) { this._typeTimer.remove(false); this._typeTimer = null; }
    const cb = this.onClose;
    const pk = this.pauseKey;
    this.scene.stop();
    if (pk) this.scene.resume(pk);
    if (cb) cb();
  }
}
