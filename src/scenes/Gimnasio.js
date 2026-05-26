import { RoomScene } from './RoomScene.js';
import { ROOM_GIMNASIO } from '../data/rooms/gimnasio.js';
import { toSpec } from '../data/characters.js';
import { audio } from '../audio.js';

// Gimnasio. Tiene mini-juego de baloncesto: pulsar E sobre la pelota
// la lanza hacia una canasta cercana.
export class Gimnasio extends RoomScene {
  constructor() {
    super('Gimnasio');
    this.worldWidth = ROOM_GIMNASIO.worldWidth;
    this.worldHeight = ROOM_GIMNASIO.worldHeight;
    this.bgColor = ROOM_GIMNASIO.bgColor;
    this.score = 0;
  }

  buildRoom() {
    this.buildFromData(ROOM_GIMNASIO);

    // Encontrar la pelota más cercana del lado izquierdo y poner un NPC
    // invisible encima para que sea interactuable.
    this.ballSprite = null;
    this.decor.getChildren().forEach(d => {
      if (d.texture.key === 'ball' && d.x < 300 && !this.ballSprite) {
        this.ballSprite = d;
      }
    });

    if (this.ballSprite) {
      const interact = this.addNpc(this.ballSprite.x - 8, this.ballSprite.y - 18, {
        id: 'pelota_gim', name: 'Pelota',
        sprite: toSpec('peluche'), // sprite oculto
        lifespan: 999,
        onTalk: (scene) => scene.tryBasketShot(),
      });
      if (interact) interact.setAlpha(0);
    }

    // Scoreboard de mini-juego (muestra el contador)
    this.scoreText = this.add.text(304, 8, 'Tiros: 0', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffd166',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(100);
  }

  // Lanza la pelota hacia la canasta izquierda (x=80, y=60).
  // Random 60% anota, 40% rebota.
  tryBasketShot() {
    if (!this.ballSprite) return;
    const startX = this.ballSprite.x;
    const startY = this.ballSprite.y;
    const targetX = 86;
    const targetY = 76;
    const success = Math.random() < 0.6;
    audio.playSfx('confirm');

    // Animar parábola
    const midX = (startX + targetX) / 2;
    const midY = Math.min(startY, targetY) - 30;
    const stages = 20;
    let step = 0;
    const stepTimer = this.time.addEvent({
      delay: 22,
      repeat: stages - 1,
      callback: () => {
        const t = (++step) / stages;
        const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * targetX;
        const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * targetY;
        this.ballSprite.x = x;
        this.ballSprite.y = y;
        if (step === stages) this.resolveShot(success, startX, startY);
      },
    });
  }

  resolveShot(success, originX, originY) {
    this.score++;
    if (success) {
      // Anota: efecto + pop-up
      audio.playSfx('confirm');
      this.openDialogue('—', ['¡Canasta! +1 punto al rebote.']);
      this.flashCanvas(0x88ff88);
    } else {
      audio.playSfx('cancel');
      this.openDialogue('—', ['Rebota fuera. Vuelve a su sitio.']);
    }
    // Vuelve la pelota al sitio original (tras un pequeño delay)
    this.time.delayedCall(500, () => {
      this.ballSprite.x = originX;
      this.ballSprite.y = originY;
    });
    this.scoreText.setText('Tiros: ' + this.score);
  }

  flashCanvas(color) {
    const flash = this.add.rectangle(0, 0, this.worldWidth, this.worldHeight, color, 0.3)
      .setOrigin(0, 0).setScrollFactor(1).setDepth(50);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 250,
      onComplete: () => flash.destroy(),
    });
  }
}
