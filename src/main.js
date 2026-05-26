import { BootScene } from './scenes/BootScene.js';
import { Aula } from './scenes/Aula.js';
import { Biblioteca } from './scenes/Biblioteca.js';
import { Patio } from './scenes/Patio.js';
import { DialogueScene } from './scenes/DialogueScene.js';
import { ForumScene } from './scenes/ForumScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { CombatScene } from './scenes/CombatScene.js';
import { makeRoomClass } from './scenes/DataRoom.js';
import { ROOM_PASILLO } from './data/rooms/pasillo.js';
import { ROOM_BANOS } from './data/rooms/banos.js';
import { ROOM_COMEDOR } from './data/rooms/comedor.js';
import { ROOM_GIMNASIO } from './data/rooms/gimnasio.js';
import { Gimnasio } from './scenes/Gimnasio.js';
import { ROOM_AULA_MUSICA } from './data/rooms/aula_musica.js';
import { ROOM_SALON_ACTOS } from './data/rooms/salon_actos.js';
import { ROOM_AZOTEA } from './data/rooms/azotea.js';
import { ROOM_SOTANO } from './data/rooms/sotano.js';
import { Sotano } from './scenes/Sotano.js';
import { ROOM_SUENO_PABLO } from './data/rooms/sueno_pablo.js';
import { ROOM_ASTRAL } from './data/rooms/astral.js';
import { CuartoProta } from './scenes/CuartoProta.js';
import { setupSaveUI } from './save.js';
import { defaultState, applyState } from './state.js';
import { EventBus } from './events.js';
import { audio } from './audio.js';

const Pasillo     = makeRoomClass('Pasillo',     ROOM_PASILLO);
const Banos       = makeRoomClass('Banos',       ROOM_BANOS);
const Comedor     = makeRoomClass('Comedor',     ROOM_COMEDOR);
const AulaMusica  = makeRoomClass('AulaMusica',  ROOM_AULA_MUSICA);
const SalonActos  = makeRoomClass('SalonActos',  ROOM_SALON_ACTOS);
const Azotea      = makeRoomClass('Azotea',      ROOM_AZOTEA);
const SuenoPablo  = makeRoomClass('SuenoPablo',  ROOM_SUENO_PABLO);
const Astral      = makeRoomClass('Astral',      ROOM_ASTRAL);
// La pixel font (Press Start 2P) se carga vía <link> en index.html.
// Si tarda en estar lista el primer frame usa monospace y al siguiente
// se aplica Press Start 2P. Para evitar el flash usamos font-display: swap
// y un fontFamily con fallback en src/font.js.

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
  scene: [
    BootScene,
    Aula, Biblioteca, Patio,
    Pasillo, Banos, Comedor, Gimnasio, AulaMusica, SalonActos,
    Azotea, Sotano, CuartoProta, SuenoPablo, Astral,
    CombatScene,
    DialogueScene, ForumScene, MenuScene,
  ],
});

applyState(game.registry, defaultState());

const events = new EventBus();
game.registry.set('events', events);

events.on('first-vision', () => {
  const defeated = game.registry.get('defeated') || {};
  defeated.lucas = true;
  game.registry.set('defeated', defeated);
});

setupSaveUI(game);

let _appliedZoom = pickZoom();
window.addEventListener('resize', () => {
  const z = pickZoom();
  if (z !== _appliedZoom) {
    _appliedZoom = z;
    game.scale.setZoom(z);
  }
});

window.__game = game;
window.__audio = audio;

// Conectar mezclador HTML al AudioBus
function bindSlider(id, channel) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = audio.volumes[channel];
  el.addEventListener('input', () => {
    const v = parseInt(el.value, 10);
    audio.setVolume(channel, v);
    // Logro: primera vez que se sube el master por encima de 0
    if (channel === 'master' && v > 0) {
      import('./data/achievements.js').then(({ markUnlocked }) => {
        const ach = markUnlocked(game.registry, 'music_listen');
        if (ach) {
          // Mostrar toast en cualquier escena activa
          const active = game.scene.getScenes(true)[0];
          if (active) {
            import('./scenes/AchievementToast.js').then(({ showAchievementToast }) => {
              showAchievementToast(active, ach);
            });
          }
        }
      });
    }
  });
}
bindSlider('vol-master', 'master');
bindSlider('vol-bgm', 'bgm');
bindSlider('vol-sfx', 'sfx');
bindSlider('vol-voice', 'voice');
