// Catálogo central de diálogos.
//
// Estructura: DIALOGUES[npcId][storyId] = array de líneas, o un objeto
// { speaker, text } por línea para diálogos multivocales.
//
// `default` se usa si no hay entrada específica para el storyId actual.
//
// Las cutscenes con lógica (mutación de capítulo, condiciones, etc.) NO
// viven aquí — siguen en el `onTalk` de cada sala. Aquí solo van líneas
// planas o ambientales.

export const DIALOGUES = {
  // ============================================================ Aula
  marta: {
    default: [
      'Psst... ¿qué le ha dado a Pablo?',
      'Lleva días así. La profe está rallada.',
    ],
    'act1.ch1.fighting': [
      'Pablo está fatal. Tengo miedo.',
    ],
    'act1.ch1.pablo_done': [
      '¿Lo hablaste con él? Parece otro.',
    ],
  },

  dani: {
    default: [
      'Yo de mayor quiero ser astronauta.',
      'O futbolista. O las dos cosas a la vez.',
    ],
  },

  lucas: {
    default: [
      'Zzzz... ¿eh? ¿Ya es el recreo?',
      'Despiértame cuando suene el timbre.',
    ],
    // En el modo visión, Lucas se descubre como muerto — el diálogo lo
    // gestiona Aula.onFirstVision() porque mata el sprite también.
  },

  // ============================================================ Biblioteca
  martina: {
    default: [
      '¡SHHHHHH! Aquí no se grita.',
      'Si quieres un libro, devuélvelo a tiempo.',
      'Últimamente uno de los libros... se mueve solo.',
      'No te acerques al estante del fondo.',
    ],
  },

  lector: {
    default: [
      'Estoy leyendo, no molestes.',
      '...vale, ¿qué quieres?',
      'Si vas al fondo, ten cuidado.',
    ],
  },

  // ============================================================ Patio
  ivan: {
    default: [
      'Yo soy el portero.',
      'Bueno, nadie me lo ha dicho pero...',
    ],
  },

  sofia: {
    default: [
      '¡Gol! Otro gol mío.',
      'Te juego un 1v1. Perderás.',
    ],
  },

  clara: {
    default: [
      'Desde aquí arriba se ve todo el patio.',
      'Pablo está raro, ¿no?',
    ],
    'act1.ch1.pablo_done': [
      'Desde aquí arriba se ve todo el patio.',
      'Parece que Pablo ya está bien. Menos mal.',
    ],
  },

  pablo_npc: {
    default: ['me voy a follar a tu madre'],
  },

  // Pablo libre, después del combate. Lo encontrarías de vuelta en el aula
  // o en el patio, con esta única frase que cierra su arco con humor negro.
  pablo: {
    'act1.ch1.pablo_done': [
      'Una gran experiencia.',
      'Una pena que no me haya podido follar más a tu madre.',
    ],
    'act1.ch1.done': [
      'Una gran experiencia.',
      'Una pena que no me haya podido follar más a tu madre.',
    ],
  },

  // ============================================================ Adultos / personal del cole

  manolo: {
    default: [
      'Cuidado con las baldosas, las acabo de fregar.',
      'Si te ve algún profe sin permiso por aquí, yo no he visto nada.',
    ],
  },

  pepa: {
    default: [
      '¿Vienes a por la merienda?',
      'Hoy hay pasta. Mañana también. Pasado, sopa.',
      'Comer es importante. Te lo digo yo.',
    ],
  },

  pepe: {
    default: [
      '¡Veinte flexiones! Vamos, ¡vamos!',
      'En mis tiempos esto era un campo de batalla.',
      '... pero qué mierda digo. Tomad un bocadillo, anda.',
    ],
  },

  luz: {
    default: [
      'La música es lo único que nos queda cuando todo se rompe.',
      '¿Tocas algo? ¿No? Pues empieza ya, no es tarde.',
    ],
  },

  galan: {
    default: [
      '"Ser o no ser..." ¿qué venía después?',
      'Estoy ensayando para el festival. Si me ves, no me distraigas.',
      'Una vez actué en una boda. Me echaron a los diez minutos.',
    ],
  },

  sara: {
    default: [
      'Aquí arriba se está mejor que abajo.',
      'No le digas a nadie que estoy aquí. Por favor.',
    ],
  },

  tania: {
    default: [
      '¿Has visto las pintadas? Las hago yo.',
      'No le digas a Manolo, que me mata.',
    ],
  },

  peluche: {
    default: [
      '(Es tu peluche. Te mira fijamente.)',
      '(...)',
      '(... te ha dicho algo. Estás seguro.)',
    ],
  },

  fantasma: {
    default: [
      '... yo... estuve aquí...',
      '... me olvidaron...',
      '(la silueta se desvanece al hablar)',
    ],
  },
};

// Resuelve líneas. Busca específico por storyId, luego default. Si no hay
// nada, devuelve null y la sala decide qué hacer (típicamente '(no responde)').
//
// linesFor('nivea', 'act1.ch1.intro') → array | null
export function linesFor(npcId, storyId) {
  const entry = DIALOGUES[npcId];
  if (!entry) return null;
  if (storyId && entry[storyId]) return entry[storyId];
  return entry.default || null;
}
