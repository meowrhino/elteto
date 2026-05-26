// Catálogo de logros. Cada uno es un objeto inmutable; el estado de cuáles
// están desbloqueados vive en registry.flags.achievements (array de ids).
//
// Para añadir un logro nuevo:
//   1. Mete una entrada aquí con id, title y desc.
//   2. Desde el sitio del código que lo desbloquea, llama:
//        unlockAchievement(scene, 'mi_logro')
//   3. Listo: se persiste en el save (autosave) y aparece un toast.
//
// El sistema NO consulta condiciones automáticamente; cada logro se
// dispara explícitamente desde donde tiene sentido. Esto evita lógica
// global que tendríamos que mantener en paralelo a las acciones del juego.

export const ACHIEVEMENTS = {
  first_dialogue: {
    id: 'first_dialogue',
    title: 'Hola, mundo',
    desc: 'Hablaste con alguien por primera vez.',
  },
  meet_all: {
    id: 'meet_all',
    title: 'El censo del cole',
    desc: 'Hablaste con todos los NPCs del cole.',
  },
  vision_first: {
    id: 'vision_first',
    title: 'Ojos nuevos',
    desc: 'Activaste el modo visión por primera vez.',
  },
  pablo_done: {
    id: 'pablo_done',
    title: 'El bully ya no lo es',
    desc: 'Liberaste a Pablo del malestar.',
  },
  peace_pablo: {
    id: 'peace_pablo',
    title: 'Sin pegar a nadie',
    desc: 'Resolviste a Pablo sin combate.',
  },
  basket_anota: {
    id: 'basket_anota',
    title: 'Canasta',
    desc: 'Anotaste tu primera canasta en el gimnasio.',
  },
  night_first: {
    id: 'night_first',
    title: 'Buenas noches',
    desc: 'Dormiste y se hizo de noche.',
  },
  astral: {
    id: 'astral',
    title: 'El otro lado',
    desc: 'Cruzaste al astral por primera vez.',
  },
  sueno_pablo: {
    id: 'sueno_pablo',
    title: 'Dentro de su mente',
    desc: 'Visitaste el sueño de Pablo.',
  },
  music_listen: {
    id: 'music_listen',
    title: 'Oído fino',
    desc: 'Activaste el sonido por primera vez.',
  },
};

// Helpers para el runtime.

export function getUnlocked(registry) {
  const flags = registry.get('flags') || {};
  return Array.isArray(flags.achievements) ? flags.achievements : [];
}

export function isUnlocked(registry, id) {
  return getUnlocked(registry).includes(id);
}

// Marca un logro como desbloqueado. Devuelve el objeto del logro si era
// nuevo (para mostrar toast) o null si ya estaba. Persiste en registry.
export function markUnlocked(registry, id) {
  if (!ACHIEVEMENTS[id]) {
    console.warn(`[achievements] id desconocido: ${id}`);
    return null;
  }
  const flags = registry.get('flags') || {};
  const list = Array.isArray(flags.achievements) ? flags.achievements.slice() : [];
  if (list.includes(id)) return null;
  list.push(id);
  flags.achievements = list;
  registry.set('flags', flags);
  return ACHIEVEMENTS[id];
}
