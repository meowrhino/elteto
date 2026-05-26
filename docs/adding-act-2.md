# Cómo añadir un Acto 2 (o más capítulos)

La arquitectura actual está diseñada para que añadir un acto nuevo sea
**puramente data-driven**: en muchos casos basta con editar archivos en
`src/data/` sin tocar `src/scenes/`.

---

## 1. Definir los nodos del story-graph

Edita `src/data/story-graph.js` y añade los nodos del acto nuevo:

```js
export const NODES = {
  // ... actos anteriores ...

  'act2.ch1.intro': {
    id: 'act2.ch1.intro',
    act: 2,
    chapter: 1,
    step: 'intro',
    title: 'Título del capítulo',
    next: 'act2.ch1.investigating',
  },
  'act2.ch1.investigating': { /* ... */ },
  // ...
};

// Añade los nuevos IDs al array ORDER en el orden canónico:
export const ORDER = [
  'act1.ch1.intro', /* ... */ 'act1.ch1.done',
  'act2.ch1.intro', 'act2.ch1.investigating', /* ... */
];
```

`isChapterAtLeast(registry, 'act2.ch1.intro')` ya funciona — usa el índice
en `ORDER`. Cualquier sitio que compare capítulos con
`if (chap === CHAPTERS.X)` puede hacerlo igual con el nuevo ID.

---

## 2. Filtrar contenido por capítulo (onlyIn / notIn)

Las salas data-driven (todas excepto `Aula`, `Biblioteca`, `Patio`, `CuartoProta`, `Sotano`, `Gimnasio`) procesan `data/rooms/*.js` con un sistema de filtros:

```js
// data/rooms/comedor.js
npcs: [
  { x: 100, y: 128, id: 'pepa', name: 'Pepa', sprite: 'pepa' },

  // Sólo aparece en el acto 2 capítulo 1
  { x: 200, y: 128, id: 'detective', name: 'Detective', sprite: 'detective',
    onlyIn: ['act2.ch1.*'] },

  // NO aparece tras el acto 2
  { x: 300, y: 128, id: 'pepe', name: 'Pepe', sprite: 'pepe',
    notIn: ['act3.*'] },
],
```

Soporta wildcards `*`. Funciona también para `decor`, `doors`, `signs`.

---

## 3. Diálogos por capítulo

`src/data/dialogues.js` ya está indexado por `(npcId, storyId)`. Añade
las líneas para el nuevo acto:

```js
nivea: {
  'act1.ch1.intro': ['Hola...', 'Es sobre Pablo...'],
  'act1.ch1.investigating': ['Por favor, ve al patio.'],
  'act2.ch1.intro': ['Ahora hay un problema mayor.', '...'],
  default: ['Gracias por todo.'],
},
```

Si no hay entrada específica, usa `default`.

---

## 4. Personajes nuevos

`src/data/characters.js`. Sólo necesita id, items y colors. Los items
usan keys que ya están en `src/sprite-items.js`.

---

## 5. Salas nuevas (3 opciones)

### a) Sala data-driven simple (sin lógica narrativa propia)

```js
// src/data/rooms/biblioteca_secreta.js
export const ROOM_BIBLIO_SECRETA = {
  worldWidth: 480, worldHeight: 180, bgColor: '#1a0a1a',
  interior: { wallColor: 0x2a0a2a, /* ... */ },
  floorY: 160, floorTex: 'tile',
  decor: [ /* ... */ ],
  doors: [ /* ... */ ],
  npcs: [ /* ... */ ],
};

// src/main.js:
import { ROOM_BIBLIO_SECRETA } from './data/rooms/biblioteca_secreta.js';
const BiblioSecreta = makeRoomClass('BiblioSecreta', ROOM_BIBLIO_SECRETA);
// Añadir 'BiblioSecreta' al array `scene: [...]`
```

### b) Sala con lógica narrativa (cutscenes, NPCs dinámicos)

Crea una clase concreta `src/scenes/MiSala.js` que extienda `RoomScene`
y, en `buildRoom()`, llame a `this.buildFromData(ROOM_MI_SALA)` y luego
añada NPCs/decor extra programáticamente. Modela según `Aula.js` o
`Sotano.js`.

### c) Sala genérica con condiciones por capítulo

Si la sala existe en acto 1 pero cambia visualmente en acto 2, no
necesitas duplicarla — usa `onlyIn`/`notIn` en el data.

---

## 6. Avanzar la historia desde el código

```js
import { setChapter, advance } from '../story.js';

// En una cutscene:
setChapter(this.registry, 'act2.ch1.intro');

// O avanzar al siguiente nodo canónico (sigue la cadena `next`):
advance(this.registry);
```

`game.registry.events.on('changedata', ...)` ya está enganchado en
`save.js` para que cualquier cambio de `flags` dispare un autosave.

---

## 7. BGM, decor o sistemas nuevos

- **BGM nuevo por sala**: añade un preset en `BGM_PRESETS` (audio.js).
  El nombre debe matchear el scene key en snake_case (ej.
  `AulaMusica` → `aula_musica`).
- **Decor nuevo**: añade un drawer puro a `src/decor-defs.js` + entrada
  al `DECOR_CATALOG`. Después corre `node tools/export-decor.mjs` para
  generar el PNG.
- **Logros nuevos**: añade al catálogo `src/data/achievements.js` y
  llama `unlockAchievement(scene, 'id')` desde donde tenga sentido.
- **Voces nuevas (babble)**: añade entrada a `VOICES` en `audio.js` con
  el nombre exacto del speaker.
- **Colores de speaker para diálogo**: `SPEAKER_COLORS` en
  `src/portraits.js`.

---

## Checklist rápida para añadir Acto 2

1. [ ] Nodos en `story-graph.js` + actualizar `ORDER`.
2. [ ] Personajes nuevos en `characters.js`.
3. [ ] Diálogos en `dialogues.js` (con `onlyIn` si hace falta).
4. [ ] Filtros `onlyIn`/`notIn` en salas existentes para los NPCs/decor
   del acto nuevo.
5. [ ] Salas nuevas via `makeRoomClass` (o clase concreta si hay lógica).
6. [ ] Logros nuevos en `achievements.js`.
7. [ ] BGM preset si la atmósfera cambia.
8. [ ] Colores de speaker en `portraits.js`.
9. [ ] Cutscene de transición (en una clase de sala, normalmente la
   última del acto anterior).
