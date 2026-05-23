// Helpers de progresión de historia.
// Las fases viven en registry.flags.chapter.

export const CHAPTERS = {
  INTRO: 'intro',                // Acabas de empezar; nadie te ha pedido nada todavía
  INVESTIGATING: 'investigating',// Hablaste con la Profesora; toca ir al patio
  FIGHTING: 'fighting',          // El combate con Pablo está disponible
  PABLO_DONE: 'pablo_done',      // Pablo derrotado / liberado del malestar
  DONE: 'done',                  // Reportaste a la Profesora
};

export function getChapter(registry) {
  const flags = registry.get('flags') || {};
  return flags.chapter || CHAPTERS.INTRO;
}

export function setChapter(registry, chapter) {
  const flags = registry.get('flags') || {};
  flags.chapter = chapter;
  registry.set('flags', flags);
}

export function isChapterAtLeast(registry, chapter) {
  const order = [
    CHAPTERS.INTRO,
    CHAPTERS.INVESTIGATING,
    CHAPTERS.FIGHTING,
    CHAPTERS.PABLO_DONE,
    CHAPTERS.DONE,
  ];
  return order.indexOf(getChapter(registry)) >= order.indexOf(chapter);
}
