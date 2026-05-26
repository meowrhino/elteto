import { portraitForSpeaker, colorForSpeaker } from '../portraits.js';
import { audio, voiceFor } from '../audio.js';

// Foro / chat interno del Club de lo Oculto.
//
// Rediseño inspirado en github.com/meowrhino/diarioBarbara:
//   - Sin cola/tail puntiagudo (creaba un cruce de strokes feo arriba a la
//     izquierda de cada burbuja).
//   - Avatar pequeño junto a la burbuja en lugar de header con nombre.
//   - Mensajes consecutivos del mismo emisor se agrupan (avatar solo en
//     el primero) para que se parezca a un chat real.
//   - Indicador "{speaker} escribiendo..." en la cabecera mientras el
//     typewriter del próximo mensaje está activo.
//   - Sombra drop de 1 px para sensación 3D pixel-art sin cola.
//
// Identificación del emisor: posición (Tú a la derecha, resto a la
// izquierda) + color del borde + color del marco del avatar.
//
// Datos esperados:
//   { parentKey, messages: [{ speaker, text, color? }], onClose? }

const HEADER_H = 22;
const HEADER_TITLE = '◆ CLUB DE LO OCULTO ◆';
const BUBBLE_PAD_X = 4;
const BUBBLE_PAD_Y = 3;
const AVATAR_SIZE = 14;
const AVATAR_GAP = 3;
const SLIDE_OFFSET = 6;
const TYPE_DELAY = 24;
const FONT   = { fontFamily: '"Press Start 2P", monospace', fontSize: '8px' };
const FONT_S = { fontFamily: '"Press Start 2P", monospace', fontSize: '7px' };

export class ForumScene extends Phaser.Scene {
  constructor() { super('ForumScene'); }

  init(data) {
    this.parentKey = data.parentKey || null;
    this.messages = Array.isArray(data.messages) ? data.messages : [];
    this.onClose = typeof data.onClose === 'function' ? data.onClose : null;
    this.idx = 0;
    this.bubbles = [];
    this.lastSpeaker = null;
    this.startTime = Date.now();
  }

  create() {
    if (this.parentKey) this.scene.pause(this.parentKey);

    const W = this.scale.width;
    const H = this.scale.height;

    // Fondo modal con leve gradiente (simulado con dos rectángulos).
    this.add.rectangle(0, 0, W, H, 0x000000, 0.92).setOrigin(0, 0);
    this.add.rectangle(0, 0, W, H, 0x150a25, 0.5).setOrigin(0, 0);

    // Panel principal.
    this.add.rectangle(4, 4, W - 8, H - 8, 0x0e0e1a, 0.97)
      .setOrigin(0, 0).setStrokeStyle(1, 0x884488);

    // Header con barra de color.
    this.add.rectangle(4, 4, W - 8, HEADER_H, 0x1a0a2a, 1).setOrigin(0, 0);
    this.add.rectangle(4, 4 + HEADER_H - 1, W - 8, 1, 0x884488).setOrigin(0, 0);

    // Indicador de "conexión" (3 puntos animados).
    const dotY = 8;
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

    // Título.
    this.add.text(W / 2, 6, HEADER_TITLE, { ...FONT, color: '#ffd166' })
      .setOrigin(0.5, 0);

    // Hora simulada arriba a la derecha.
    this.timeText = this.add.text(W - 6, 6, '21:30', { ...FONT_S, color: '#aaaaaa' })
      .setOrigin(1, 0);

    // Status secundario: "{speaker} escribiendo..." durante el typewriter.
    this.statusText = this.add.text(W / 2, 15, '', { ...FONT_S, color: '#88ddee' })
      .setOrigin(0.5, 0);

    // Hint inferior.
    this.hint = this.add.text(W / 2, H - 8, '[E] siguiente · [ESC] saltar', {
      ...FONT_S, color: '#888888',
    }).setOrigin(0.5, 0.5);

    // Área de chat.
    this.chatTop = HEADER_H + 6;
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
  // `instant=true` salta slide-in + typewriter (se usa al pulsar ESC).
  addNextMessage(instant = false) {
    if (this.idx >= this.messages.length) {
      this.hint.setText('[E] cerrar');
      this.setStatus('');
      return;
    }
    const msg = this.messages[this.idx];
    const W = this.scale.width;
    const isMe = msg.speaker === 'Tú';
    const color = msg.color || colorForSpeaker(msg.speaker);
    const colorInt = parseInt(color.slice(1), 16);

    // Agrupar mensajes consecutivos del mismo emisor: solo el primero
    // lleva avatar y deja un gap mayor con el bloque anterior.
    const grouped = this.lastSpeaker === msg.speaker;
    const showAvatar = !grouped;
    const gap = grouped ? 2 : 5;

    // Posición Y del próximo bloque.
    const lastBubble = this.bubbles[this.bubbles.length - 1];
    const lastBottom = lastBubble ? lastBubble.bottomY : this.chatTop;
    const startY = lastBottom + gap;

    // Reservamos sideIndent a ambos lados para el avatar (consistente
    // aunque la burbuja agrupada no lo lleve).
    const sideIndent = AVATAR_SIZE + AVATAR_GAP;
    const maxBubbleW = Math.floor((W - 16 - sideIndent * 2) * 0.95);

    // Medimos el body con el texto completo, luego lo vaciamos para el
    // typewriter (la burbuja ya tiene su tamaño definitivo).
    const bodyText = this.add.text(0, 0, msg.text, {
      ...FONT, color: '#ffffff', wordWrap: { width: maxBubbleW - BUBBLE_PAD_X * 2 },
    }).setVisible(false);

    const bubbleW = bodyText.width + BUBBLE_PAD_X * 2;
    const bubbleH = bodyText.height + BUBBLE_PAD_Y * 2;

    // Layout: avatar pegado al borde exterior, burbuja al lado.
    let bubbleX, avatarX;
    if (isMe) {
      avatarX = this.chatRight - AVATAR_SIZE;
      bubbleX = avatarX - AVATAR_GAP - bubbleW;
    } else {
      avatarX = this.chatLeft;
      bubbleX = avatarX + AVATAR_SIZE + AVATAR_GAP;
    }

    // Burbuja: fondo + borde del color del speaker.
    const bgColor = isMe ? 0x3a2a4a : 0x1a1a2a;
    const bubble = this.add.rectangle(bubbleX, startY, bubbleW, bubbleH, bgColor, 1)
      .setOrigin(0, 0).setStrokeStyle(1, colorInt);

    // Sombra drop pixelada 1 px abajo-derecha: da sensación 3D sin la
    // cola conflictiva del diseño anterior.
    const shadow = this.add.rectangle(bubbleX + 1, startY + bubbleH, bubbleW, 1, 0x000000, 0.45)
      .setOrigin(0, 0);

    // Body en su sitio. setDepth(1) para que se dibuje encima del fondo
    // opaco de la burbuja (creada después que el text al medir).
    const bodyX = bubbleX + BUBBLE_PAD_X;
    const bodyY = startY + BUBBLE_PAD_Y;
    bodyText.setPosition(bodyX, bodyY).setVisible(true).setText('').setDepth(1);

    // Avatar (solo cuando el speaker cambia respecto al mensaje anterior).
    let avatar = null;
    let avatarFrame = null;
    if (showAvatar) {
      avatarFrame = this.add.rectangle(avatarX - 1, startY - 1, AVATAR_SIZE + 2, AVATAR_SIZE + 2, colorInt)
        .setOrigin(0, 0);
      const portraitKey = portraitForSpeaker(msg.speaker);
      if (portraitKey && this.textures.exists(portraitKey)) {
        avatar = this.add.image(avatarX, startY, portraitKey)
          .setOrigin(0, 0)
          .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE)
          .setDepth(1);
      } else {
        // Fallback: cuadrado con el color + inicial del speaker.
        avatar = this.add.text(avatarX + AVATAR_SIZE / 2, startY + AVATAR_SIZE / 2,
          msg.speaker[0] || '?', { ...FONT, color }
        ).setOrigin(0.5).setDepth(1);
      }
    }

    // Slide-in: arranca SLIDE_OFFSET arriba y baja a la posición final + fade.
    const animTargets = [bubble, shadow, bodyText];
    if (avatar) animTargets.push(avatar);
    if (avatarFrame) animTargets.push(avatarFrame);
    animTargets.forEach(o => {
      o.y -= SLIDE_OFFSET;
      o.alpha = 0;
    });
    this.tweens.add({
      targets: animTargets,
      y: '+=' + SLIDE_OFFSET,
      alpha: 1,
      duration: instant ? 0 : 220,
      ease: 'Cubic.easeOut',
    });

    // Typewriter del body (o texto completo si saltamos).
    if (instant) {
      bodyText.setText(msg.text);
    } else {
      this.setStatus(`${msg.speaker} escribiendo...`);
      this.typeBody(bodyText, msg.text, msg.speaker);
    }

    const bubbleObj = {
      bg: bubble, shadow, body: bodyText, avatar, avatarFrame,
      speaker: msg.speaker,
      x: bubbleX, y: startY, height: bubbleH,
      bottomY: startY + bubbleH + 1,  // +1 por la sombra
    };
    this.bubbles.push(bubbleObj);

    // Scroll si nos salimos por abajo: destruimos las burbujas que ya
    // no caben y subimos las restantes.
    while (this.bubbles.length > 0
        && this.bubbles[this.bubbles.length - 1].bottomY > this.chatBottom) {
      const removed = this.bubbles.shift();
      const dy = (this.bubbles[0] ? this.bubbles[0].y : this.chatBottom) - this.chatTop;
      this.destroyBubble(removed);
      this.bubbles.forEach(b => this.shiftBubble(b, -dy));
    }

    this.lastSpeaker = msg.speaker;
    this.idx++;
    if (this.idx >= this.messages.length) this.hint.setText('[E] cerrar');
  }

  destroyBubble(b) {
    b.bg.destroy();
    b.shadow.destroy();
    b.body.destroy();
    if (b.avatar) b.avatar.destroy();
    if (b.avatarFrame) b.avatarFrame.destroy();
  }

  shiftBubble(b, dy) {
    b.bg.y += dy;
    b.shadow.y += dy;
    b.body.y += dy;
    if (b.avatar) b.avatar.y += dy;
    if (b.avatarFrame) b.avatarFrame.y += dy;
    b.y += dy;
    b.bottomY += dy;
  }

  setStatus(text) {
    this.statusText.setText(text);
  }

  typeBody(textObj, fullText, speaker) {
    // Guarda: con fullText vacío Phaser interpretaría repeat:-1 como infinito.
    if (!fullText) return;
    let typed = 0;
    const voice = voiceFor(speaker);
    this._typeTimer = this.time.addEvent({
      delay: TYPE_DELAY,
      repeat: fullText.length - 1,
      callback: () => {
        // El bubble puede haber sido destruido por el scroll mientras
        // seguimos typing: si el text object ya no está activo, salimos.
        if (!textObj.active) return;
        typed++;
        textObj.setText(fullText.slice(0, typed));
        if (typed % 3 === 0 && fullText[typed - 1] !== ' ') {
          audio.playVoiceTick(voice);
        }
        if (typed >= fullText.length) {
          // Typewriter terminado: limpiar status (queda en blanco hasta
          // que el usuario avance con [E]).
          this.setStatus('');
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
      // ESC = "saltar typewriter": completa la burbuja en curso y muestra
      // las restantes con texto completo sin animación. NO cierra: el
      // usuario pulsa [E] para salir cuando termine de leer.
      if (this._typeTimer) { this._typeTimer.remove(false); this._typeTimer = null; }
      if (this.bubbles.length > 0 && this.idx > 0) {
        const cur = this.bubbles[this.bubbles.length - 1];
        cur.body.setText(this.messages[this.idx - 1].text);
      }
      while (this.idx < this.messages.length) this.addNextMessage(true);
      this.hint.setText('[E] cerrar');
      this.setStatus('');
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
