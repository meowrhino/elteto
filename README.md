# elteto

Side-scroller 2D en pixel art con Phaser 3. Un juego escolar con un club de lo oculto, un bully poseído y modo visión.

## Cómo correr

No tiene build. Sirve la carpeta por HTTP y abre `index.html`:

```bash
# desde la carpeta del proyecto
python3 -m http.server 8000
# luego abre http://localhost:8000
```

O abre `index.html` con la extensión **Live Server** de VS Code.

## Controles

| Tecla    | Acción                                     |
| -------- | ------------------------------------------ |
| ← →      | Mover                                       |
| ↑ ↓      | Escalar (sobre escalera, cuerda o celosía) |
| E        | Hablar / entrar puerta / avanzar diálogo    |
| TAB      | Abrir/cerrar menú                           |
| ESC      | Cerrar menú o diálogo                       |
| `-`      | Toggle modo visión (sepia + lifespan)       |
| SPACE    | Confirmar en combate                        |

## Estructura

```
src/
├── main.js              ← arranque: Phaser config + estado + bus
├── state.js             ← estado por defecto (player, party, inventory, flags)
├── characters.js        ← factory de sprites 24×32 (estilos por personaje)
├── enemies.js           ← configs de enemigos (Pablo, libro poseído)
├── events.js            ← EventBus pub/sub compartido
├── story.js             ← capítulos / progresión
├── portraits.js         ← retratos Picrew + colores por speaker
├── save.js              ← guardar y cargar partida (JSON descargable)
└── scenes/
    ├── BootScene.js     ← precarga de retratos antes de cualquier sala
    ├── RoomScene.js     ← base de cualquier sala (input, físicas, NPCs, visión)
    ├── Aula.js          ← clase: profesora, alumnos, Lucas
    ├── Biblioteca.js    ← libro poseído, bibliotecaria, lector
    ├── Patio.js         ← Pablo (NPC o enemigo según capítulo), niños
    ├── DialogueScene.js ← overlay de diálogo (mono o multi-speaker)
    ├── ForumScene.js    ← overlay tipo chat para reuniones del Club
    ├── MenuScene.js     ← menú con tabs y tarjetas de personaje
    └── CombatScene.js   ← combate por turnos (con mecánica especial para Pablo)
```

> **Orden de escenas importa** — los overlays (Dialogue/Forum/Menu) deben ir DESPUÉS de las salas y CombatScene en `main.js`. Si CombatScene queda al final, se renderiza encima del DialogueScene y los diálogos en combate son invisibles.

## Personajes

(Apariencia basada en los retratos Picrew de `perosnajes/`.)

- **Tú (Protagonista)** — un protagonista vacío que intenta tomar las decisiones correctas. Capucha de dinosaurio verde con cuernos amarillos, pelo castaño, jersey blanco con rayas verdes, pecas.
- **Jorge** — miembro del Club. Tiene tourette, sus aportaciones tienden al absurdo. Pelo morado corto, mostacho, chupa de cuero negra con parches, pendientes de aro.
- **Bárbara** — miembro del Club. El cerebro. Pelo bob blanco arriba / morado abajo, top de rayas y chaqueta negra abierta.
- **Pablo** — el bully. Lleva días repitiendo la misma frase. Gorro blanco, pelo morado/teal, máscara negra, camiseta blanca "NUGGTS".
- **Nivea (profesora)** — está rallada con Pablo. Pelirroja con gafas redondas, chaleco verde sobre camisa de rayas.
- **Martina (bibliotecaria)** — pelo súper rizado rubio (afro), jersey negro, pendientes de aro.
- **Niño lector, Lucas, Marta, Dani, Sofía, Iván, Clara** — secundarios.

## Capítulo 1: "El bully está roto"

1. Empiezas en el aula. La profesora te pide que hables con Pablo.
2. Se abre el **foro interno del Club** (Bárbara teoriza posesión, Jorge no aporta nada).
3. Vas al **patio**. Tocar a Pablo dispara combate.
4. En combate:
   - **Hablar** la primera vez → su frase + reacciones del equipo.
   - **Hablar** la segunda vez → el Anillo del Club absorbe el malestar (paz).
   - **Atacar** repetidas veces también lo derrota (cargártelo).
5. Vuelves al aula y reportas: "lo he conseguido".

## Modo visión

Pulsa `-` para activarlo. La pantalla pasa a sepia y aparecen los **segundos de vida restantes** sobre cada personaje. El tiempo decrementa en tiempo real mientras está activo.

La primera vez que lo activas dispara un evento global: en el aula descubrirás que Lucas, el alumno "dormido", lleva tiempo muerto.

## Guardado

Los botones **Guardar partida** y **Cargar partida** descargan/leen un JSON con todo el estado: posición, stats, inventario, capítulo, enemigos derrotados, etc.

## Sprites y retratos

Los **retratos** de los personajes (las imágenes detalladas que se ven en el menú y en los diálogos) están hechos con [Picrew — Image Maker by Nuggts](https://picrew.me/ja/image_maker/1868017/). Viven en `perosnajes/`.

Los **sprites in-world** (los muñequitos 24×32 que ves moverse en las salas) son pixel art generado programáticamente desde [`src/sprite-defs.js`](src/sprite-defs.js) intentando evocar esos retratos. Una vez generados, se pueden volcar a PNG en `assets/sprites/` ejecutando `node tools/export-sprites.mjs`.

Cuando los sprites pixel definitivos estén hechos, se sustituirán y se dará crédito apropiado en este README y en los créditos del juego. Por ahora estamos en pruebas.

## Tooling

- [`tools/editor.html`](tools/editor.html) — editor standalone con dos pestañas:
  - **Sprites**: preview multi-escala, pickers de color, librería en localStorage, exportación a PNG, carga del catálogo.
  - **Habitaciones**: paleta de tiles/decor/NPC, edición por click+drag, exportación a JSON, carga de salas existentes (`assets/rooms/*.json`).
- [`tools/export-sprites.mjs`](tools/export-sprites.mjs) — script Node sin dependencias que renderiza todos los sprites del catálogo a PNG (encoder PNG y PixelCanvas caseros, solo `node:zlib`).
- [`tools/lib/sprite-catalog.mjs`](tools/lib/sprite-catalog.mjs) — fuente única para la lista de sprites a exportar.
- [`assets/rooms/`](assets/rooms/) — layouts de las salas existentes como JSON.
- [`assets/sprites/`](assets/sprites/) — 13 PNGs generados (party + NPCs + enemigos).

Sirve el proyecto por HTTP (`python3 -m http.server 8000` o equivalente) y abre `tools/editor.html`.

## Stack

- [Phaser 3.80.1](https://phaser.io/) (vía CDN, sin build)
- Vanilla JS + ES modules
- Sin dependencias de runtime
- Tooling Node sin dependencias (solo `node:zlib`, `node:fs`)

## Roadmap inmediato

- Sustituir sprites programáticos por pixel art real
- Más capítulos (el libro poseído ya está esperando)
- Sistema de "preguntas con respuesta falsa" (el protagonista vacío toma la decisión contraria)
- Combate en grupo (Jorge y Bárbara con turnos propios)

---

## Estado actual (a día de hoy)

> Revisión profunda del proyecto en este punto. La historia se mantiene; aquí se discute solo arquitectura y aspecto.

### Lo que está atomizado y limpio

| Sistema | Estado | Notas |
|---|---|---|
| Escenas (lugares) | ✓ Atomizado | Una sala = un archivo. `RoomScene` base + subclases. |
| Overlays (Dialogue/Forum/Menu/Combat) | ✓ Atomizado | Cada uno en su archivo. |
| Sistema de eventos | ✓ Atomizado | `src/events.js` (EventBus mínimo) |
| Sprite drawers | ✓ Atomizado | `src/sprite-defs.js` puro, sin Phaser, reusable en Node y browser. |
| Generador de mapas | ✓ Hecho | `tools/editor.html`, pestaña Habitaciones. |
| Catálogo de salas en JSON | ✓ Hecho | `assets/rooms/{aula,biblioteca,patio}.json`. |

### Lo que NO está atomizado / próximos pasos

| Sistema | Estado | Pendiente |
|---|---|---|
| Personajes | ✗ Dispersos en 6 sitios | `state.js`, `enemies.js`, cada `buildRoom`, y `tools/lib/sprite-catalog.mjs`. Necesita un único `src/data/characters.js`. |
| Carga de assets | ✗ Regenerado en runtime | Cada arranque `ensureSprite` redibuja sprites; `makeStaticTextures` repinta tiles. Se debería **guardar la imagen generada y cargarla**, no regenerar. |
| Sistema de diálogos (datos) | ✗ Hardcoded | Los strings de diálogo viven dentro de cada escena. Deberían ir a `assets/dialogs/*.json`. |
| Combate (motor vs mecánicas) | ◐ Monolítico | `CombatScene` 378 LOC mezcla turn engine + mecánica especial de Pablo. Separar engine de hooks. |
| Acto 1/2/3 | ✗ No existe | Solo hay `flags.chapter` con 5 fases del único arco. No hay scaffolding para más actos. |
| Loader JSON → Phaser room | ✗ No existe | Los JSONs de `assets/rooms/` son documentales; las salas siguen construyéndose en código. |

### Decisiones de diseño que se posponen al próximo batch

- **Centralización de personajes**: mover specs a `src/data/characters.js`, referenciar por id desde state/enemies/scenes.
- **Pipeline de assets pre-generados**: la regla es "código generador permanece, pero el juego carga PNGs". Aplica a sprites de personaje, tiles estáticas (suelo, escalera, pizarra, etc.) y futuros props.
- **Editor estilo Picrew**: descomponer los drawers monolíticos en items componibles (gorro / pelo / ojos / boca / accesorio / ropa / pantalón / extras). Cada slot tiene varias opciones, el personaje es una combinación + 4 colores.

### Filosofía

> "Si lo generamos por código, lo guardamos como imagen y ya."

El código generador se queda como herramienta (en `tools/`), no se vuelve a ejecutar en el juego. Permite editar a mano después si hace falta, y mantiene los tiempos de carga bajos.

## Comparativa con otros motores

Ver [`docs/engines.md`](docs/engines.md) para una tabla item-por-item de cómo resolvemos cada cosa aquí frente a Phaser estándar, PixiJS, Godot y otros, con propuestas concretas de mejora.
