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
const ZOOM = 3;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: BASE_W,
  height: BASE_H,
  zoom: ZOOM,
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

// Para depuración desde la consola del navegador
window.__game = game;
