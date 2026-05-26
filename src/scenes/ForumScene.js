import { colorForSpeaker } from '../portraits.js';
import { audio, voiceFor } from '../audio.js';

// Foro / chat interno del Club de lo Oculto.
//
// Rediseño tipo "messenger retro": cada mensaje es una burbuja con header
// (speaker + hora simulada) y cuerpo. "Tú" se alinea a la derecha con
// fondo más cálido; el resto a la izquierda con su color de speaker en
// el borde. Animación de entrada (slide-in) + babble por carácter.
//
// Datos esperados:
//   { parentKey, messages: [{ speaker, text, color? }], onClose? }

const HEADER_H = 22;
const HEADER_TITLE = '◆ CLUB DE LO OCULTO ◆';
const PAD = 6;
const BUBBLE_PAD_X = 4;
const BUBBLE_PAD_Y = 2;
const FONT = { fontFamily: '"Press Start 2P", monospace', fontSize: '8px' };
const FONT_S = { fontFamily: '"Press Start 2P", monospace', fontSize: '7px' };

export class ForumScene extends Phaser.Scene {
  constructor() { super('ForumScene'); }

  init(data) {
    this.parentKey = data.parentKey || null;
    this.messages = Array.isArray(data.messages) ? data.messages : [];
    this.onClose = typeof data.onClose === 'function' ? data.onClose : null;
    this.idx = 0;
    this.bubbles = [];       // arrays de game objects por burbuja
    this.bubbleHeights = []; // alto en px por burbuja (para scroll)
    this.startTime = Date.now();
  }

  create() {
    if (this.parentKey) this.scene.pause(this.parentKey);

    const W = this.scale.width;
    const H = this.scale.height;

    // Fondo modal con leve gradiente (simulado con dos rectángulos)
    this.add.rectangle(0, 0, W, H, 0x000000, 0.92).setOrigin(0, 0);
    this.add.rectangle(0, 0, W, H, 0x150a25, 0.5).setOrigin(0, 0);

    // Panel principal
    this.add.rectangle(4, 4, W - 8, H - 8, 0x0e0e1a, 0.97)
      .setOrigin(0, 0).setStrokeStyle(1, 0x884488);

    // Header con barra de color
    this.add.rectangle(4, 4, W - 8, HEADER_H, 0x1a0a2a, 1).setOrigin(0, 0);
    this.add.rectangle(4, 4 + HEADER_H - 1, W - 8, 1, 0x884488).setOrigin(0, 0);

    // Indicador de "conexión" (3 puntos animados)
    const dotY = 10;
    for (let i = 0; i < 3; i++) {
      const dot = this.add.rectangle(10 + i * 3, dotY, 2, 2, 0x66ff66).setOrigin(0, 0);
      this.tweens.add({
        targets: dot,
        alpha: { from: 1, to: 0.3 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        delay: i * 200,
      });
    }

    // Título
    this.add.text(W / 2, 8, HEADER_TITLE, { ...FONT, color: '#ffd166' })
      .setOrigin(0.5, 0);

    // Hora simulada arriba a la derecha
    this.timeText = this.add.text(W - 6, 8, '21:30', { ...FONT_S, color: '#aaaaaa' })
      .setOrigin(1, 0);

    // Hint inferior
    this.hint = this.add.text(W / 2, H - 8, '[E] siguiente · [ESC] saltar', {
      ...FONT_S, color: '#888888',
    }).setOrigin(0.5, 0.5);

    // Área de chat
    this.chatTop = HEADER_H + 8;
    this.chatBottom = H - 16;
    this.chatLeft = 8;
    this.chatRight = W - 8;

    this.keyAdvance = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.keyEsc = this.input.keyboard.addKey('ESC');
    this.justOpened = true;

    this.addNextMessage();
  }

  // Añade un mensaje nuevo como burbuja animada.
  addNextMessage() {
    if (this.idx >= this.messages.length) {
      this.hint.setText('[E] cerrar');
      return;
    }
    const msg = this.messages[this.idx];
    const W = this.scale.width;
    const isMe = msg.speaker === 'Tú';
    const color = msg.color || colorForSpeaker(msg.speaker);
    const colorInt = parseInt(color.slice(1), 16);

    // Posición Y del próximo bloque
    const lastBubble = this.bubbles[this.bubbles.length - 1];
    const lastBottom = lastBubble ? lastBubble.bottomY : this.chatTop;
    const startY = lastBottom + 4;

    // Calculamos ancho máximo y posición X de la burbuja
    const maxBubbleW = Math.floor((W - 16) * 0.78);
    const headerText = this.add.text(0, 0, msg.speaker, { ...FONT_S, color }).setVisible(false);
    const bodyText = this.add.text(0, 0, msg.text, {
      ...FONT, color: '#ffffff', wordWrap: { width: maxBubbleW - BUBBLE_PAD_X * 2 },
    }).setVisible(false);

    const bubbleW = Math.max(headerText.width, bodyText.width) + BUBBLE_PAD_X * 2 + 4;
    const bubbleH = headerText.height + bodyText.height + BUBBLE_PAD_Y * 3;

    let bubbleX;
    if (isMe) bubbleX = this.chatRight - bubbleW;
    else bubbleX = this.chatLeft;

    // Burbuja (fondo + borde)
    const bgColor = isMe ? 0x3a2a4a : 0x1a1a2a;
    const bubble = this.add.rectangle(bubbleX, startY, bubbleW, bubbleH, bgColor, 1)
      .setOrigin(0, 0).setStrokeStyle(1, colorInt);

    // Cola de la burbuja (triangulito simulado con un cuadrado pequeño)
    const tailY = startY + 4;
    const tailX = isMe ? bubbleX + bubbleW - 1 : bubbleX - 1;
    const tail = this.add.rectangle(tailX, tailY, 2, 2, bgColor)
      .setOrigin(0, 0).setStrokeStyle(1, colorInt);

    // Header dentro de la burbuja: nombre + (alguien escribe...)
    headerText.setPosition(bubbleX + BUBBLE_PAD_X, startY + BUBBLE_PAD_Y).setVisible(true);

    // Body con typewriter effect
    const bodyX = bubbleX + BUBBLE_PAD_X;
    const bodyY = startY + headerText.height + BUBBLE_PAD_Y * 2;
    bodyText.setPosition(bodyX, bodyY).setVisible(true).setText('');

    // Slide-in: arrancan más arriba y caen + fade
    const offset = -6;
    [bubble, tail, headerText, bodyText].forEach(o => {
      o.y -= offset;
      o.alpha = 0;
    });
    this.tweens.add({
      targets: [bubble, tail, headerText, bodyText],
      y: '+=' + (-offset),
      alpha: 1,
      duration: 220,
      ease: 'Cubic.easeOut',
    });

    // Typewriter del body
    this.typeBody(bodyText, msg.text, msg.speaker);

    const bubbleObj = {
      bg: bubble, tail, header: headerText, body: bodyText,
      x: bubbleX, y: startY, height: bubbleH, bottomY: startY + bubbleH,
    };
    this.bubbles.push(bubbleObj);

    // Scroll si nos salimos por abajo
    while (this.bubbles.length > 0
        && this.bubbles[this.bubbles.length - 1].bottomY > this.chatBottom) {
      const removed = this.bubbles.shift();
      const dy = (this.bubbles[0] ? this.bubbles[0].y : this.chatBottom) - this.chatTop;
      removed.bg.destroy(); removed.tail.destroy();
      removed.header.destroy(); removed.body.destroy();
      this.bubbles.forEach(b => {
        b.bg.y -= dy; b.tail.y -= dy;
        b.header.y -= dy; b.body.y -= dy;
        b.y -= dy; b.bottomY -= dy;
      });
    }

    this.idx++;
    if (this.idx >= this.messages.length) this.hint.setText('[E] cerrar');
  }

  typeBody(textObj, fullText, speaker) {
    let typed = 0;
    const voice = voiceFor(speaker);
    this._typeTimer = this.time.addEvent({
      delay: 24,
      repeat: fullText.length - 1,
      callback: () => {
        typed++;
        textObj.setText(fullText.slice(0, typed));
        if (typed % 3 === 0 && fullText[typed - 1] !== ' ') {
          audio.playVoiceTick(voice);
        }
      },
    });
  }

  update() {
    if (this.justOpened) { this.justOpened = false; return; }

    const advance = Phaser.Input.Keyboard.JustDown(this.keyAdvance)
      || Phaser.Input.Keyboard.JustDown(this.keySpace);
    const skip = Phaser.Input.Keyboard.JustDown(this.keyEsc);

    if (skip) {
      while (this.idx < this.messages.length) this.addNextMessage();
      this.close();
      return;
    }

    if (!advance) return;
    if (this.idx >= this.messages.length) this.close();
    else this.addNextMessage();
  }

  close() {
    if (this._typeTimer) { this._typeTimer.remove(false); this._typeTimer = null; }
    const cb = this.onClose;
    const pk = this.parentKey;
    this.scene.stop();
    if (pk) this.scene.resume(pk);
    if (cb) cb();
  }
}
