import { RoomScene } from './RoomScene.js';
import { toSpec, lifespanOf } from '../data/characters.js';
import { ROOM_CUARTO_PROTA } from '../data/rooms/cuarto_prota.js';
import { unlockAchievement } from './AchievementToast.js';

// Cuarto del protagonista. Lo separamos del factory makeRoomClass porque
// añade un NPC "Cama" con onTalk para dormir/avanzar el día.
export class CuartoProta extends RoomScene {
  constructor() {
    super('CuartoProta');
    this.worldWidth = ROOM_CUARTO_PROTA.worldWidth;
    this.worldHeight = ROOM_CUARTO_PROTA.worldHeight;
    this.bgColor = ROOM_CUARTO_PROTA.bgColor;
  }

  buildRoom() {
    this.buildFromData(ROOM_CUARTO_PROTA);

    // NPC interactivo sobre la cama. Usa el sprite del peluche pero invisible
    // (alpha 0). Su única función es permitir [E] sobre la cama para dormir.
    const sleepNpc = this.addNpc(232, 140, {
      id: 'cama', name: 'Cama',
      sprite: toSpec('peluche'),
      lifespan: 999,
      onTalk: (scene) => scene.sleep(),
    });
    if (sleepNpc) sleepNpc.setAlpha(0);
  }

  // Dormir: cambia timeOfDay, restaura HP/MP, vuelve a abrir los ojos.
  sleep() {
    const flags = this.registry.get('flags') || {};
    const wasNight = flags.timeOfDay === 'night';
    flags.timeOfDay = wasNight ? 'day' : 'night';
    this.registry.set('flags', flags);
    if (!wasNight) unlockAchievement(this, 'night_first');

    // Restaurar stats
    const stats = this.registry.get('stats');
    stats.hp = stats.hpMax;
    stats.mp = stats.mpMax;
    stats.status = null;
    this.registry.set('stats', stats);

    const msg = wasNight
      ? ['Has dormido toda la noche.', 'Amanece. Tus PV y PM están al máximo.']
      : ['Te tumbas en la cama.', 'Se hace de noche. El cole está más silencioso.'];
    this.openDialogue('—', msg, () => {
      // Re-arrancar la sala para que se aplique el tinte nuevo
      this.scene.restart();
    });
  }
}
