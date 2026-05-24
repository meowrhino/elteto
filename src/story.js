// Helpers de progresión de historia.
//
// El estado vive en registry.flags.storyId (string 'actX.chY.step').
// El grafo y orden canónico están en src/data/story-graph.js.
//
// Las constantes CHAPTERS se mantienen como alias por compatibilidad con
// el código existente (Aula.js / Patio.js usaban CHAPTERS.INTRO etc.).

import { NODES, ORDER, LEGACY_MAP } from './data/story-graph.js';

export { NODES, ORDER };

// Alias estables que apuntan al ID nuevo. Permite no romper el código
// que hacía `chap === CHAPTERS.INTRO`.
export const CHAPTERS = {
  INTRO: 'act1.ch1.intro',
  INVESTIGATING: 'act1.ch1.investigating',
  FIGHTING: 'act1.ch1.fighting',
  PABLO_DONE: 'act1.ch1.pablo_done',
  DONE: 'act1.ch1.done',
};

const DEFAULT_ID = CHAPTERS.INTRO;

// Devuelve el ID actual normalizado (resuelve legacy si hace falta).
export function getChapter(registry) {
  const flags = registry.get('flags') || {};
  let id = flags.storyId || flags.chapter; // 'chapter' es el campo legacy
  if (!id) return DEFAULT_ID;
  if (LEGACY_MAP[id]) id = LEGACY_MAP[id];
  return id;
}

// Devuelve el NODO completo (para UI / título de capítulo / siguiente nodo).
export function getChapterNode(registry) {
  return NODES[getChapter(registry)] || NODES[DEFAULT_ID];
}

// Avanza a un ID concreto. Si el ID no existe, no hace nada.
export function setChapter(registry, id) {
  if (LEGACY_MAP[id]) id = LEGACY_MAP[id];
  if (!NODES[id]) return;
  const flags = registry.get('flags') || {};
  flags.storyId = id;
  delete flags.chapter;
  registry.set('flags', flags);
}

// Alias semántico — útil cuando avanzas linealmente.
export function advance(registry) {
  const current = getChapterNode(registry);
  if (current.next) setChapter(registry, current.next);
}

// True si el storyId actual es id o uno posterior en ORDER.
// Si alguno no aparece en ORDER, se considera "no comparable" → false.
export function isChapterAtLeast(registry, id) {
  if (LEGACY_MAP[id]) id = LEGACY_MAP[id];
  const currentIdx = ORDER.indexOf(getChapter(registry));
  const targetIdx = ORDER.indexOf(id);
  if (currentIdx < 0 || targetIdx < 0) return false;
  return currentIdx >= targetIdx;
}
