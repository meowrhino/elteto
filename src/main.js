import { BootScene } from './scenes/BootScene.js';
import { Aula } from './scenes/Aula.js';
import { Biblioteca } from './scenes/Biblioteca.js';
import { Patio } from './scenes/Patio.js';
import { DialogueScene } from './scenes/DialogueScene.js';
import { ForumScene } from './scenes/ForumScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { CombatScene } from './scenes/CombatScene.js';
import { setupSaveUI } from './save.js';
import { defaultState, applyState } from './state.js';
import { EventBus } from './events.js';

const BASE_W = 320;
const BASE_H = 180;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
// Espacio vertical aproximado que ocupa el cromo HTML alrededor del canvas
// (título + botones + hint + paddings + gaps). Se descuenta al elegir zoom.
const CHROME_V = 160;
const CHROME_H = 48;

// Elige el mayor múltiplo entero de zoom que cabe en el viewport, dentro
// del rango [MIN_ZOOM, MAX_ZOOM]. Cap a ×3 para no agrandar el pixel art
// (y empeorar la legibilidad del texto de 8px) en pantallas grandes.
function pickZoom() {
  const availW = Math.max(BASE_W, window.innerWidth - CHROME_H);
  const availH = Math.max(BASE_H, window.innerHeight - CHROME_V);
  const z = Math.floor(Math.min(availW / BASE_W, availH / BASE_H));
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: BASE_W,
  height: BASE_H,
  zoom: pickZoom(),
  pixelArt: true,
  backgroundColor: '#1a1a2a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false },
  },
  // ORDEN DE ESCENAS = ORDEN DE RENDERIZADO en Phaser.
  // Las "salas" (Aula, Biblioteca, Patio) y CombatScene se renderizan PRIMERO.
  // Los overlays (Dialogue, Forum, Menu) van DESPUÉS para que se dibujen ENCIMA.
  // [bug histórico: CombatScene estaba al final y tapaba el DialogueScene
  //  cuando se llamaba "Hablar" → el diálogo no se veía y el combate "se quedaba pillado"]
  scene: [BootScene, Aula, Biblioteca, Patio, CombatScene, DialogueScene, ForumScene, MenuScene],
});

// Estado inicial
applyState(game.registry, defaultState());

// Bus de eventos compartido
const events = new EventBus();
game.registry.set('events', events);

// Side-effect global del primer toggle de visión: Lucas muere aunque no
// estés en el aula al activarla.
events.on('first-vision', () => {
  const defeated = game.registry.get('defeated') || {};
  defeated.lucas = true;
  game.registry.set('defeated', defeated);
});

setupSaveUI(game);

// Recalcular zoom al redimensionar la ventana. Solo aplicamos si el zoom
// elegido cambia, para evitar set-size innecesarios.
let _appliedZoom = pickZoom();
window.addEventListener('resize', () => {
  const z = pickZoom();
  if (z !== _appliedZoom) {
    _appliedZoom = z;
    game.scale.setZoom(z);
  }
});

// Para depuración desde la consola del navegador
window.__game = game;
