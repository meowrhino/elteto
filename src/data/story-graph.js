// Grafo de progresión de la historia. Cada nodo es un (act, chapter, step).
//
// La progresión se hace por ID (no por enums sueltos), lo que permite añadir
// actos/capítulos sin tocar story.js. Cada nodo declara:
//   - `id`: string único 'actX.chY.step'
//   - `act`, `chapter`, `step`: campos planos (útiles para UI "Capítulo X")
//   - `title`: nombre legible (UI splash)
//   - `next`: siguiente nodo en la línea principal (opcional)
//
// Los nodos NO encadenan automáticamente: la lógica narrativa
// (cutscenes, victorias en combate, etc.) llama a advanceTo(id) cuando toca.
// `next` es solo una hint para el orden canónico.

export const NODES = {
  'act1.ch1.intro': {
    id: 'act1.ch1.intro',
    act: 1,
    chapter: 1,
    step: 'intro',
    title: 'El bully está roto',
    next: 'act1.ch1.investigating',
  },
  'act1.ch1.investigating': {
    id: 'act1.ch1.investigating',
    act: 1,
    chapter: 1,
    step: 'investigating',
    title: 'El bully está roto',
    next: 'act1.ch1.fighting',
  },
  'act1.ch1.fighting': {
    id: 'act1.ch1.fighting',
    act: 1,
    chapter: 1,
    step: 'fighting',
    title: 'El bully está roto',
    next: 'act1.ch1.pablo_done',
  },
  'act1.ch1.pablo_done': {
    id: 'act1.ch1.pablo_done',
    act: 1,
    chapter: 1,
    step: 'pablo_done',
    title: 'El bully está roto',
    next: 'act1.ch1.done',
  },
  'act1.ch1.done': {
    id: 'act1.ch1.done',
    act: 1,
    chapter: 1,
    step: 'done',
    title: 'El bully está roto',
    next: null, // FIN del capítulo 1
  },
};

// Para `isAtOrAfter(id)`, orden canónico de los nodos. Cada nuevo capítulo
// se añade aquí. Comparamos por índice en el array.
export const ORDER = [
  'act1.ch1.intro',
  'act1.ch1.investigating',
  'act1.ch1.fighting',
  'act1.ch1.pablo_done',
  'act1.ch1.done',
];

// Compatibilidad con story.js antiguo: mapeo legacy -> id nuevo.
// Usado al cargar saves de versiones anteriores.
export const LEGACY_MAP = {
  'intro': 'act1.ch1.intro',
  'investigating': 'act1.ch1.investigating',
  'fighting': 'act1.ch1.fighting',
  'pablo_done': 'act1.ch1.pablo_done',
  'done': 'act1.ch1.done',
};

// Patrón sencillo de matching: 'act1.ch1.*' coincide con cualquier step
// del capítulo 1 acto 1. 'act1.*' coincide con cualquier capítulo del
// acto 1. Sin asterisco, comparación literal exacta.
//
// Útil para campos `onlyIn` / `notIn` en data/rooms/*.js, que filtran
// NPCs, decor o puertas según el storyId actual.
export function matchesStoryPattern(storyId, pattern) {
  if (!pattern || !storyId) return false;
  if (pattern === storyId) return true;
  if (!pattern.includes('*')) return false;
  // Convertir 'act1.ch1.*' a regex anclado
  const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
  return re.test(storyId);
}

// Devuelve true si `storyId` cumple las condiciones de un item:
//   item.onlyIn:  array de patrones; al menos uno debe matchear (whitelist)
//   item.notIn:   array de patrones; ninguno debe matchear (blacklist)
// Si no hay condiciones, siempre passes.
export function passesStoryFilter(storyId, item) {
  if (!item) return true;
  if (item.onlyIn) {
    if (!item.onlyIn.some(p => matchesStoryPattern(storyId, p))) return false;
  }
  if (item.notIn) {
    if (item.notIn.some(p => matchesStoryPattern(storyId, p))) return false;
  }
  return true;
}
