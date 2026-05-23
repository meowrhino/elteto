// Overlay tipo chat para "reuniones" del Club de lo Oculto.
// Datos esperados:
//   { parentKey, messages: [{ speaker, text, color? }], onClose? }

const SPEAKER_COLORS = {
  'Tú': '#ffd166',
  'Bárbara': '#cc88ff',
  'Jorge': '#88dd66',
  'Profesora': '#88ddee',
  'Pablo': '#ff7766',
  'Anillo': '#eeeecc',
};

export class ForumScene extends Phaser.Scene {
  constructor() {
    super('ForumScene');
  }

  init(data) {
    this.parentKey = data.parentKey || null;
    this.messages = Array.isArray(data.messages) ? data.messages : [];
    this.onClose = typeof data.onClose === 'function' ? data.onClose : null;
    this.idx = 0;
    this.lineObjs = []; // textos visibles en pantalla
  }

  create() {
    if (this.parentKey) this.scene.pause(this.parentKey);

    const W = this.scale.width;
    const H = this.scale.height;

    // Fondo modal
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85);
    this.add.rectangle(W / 2, H / 2, W - 12, H - 12, 0x0e0e1a)
      .setStrokeStyle(1, 0x666688);

    // Cabecera
    this.add.text(W / 2, 10, '◆ CLUB DE LO OCULTO ◆', {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffd166',
    }).setOrigin(0.5, 0);
    this.add.rectangle(W / 2, 22, W - 16, 1, 0x666688);

    // Hint inferior
    this.hint = this.add.text(W / 2, H - 10, '[E] siguiente', {
      fontFamily: 'monospace', fontSize: '7px', color: '#888',
    }).setOrigin(0.5, 0.5);

    // Área de chat
    this.chatTop = 26;
    this.chatBottom = H - 16;
    this.lineHeight = 8;
    this.spacing = 3; // entre bloques de mensaje

    this.keyAdvance = this.input.keyboard.addKey('E');
    this.keySpace = this.input.keyboard.addKey('SPACE');
    this.keyEsc = this.input.keyboard.addKey('ESC');
    this.justOpened = true;

    this.addNextMessage();
  }

  // Añade el siguiente mensaje al chat; si no caben, hace scroll arriba.
  addNextMessage() {
    if (this.idx >= this.messages.length) {
      this.hint.setText('[E] cerrar');
      return;
    }
    const msg = this.messages[this.idx];
    const W = this.scale.width;
    const color = msg.color || SPEAKER_COLORS[msg.speaker] || '#ffffff';

    // Calcular posición Y del nuevo bloque
    const last = this.lineObjs[this.lineObjs.length - 1];
    const baseY = last ? last.y + last.height + this.spacing : this.chatTop;

    const speakerText = this.add.text(8, baseY, `${msg.speaker}:`, {
      fontFamily: 'monospace', fontSize: '8px', color,
    });
    const bodyText = this.add.text(8, baseY + speakerText.height + 1, msg.text, {
      fontFamily: 'monospace', fontSize: '8px', color: '#ffffff',
      wordWrap: { width: W - 16 },
    });

    this.lineObjs.push(speakerText, bodyText);

    // Scroll si nos pasamos por abajo
    while (this.lineObjs.length > 0
        && this.lineObjs[this.lineObjs.length - 1].y + this.lineObjs[this.lineObjs.length - 1].height > this.chatBottom) {
      // Sacar el primer bloque (speaker + body = 2 objetos) y subir el resto
      const removed1 = this.lineObjs.shift();
      const removed2 = this.lineObjs.shift();
      const dy = (removed2 ? removed2.y + removed2.height + this.spacing : 0) - this.chatTop;
      removed1.destroy();
      if (removed2) removed2.destroy();
      this.lineObjs.forEach(t => { t.y -= dy; });
    }

    this.idx++;
    if (this.idx >= this.messages.length) this.hint.setText('[E] cerrar');
  }

  update() {
    if (this.justOpened) { this.justOpened = false; return; }

    const advance = Phaser.Input.Keyboard.JustDown(this.keyAdvance)
      || Phaser.Input.Keyboard.JustDown(this.keySpace);
    const skip = Phaser.Input.Keyboard.JustDown(this.keyEsc);

    if (skip) {
      // Salta directamente al final
      while (this.idx < this.messages.length) this.addNextMessage();
      this.close();
      return;
    }

    if (!advance) return;
    if (this.idx >= this.messages.length) this.close();
    else this.addNextMessage();
  }

  close() {
    const cb = this.onClose;
    const pk = this.parentKey;
    this.scene.stop();
    if (pk) this.scene.resume(pk);
    if (cb) cb();
  }
}
