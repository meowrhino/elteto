import { markUnlocked } from '../data/achievements.js';
import { audio } from '../audio.js';

// Toast (notificación) cuando se desbloquea un logro.
//
// Uso: desde cualquier Phaser.Scene activa, hacer:
//   import { unlockAchievement } from './AchievementToast.js';
//   unlockAchievement(this, 'first_dialogue');
//
// Si el logro ya estaba desbloqueado, no hace nada.

const TOAST_W = 200;
const TOAST_H = 28;

export function unlockAchievement(scene, id) {
  const ach = markUnlocked(scene.registry, id);
  if (!ach) return;
  audio.playSfx('confirm');
  showAchievementToast(scene, ach);
}

// Variante que asume que el ach ya está desbloqueado (devuelto por
// markUnlocked / registerTalk). Útil cuando el unlock se hace fuera de
// aquí pero queremos enseñar el toast.
export function showAchievementToast(scene, ach) {
  audio.playSfx('confirm');
  showToast(scene, ach);
}

function showToast(scene, ach) {
  const W = scene.scale.width;
  const x = (W - TOAST_W) / 2;
  const startY = -TOAST_H - 4;
  const endY = 6;

  // Para que el toast aparezca por encima de todo y se mueva con la cámara
  // (porque varias escenas activas se solapan), usamos scrollFactor 0 y
  // depth alto. La escena que llama puede ser una Room, Combat, Forum, etc.
  const container = scene.add.container(x, startY).setDepth(9999).setScrollFactor(0);

  // Sombra inferior
  const shadow = scene.add.rectangle(1, 1, TOAST_W, TOAST_H, 0x000000, 0.6).setOrigin(0, 0);
  // Fondo dorado/oscuro
  const bg = scene.add.rectangle(0, 0, TOAST_W, TOAST_H, 0x1a1a2a, 0.96)
    .setOrigin(0, 0).setStrokeStyle(1, 0xffd166);
  // Barra lateral dorada
  const sidebar = scene.add.rectangle(0, 0, 3, TOAST_H, 0xffd166).setOrigin(0, 0);
  // Iconito ★
  const star = scene.add.text(8, 4, '★', {
    fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffd166',
  }).setOrigin(0, 0);
  // Título
  const title = scene.add.text(22, 4, '¡Logro!', {
    fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffd166',
  }).setOrigin(0, 0);
  // Nombre del logro
  const name = scene.add.text(22, 14, ach.title, {
    fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#ffffff',
  }).setOrigin(0, 0);

  container.add([shadow, bg, sidebar, star, title, name]);

  // Animación entrada: desde arriba con bounce sutil
  scene.tweens.add({
    targets: container,
    y: endY,
    duration: 280,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      // Mantener 2.5s y salir
      scene.time.delayedCall(2500, () => {
        scene.tweens.add({
          targets: container,
          y: startY,
          alpha: 0,
          duration: 300,
          ease: 'Cubic.easeIn',
          onComplete: () => container.destroy(),
        });
      });
    },
  });
}
