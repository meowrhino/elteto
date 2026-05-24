// Estado por defecto al iniciar una partida nueva.
// Todo lo persistente vive en game.registry. snapshotState lo serializa
// y applyState lo restaura tras cargar.

import { toSpec, nameOf, lifespanOf } from './data/characters.js';

export function defaultState() {
  return {
    // Posición en el mundo (escena y coordenadas del player).
    // y=144 con sprite 24×32 y origen (0.5, 0.5) deja los pies en y=160
    // (sobre la plataforma de suelo).
    player: { x: 60, y: 144, scene: 'Aula' },

    // Stats del protagonista (los followers no combaten todavía)
    stats: { hp: 24, hpMax: 24, mp: 12, mpMax: 12, atk: 4, def: 1 },

    // Party del Club de lo Oculto. Aparienca y nombre vienen de
    // src/data/characters.js — aquí solo guardamos el id y el lifespan actual.
    party: ['protag', 'jorge', 'barbara'].map(id => ({
      id,
      name: nameOf(id),
      sprite: toSpec(id),
      lifespan: lifespanOf(id),
    })),

    inventory: [
      { id: 'pocion', name: 'Poción', desc: 'Cura 10 PV', count: 2, type: 'heal', amount: 10 },
      { id: 'merienda', name: 'Merienda', desc: 'Cura 5 PV', count: 1, type: 'heal', amount: 5 },
      { id: 'tinta', name: 'Tinta mágica', desc: 'Restaura 5 PM', count: 1, type: 'mana', amount: 5 },
      // El anillo del Club: clave para resolver pacíficamente combates poseídos
      { id: 'anillo_club', name: 'Anillo del Club', desc: 'Absorbe malestar ajeno', count: 1, type: 'key' },
    ],

    skills: [
      { id: 'regla', name: 'Reglazo', mpCost: 0, dmg: 4, desc: 'Golpe con la regla' },
      { id: 'bola_fuego', name: 'Bola de fuego', mpCost: 3, dmg: 8, desc: 'Quema al enemigo' },
      { id: 'silbar', name: 'Silbar', mpCost: 1, dmg: 2, desc: 'Distrae al enemigo' },
    ],

    equipment: { arma: 'Regla escolar', armadura: 'Bata', accesorio: 'Anillo del Club' },

    // Enemigos derrotados (id -> true)
    defeated: {},

    // Flags varios: chapter (progresión), sepia (vista activa), etc.
    flags: { chapter: 'intro' },
  };
}

export function applyState(registry, state) {
  for (const [key, value] of Object.entries(state)) registry.set(key, value);
}

export function snapshotState(registry) {
  return {
    player: registry.get('player'),
    stats: registry.get('stats'),
    party: registry.get('party'),
    inventory: registry.get('inventory'),
    skills: registry.get('skills'),
    equipment: registry.get('equipment'),
    defeated: registry.get('defeated'),
    flags: registry.get('flags'),
  };
}
