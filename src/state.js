// Estado por defecto al iniciar una partida nueva.
// Todo lo persistente vive en game.registry. snapshotState lo serializa
// y applyState lo restaura tras cargar.

export function defaultState() {
  return {
    // Posición en el mundo (escena y coordenadas del player)
    player: { x: 60, y: 140, scene: 'Aula' },

    // Stats del protagonista (los followers no combaten todavía)
    stats: { hp: 24, hpMax: 24, mp: 12, mpMax: 12, atk: 4, def: 1 },

    // Party del Club de lo Oculto
    party: [
      {
        id: 'protag',
        name: 'Tú',
        sprite: { hair: 0xd4b384, skin: 0xf8d0aa, shirt: 0x1a1a1a, pants: 0x222244, hairStyle: 'curly' },
        lifespan: 180,
      },
      {
        id: 'jorge',
        name: 'Jorge',
        sprite: { hair: 0x6a3a2a, skin: 0xf0c8a8, shirt: 0xa8b870, pants: 0x442200, hairStyle: 'dino_hood' },
        lifespan: 140,
      },
      {
        id: 'barbara',
        name: 'Bárbara',
        sprite: { hair: 0xe8e8ec, skin: 0xf0c8b0, shirt: 0x1a1a1a, pants: 0x111122, hairStyle: 'white_purple_bob' },
        lifespan: 160,
      },
    ],

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
