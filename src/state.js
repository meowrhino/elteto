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
      // El anillo del Club: limpia tus status, confunde al enemigo poseído.
      // Tiene count infinito (no se consume) y type 'special' para que aparezca
      // en el menú pero no se filtre como objeto consumible.
      { id: 'anillo_club', name: 'Anillo del Club', desc: 'Limpia tus status y confunde al poseído', count: 99, type: 'special' },
    ],

    skills: [
      { id: 'regla', name: 'Reglazo', mpCost: 0, dmg: 4, desc: 'Golpe con la regla' },
      { id: 'bola_fuego', name: 'Bola de fuego', mpCost: 3, dmg: 8, desc: 'Quema · puede confundir' },
      { id: 'silbar', name: 'Silbar', mpCost: 1, dmg: 0, desc: 'Puede dormir al enemigo' },
      { id: 'curar', name: 'Curar', mpCost: 4, dmg: 0, heal: 12, desc: 'Recupera 12 PV propios' },
      { id: 'concentrar', name: 'Concentrar', mpCost: 2, dmg: 0, desc: 'x2 ATK próximo turno' },
      { id: 'chillar', name: 'Chillar', mpCost: 2, dmg: 0, desc: 'Puede confundir al enemigo' },
    ],

    equipment: { arma: 'Regla escolar', armadura: 'Bata', accesorio: 'Anillo del Club' },

    // Enemigos derrotados (id -> true)
    defeated: {},

    // Flags varios:
    //   - storyId: ID del nodo de progresión (story-graph)
    //   - timeOfDay: 'day' | 'night' — cambia tinte y NPCs visibles
    //   - sepia: vista activa (modo visión)
    flags: { storyId: 'act1.ch1.intro', timeOfDay: 'day' },
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
