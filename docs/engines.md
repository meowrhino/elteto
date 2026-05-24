# Comparativa: elteto vs otros motores

> Análisis item por item, bloque por bloque, de cómo resolvemos cada cosa
> hoy y cómo lo resuelven otros motores web y juegos de referencia.
> Para cada item: 3 propuestas de mejora + una recomendada con explicación.

## Referencias usadas

**Motores web**

| Motor | Tipo | Uso típico | Cuándo brilla |
|---|---|---|---|
| **HTML5 Canvas puro** | Renderer del navegador | Todo a mano | Demos pequeñas, control total, cero overhead |
| **Phaser 3** (lo que usamos) | Framework 2D | RPG, side-scroller, puzzle | Scenes + Arcade physics + tilemap salen del paquete |
| **PixiJS** | Renderer 2D (WebGL) | Cuando quieres sprites rápidos y compones tú el motor | Render brutal, sin opinión, te toca decidir todo |
| **Godot 4 (export HTML5)** | Motor completo con editor | Juegos grandes 2D/3D | Editor visual, nodes, tilemap profesional, animaciones |

**Juegos referencia (no son motores, son ejemplos de diseño)**

| Juego | Qué nos puede inspirar |
|---|---|
| **Earthbound (SNES)** | Combate por turnos con texto narrado, rolling HP counter, fondos psicodélicos animados |
| **Undertale** | Diálogo con tipografía pixel + face cuts, save-anywhere, "soul" mechanics en combate, sprites pequeños sobre fondos negros |
| **Lisa: The Painful** | Sistema de party con muerte permanente, sprites pixel sobre fondos detallados, side-scroller |
| **OneShot** | Diálogos como overlay HTML real (rompe el canvas), eventos del sistema operativo simulados |

---

## Tabla maestra: bloque por bloque

Cada fila es un sistema de elteto. Para cada uno, cómo lo hace cada motor/juego.

| Bloque elteto | Nosotros hoy | Phaser idiomático | PixiJS desnudo | Godot 4 web | Canvas puro | Earthbound | Undertale |
|---|---|---|---|---|---|---|---|
| **Arranque** | `main.js` + array de scenes | `game.scene.add()` + autoStart en BootScene | Crear `Application`, montar children a mano | Escena raíz en `project.godot`, `_ready()` | `<canvas>` + un `gameLoop` con `requestAnimationFrame` | ROM corre y boot único | Boot único, sin escenas |
| **Estado global** | `game.registry.set/get` | `registry` (lo usamos) o singleton | Patrón propio (singleton, redux) | `Autoload` (singleton Godot) | Objeto plain en memoria | RAM hardcoded | Variables globales + flag file |
| **Eventos** | `EventBus` casero (pub/sub) | `scene.events` (Phaser ya trae) | `EventEmitter` propio | `signal` (built-in en GDScript) | `addEventListener` o emitter casero | N/A (hardcoded) | Eventos por flag |
| **Carga de assets** | `BootScene.preload` + generación en runtime | `preload()` con `load.image/atlas` | `Assets.load()` (Pixi v7+) | Editor importa, `preload` automático | `new Image()` + onload | ROM (todo en cartridge) | Files individuales, lazy |
| **Texturas pixel art** | Sprites generados con `Graphics`, tiles con `makeStaticTextures` | Texture atlas (TexturePacker) o `load.image` | Sprite sheets, BitmapFont | TileSet en editor visual | `drawImage` con `imageSmoothingEnabled=false` | Hardware tiles + sprites | Hand-painted sprites |
| **Escena/sala** | `RoomScene` base + 3 subclases | Una `Scene` por sala (lo hacemos) | Crear `Container` por sala | `PackedScene` (.tscn) | Función `setupRoom()` + estado | Mapa con triggers de salida | Room/Room transitions |
| **Tilemap** | `addPlatform/addClimb` manuales | Tilemap Tiled (`load.tilemapTiledJSON`) | Pintar tiles a mano | TileMap nativo del editor | Pintar tiles a mano | Hardware (BG tiles) | A mano |
| **Físicas** | `physics.add.staticGroup` (Arcade) | Arcade (lo usamos) o Matter | Tu eliges (planck, matter, casero) | PhysicsBody2D nativo | A mano (AABB) | RPG → no hay física, hay grid | AABB casero |
| **Input** | `keyboard.addKey` + `JustDown` | Igual (Phaser estándar) | `window` listeners + diff de estado | `Input.is_action_just_pressed` | `keydown/keyup` + dict de estado | Botones gamepad | Igual que Phaser pero más simple |
| **Cámara** | `cameras.main.startFollow` | Igual | Mover el `viewport.position` | `Camera2D` nodo | Calcular offset y aplicarlo al draw | Pantalla bloqueada, scroll por mapa | Cámara fija |
| **Diálogo** | `DialogueScene` canvas con `add.text` | Igual o plugin RexUI | `Text` PIXI + custom layout | `RichTextLabel` con BBCode | `fillText` + tipear letra a letra | Texto box bajo con retrato | Texto box bajo con face + typing FX |
| **Combate** | `CombatScene` con estado FSM | Igual (común en Phaser RPG) | Sin opinión | `Node` con script propio | Bucle propio | Battle scene separada, "rolling HP" | Mini-juego de esquiva en pantalla |
| **Guardado** | `JSON.stringify(registry)` → Blob descarga | Igual o `localStorage` | `localStorage` o IndexedDB | `ResourceSaver.save()` (filesystem) | Igual nuestro | Save point + battery RAM | Save anywhere + JSON en disco |
| **Modo visión (sepia)** | `cameras.main.postFX.addColorMatrix().sepia()` | Igual (postFX built-in) | Custom filter (WebGL shader) | `ColorRect` + shader | `ctx.filter = 'sepia(1)'` | N/A | Inversiones para "Sans's encounter" |
| **HUD/UI** | Otra Scene encima | Igual | `Container` con depth alta | `CanvasLayer` o UI scene | DOM sobre canvas o segundo canvas | Box pintado en framebuffer | DOM sobre canvas (algunos elementos) |

---

## Item-by-item: 3 propuestas por bloque

Para cada bloque que ya tenemos, 3 caminos de mejora. La recomendada arriba.

### 1. Arranque — `src/main.js`

**Cómo está**: orden de escenas hardcoded en `main.js`, registry inicializado a mano, listener de `first-vision` aquí mismo.

**Opciones**:
- **⭐ Recomendada — Mover side-effects globales a un `src/bootstrap.js`** y dejar `main.js` solo con el `new Phaser.Game(...)`. Hoy `main.js` mezcla "arranque" con "lógica del juego" (el handler de `first-vision` no es boot, es game logic). Cuesta nada, ordena.
- Hacer un `loadConfig.json` con la lista de escenas y leerlo en `main.js`. Útil si queremos varias builds (demo / completa), exagerado para esto.
- Usar el patrón "scene packs" de Phaser (`scene.add(key, sceneClass, autoStart, data)`). Ya lo hacemos parcial; podríamos cargar packs dinámicamente por acto.

**Razón**: la primera es atomización pura sin coste. Las otras 2 son refactors que se justifican cuando exista el sistema de actos.

---

### 2. Estado global — `src/state.js` + `game.registry`

**Cómo está**: `defaultState()` devuelve un objeto, `applyState`/`snapshotState` mueven todo entre registry y disco.

**Opciones**:
- **⭐ Recomendada — Separar "datos del jugador" (mutable, viaja con la partida) de "datos del juego" (catálogo, inmutable)**. Hoy el party tiene los specs de sprite EN EL ESTADO, así que si edito el sprite del protagonista necesito tocar la partida guardada. Mejor: estado solo guarda ids, los specs viven en `src/data/characters.js`.
- Reemplazar `registry` por un store tipo Zustand (~1 KB minified). Subscripción reactiva → menos refreshes manuales en escenas. Pero meto una dependencia.
- Inmutabilidad estricta (`Object.freeze` + funciones puras tipo Redux reducer). Más disciplina, menos bugs por mutación cruzada. Sobrante en este tamaño.

**Razón**: hoy el sprite del protagonista en la partida guardada de hace 3 meses no se actualiza si rediseñamos el personaje. Separar catálogo de partida es la base para que las partidas viejas sigan funcionando.

---

### 3. Eventos — `src/events.js`

**Cómo está**: `EventBus` casero con `on/off/emit`, instancia única en registry.

**Opciones**:
- **⭐ Recomendada — Mantenerlo, pero documentar los eventos en un único sitio (`src/events.js` exporta un objeto `EVENTS = { firstVision: 'first-vision', ... }`)**. Hoy los nombres de eventos son strings sueltos por todo el código — fácil hacer typo y silenciar el handler. Constantes nombradas + autocompletado.
- Reemplazar por `scene.events` o `game.events` (Phaser ya trae uno). Una pieza menos, pero pierdes que sea cross-escena sin pasar la referencia.
- Migrar a `mitt` (300 bytes, mismo API). Cero ventaja para nuestro tamaño.

**Razón**: el bug típico de pub/sub es escribir `'first-vison'` por accidente y que nada falle visiblemente. Constantes lo cortan en seco.

---

### 4. Carga de assets — `BootScene` + `ensureSprite` + `makeStaticTextures`

**Cómo está**:
- Retratos PNG: precargados en BootScene ✓
- Sprites de personaje: regenerados en cada arranque desde el spec via `ensureSprite`
- Tiles estáticas: repintadas en cada `RoomScene.create()` via `makeStaticTextures`

**Opciones**:
- **⭐ Recomendada — Política "generamos una vez, guardamos imagen, cargamos imagen"**. El generador queda como tooling (`tools/export-sprites.mjs`, ya hecho para sprites), y el juego solo hace `load.image('marta', 'assets/sprites/marta.png')`. Aplica también a tiles (exportar `tile.png`, `grass.png`, `ladder.png`, `shelf.png`, etc.). Ventajas: arranque más rápido (no se llenan texturas en runtime), sprites editables a mano después, los assets quedan versionados y diff-able en git.
- Atlas único (`assets/atlas.png` + `atlas.json` con frames). Phaser lo carga con `load.atlas`. Más compacto, una sola request HTTP. Necesita un atlas packer (TexturePacker, free-tex-packer).
- Sprite sheets (todos los frames de un personaje en una imagen). Solo útil cuando haya animaciones.

**Razón**: es exactamente lo que pediste — el generador permanece, el juego carga PNG. Es además la base para añadir animación (cuando un sprite tenga 4 frames de caminar, ya estará en disco).

---

### 5. Escena/sala — `RoomScene` + Aula/Biblioteca/Patio

**Cómo está**: `RoomScene` provee builders genéricos; cada sala los llama desde `buildRoom()`. Las salas con lógica (Aula con Nivea, Patio con Pablo) sobreescriben métodos.

**Opciones**:
- **⭐ Recomendada — Loader JSON → Phaser**. Que `RoomScene` reciba un JSON en `init()` (ya tenemos los JSONs en `assets/rooms/`). El JSON describe geometría + NPCs por id. Las "salas con lógica" siguen siendo subclases que solo añaden el `onTalk` específico (`Aula extends RoomScene { onLoad(){ super.onLoad('aula.json'); }; talkToNivea(){…} }`). Separa data de comportamiento, justo lo que pediste.
- Sistema "rooms = nodes" estilo Godot: cada elemento es un nodo con script propio. Más flexible, mucho más código.
- Mantenerlo como está (todo en código). Más simple pero no escala con número de salas.

**Razón**: el editor de habitaciones ya escupe el formato JSON correcto; conectarlo al loader cierra el ciclo "edito visualmente → corre en el juego sin tocar código".

---

### 6. Tilemap

**Cómo está**: no hay tilemap como tal. Cada plataforma se crea con `addPlatform(x, y, w, h, tex)`. El "mapa" es una lista de rectángulos.

**Opciones**:
- **⭐ Recomendada — Quedarnos así (lista de rectángulos en JSON)**. Para salas de 30×11 tiles, un tilemap formal es over-engineering. Lo que sí podemos hacer es **autodetectar suelos largos**: si hay 30 tiles seguidos en y=160, almacenar como `{x:0, y:160, w:30}` en vez de 30 entradas (ya lo hacemos en los JSONs actuales).
- Adoptar **Tiled** (editor + formato `.tmx/.json`) y `load.tilemapTiledJSON`. Estándar de la industria 2D. Curva de aprendizaje y meter Tiled como herramienta externa.
- Hacer un mini-tilemap propio en el editor (paint by hold-click). Bonito pero coste alto.

**Razón**: nuestras salas son pequeñas y no se repiten patrones complejos. Pagar por Tiled no compensa.

---

### 7. Físicas — `physics.add.staticGroup` (Arcade)

**Cómo está**: Arcade físicas para colisión jugador-plataforma. Climbs y NPCs son `staticGroup` que se solapan sin colisionar. Hack: cuerpo del jugador 2px más pequeño para que escaleras "muerdan".

**Opciones**:
- **⭐ Recomendada — Mantener Arcade pero documentar el contrato de cuerpos** (`SPRITE_W-4`, `SPRITE_H-2`, offset (2,1)). Hoy ese hack vive solo en `RoomScene.spawnPartyAndFollowers` con un comentario. Si lo aplico a NPCs también, climbing y empuje se hacen consistentes.
- Migrar a Matter (físicas con rotación / verlet). Innecesario para 2D side-scroller plano.
- Físicas a mano (AABB), sin Phaser physics. Más control pero rehacemos rueda.

**Razón**: Arcade está bien para este tipo de juego. Solo hace falta unificar el contrato de hitboxes.

---

### 8. Input — `keyboard.addKey` + `JustDown`

**Cómo está**: cada escena registra sus propias teclas. `addCapture('TAB')` para evitar que el navegador cambie de focus.

**Opciones**:
- **⭐ Recomendada — Centralizar bindings en `src/input.js`** (`KEYS = { action: 'E', menu: 'TAB', vision: 'MINUS', ... }`). Hoy si quiero cambiar [E] por [ENTER] hay que buscar en 6 archivos. Un módulo + uso uniforme = remappable.
- Soporte gamepad nativo (`navigator.getGamepads`). +200 LOC, deseable cuando el juego esté maduro.
- Combos / chord (Ctrl+S para guardar dentro del menú, etc.). Útil para la versión "PC".

**Razón**: remappeo de teclas es feature básica que el usuario espera (sobre todo si queremos accesibilidad).

---

### 9. Diálogo — `DialogueScene`

**Cómo está**: Phaser scene como overlay, retrato + caja de texto + avance con [E]. Speakers con color (`SPEAKER_COLORS`). Soporta multi-voz (`{speaker, text}[]`).

**Opciones**:
- **⭐ Recomendada — Mover diálogo a HTML/CSS** (DOM encima del canvas). Razones:
  - Tipografía web > tipografía Phaser (anti-aliasing real, mejor legibilidad)
  - Animaciones CSS (typing, bocadillo entrando) sin código
  - Layout responsive (en móvil el cuadro de diálogo puede ocupar la mitad inferior real)
  - Tipo Undertale / OneShot — funcionan así y se ven mejor
  - Phaser sigue corriendo, solo se pausa la sala (`scene.pause`); el HTML escucha al EventBus.
- Mantener canvas pero añadir `typewriter effect` (letra a letra). Más Earthbound.
- BBCode rich text (negritas, colores inline). Phaser no lo soporta nativo; necesitas RexUI plugin.

**Razón**: cada vez que añades un diálogo notas que el render es pobre. Pasar a HTML lo arregla y nos da margen para hacer el "foro del Club" como un chat real (Discord-style). Es además la palanca del estilo visual idea #3 que comentamos antes.

---

### 10. Foro — `ForumScene`

**Cómo está**: simula un chat dentro del canvas con scroll automático.

**Opciones**:
- **⭐ Recomendada — HTML real**. Por las mismas razones que diálogo. Bonus: scroll del navegador, animación de "está escribiendo...", emojis Unicode reales.
- Sustituir el faux-chat por un terminal pixel (estilo OneShot). Estético.
- Quedarse como está. Funciona, lo que pasa es que se ve modesto.

---

### 11. Menú — `MenuScene`

**Cómo está**: pestañas (Inventario/Personaje/Habilidades/Equipo) navegables con ←→. Retrato Picrew + stats en Personaje.

**Opciones**:
- **⭐ Recomendada — HTML grid**. Inventario como `<ul>` con `flexbox`, retratos como `<img>` a tamaño real (los Picrew son 600×600, hoy los escalamos brutamente). Estilo Undertale (texto + sprite con marco simple). Pausamos Phaser.
- Mantener canvas pero modernizar fuente y layout. Mejora discreta.
- Menú radial (rueda en torno al protagonista). Estético, pero un coñazo para 4 pestañas.

---

### 12. Combate — `CombatScene`

**Cómo está**: FSM con estados `ROOT | SKILLS | ITEMS | MSG | ENEMY | END | DIALOG`. Mecánica especial de Pablo dentro del mismo archivo.

**Opciones**:
- **⭐ Recomendada — Separar engine de mecánicas especiales**:
  - `src/systems/combat-engine.js` — FSM + turn order + damage formula (puro, testeable)
  - `src/systems/combat-hooks.js` — registra mecánicas por enemigo id (`pablo: { onTalk: ... }`)
  - `CombatScene` solo renderiza + delega
  Razón: cuando llegue el libro poseído (que ya tiene `dialogue` pero no mecánica) y futuros enemigos con cosas raras, no queremos `if (enemy.id === 'pablo') ... else if (enemy.id === 'libro') ...` dentro de CombatScene.
- Sistema "card-based" estilo Slay the Spire (cada habilidad es una carta, mano limitada). Cambia el género del juego, no procede.
- Earthbound "rolling HP counter" (los PV bajan despacio y puedes ganar si curas antes de llegar a 0). Mecánica icónica, gratis de implementar si separamos engine, +textura narrativa.

**Razón**: separar engine de hooks es la única manera sostenible de añadir más enemigos sin que CombatScene crezca a 1000 LOC. El rolling HP de Earthbound entraría natural cuando exista.

---

### 13. Sprites de personaje — `src/sprite-defs.js`

**Cómo está**: drawers monolíticos por personaje (`drawDinoHoodProta` hace capucha + pelo + cara + rayas, todo a una). Recompones colores (hair/skin/shirt/pants) pero no items.

**Opciones**:
- **⭐ Recomendada — Estilo Picrew (items componibles)**. Cada drawer actual se descompone en items atómicos: `hood_dino_green`, `hair_short`, `eyes_default`, `mouth_default`, `shirt_striped`, etc. Un personaje = `{ items: {hood:'dino', hair:'short', ...}, colors: {hair:0x..., ...} }`. El editor presenta un picker por slot, como Picrew. Razones:
  - Combinatoria: 13 personajes × dirigidos hoy → infinitos posibles
  - Permite a NPCs nuevos sin código nuevo
  - Es lo que pediste explícitamente
  - El usuario final del editor no programa: elige items
- Sprite sheets dibujados a mano (cuando los sprites pixel definitivos lleguen, sustituir los generados). Coexiste con la opción 1.
- Generación procedural pura (estilo Spelunky enemies). Sin estilo definido, mal encaje.

**Razón**: es la pieza que más palanca da hacia el resto del proyecto. Lo abordamos en el próximo commit.

---

### 14. Modo visión / lifespan

**Cómo está**: postFX sepia + label "Xs" sobre cada NPC. Side-effect de Lucas muriendo al primer toggle.

**Opciones**:
- **⭐ Recomendada — Conservar tal cual y extender con "tipos de visión"**. La pieza está bien: efecto visual + revelación narrativa. Lo que falta es escalabilidad: si añadimos otra "visión" (rayos X, modo aura), hoy tendríamos `if/else`. Refactor a un sistema de "lentes" (cada lente = postFX + función `revealInfo(npc)`). Plugin-able.
- Inversión + glitch tipo Undertale-Sans (chromatic aberration). Estético.
- Eliminar el modo visión. La feature distintiva del juego — no.

**Razón**: la mecánica funciona pero el código no anticipa más lentes. Generalizar ahora cuesta poco.

---

### 15. Guardado / carga

**Cómo está**: JSON descarga / `<input type="file">` carga. Sin slots, sin autosave.

**Opciones**:
- **⭐ Recomendada — Añadir autosave en `localStorage`** (sin tocar el guardado JSON descargable). En el menú, "Continuar" lee localStorage; "Guardar partida" sigue siendo el JSON descargable para backup. Un único save automático que se actualiza al cambiar de sala / al final de combate. Cero fricción.
- Slots manuales (3 huecos en localStorage). Más complejo, no aporta tanto en una demo.
- Save anywhere estilo Undertale (cualquier momento, una sola partida en disco). Ya lo hacemos esencialmente.

**Razón**: el flujo actual (descargar archivo, subirlo de vuelta) es un coñazo para playtesting. Autosave silencioso lo arregla sin quitar el descargable.

---

### 16. Aspecto visual general

**Cómo está**: pixel art generado, paleta limitada, tipografía Phaser monoespaciada. Como bien notaste — se queda algo pobre.

**Opciones (las 3 que te propuse antes, ahora con +contexto)**:
- **⭐ Recomendada — CRT/scanlines + HTML overlays para diálogo y menú**. Mínimo coste, máximo carácter, y nos permite mejorar tipografía y layout sin reescribir Phaser. Encaja con el tono "ocultista escolar 90s/2000s".
- Fondos PNG ilustrados con paralax (sprites pixel sobre fondo no-pixel). Más trabajo (un fondo por sala) pero mucho impacto visual. Estilo "Lisa: The Painful".
- Pasar a 32×48 px en sprites + más detalle en cada uno. Mantiene el look, multiplica el coste de cada nuevo personaje x4.

**Razón**: CRT + HTML te da el cambio de impresión gratis. Los fondos PNG llegan después; los sprites a 32×48 son para cuando el juego esté validado.

---

## Lo que estos juegos hicieron bien y podríamos robar

### Earthbound
- **Rolling HP counter**: tus PV bajan despacio (1 por frame). Si te curas antes de llegar a 0, sobrevives un golpe letal. Mecánica fácil de implementar si el combate está atomizado, añade tensión gratis.
- **Fondos psicodélicos animados** en combate. Hoy nuestro combate tiene un fondo plano `#101018`. Un PNG con gradiente animado + distorsión sutil cambia la sensación entera.
- **NPCs random secundarios con un solo chiste**. Ya lo hacemos (Marta, Dani, Iván, Sofía). Mantener esa densidad cuando llegue el Acto 2.

### Undertale
- **Sprite + face cut en diálogo**. Lo hacemos. ✓
- **Save anywhere + 1 slot**. Casi lo hacemos.
- **El menú es texto puro sobre fondo negro**. Estética minimalista, fácil de implementar.
- **Bullet hell en combate** (la pequeña área donde esquivas). NO encaja con elteto — somos un RPG por turnos sin acción, mantener.

### Lisa: The Painful
- **Side-scroller con party de freaks**. ¡Es básicamente nosotros! Lo bordan visualmente porque cada sprite está hecho a mano sobre fondos pintados.
- **Combate brutal + permadeath de party**. Demasiado oscuro para nuestro tono escolar.

### OneShot
- **Rompe el canvas** — diálogos como popups del SO, archivos del juego que aparecen en tu escritorio real. Es difícil pero memorable. Nosotros tenemos el "modo visión" que va por ese camino narrativo (revela cosas ocultas) — extender vía DOM real es posible.

---

## Conclusión: por dónde tirar

Orden propuesto, de menor coste a mayor:

1. **Política de assets pre-generados** (`makeStaticTextures` → PNG; `ensureSprite` → load). [Próximo commit en esta sesión]
2. **Centralizar personajes** en `src/data/characters.js`. [Próximo commit en esta sesión]
3. **Editor de personajes estilo Picrew** (items componibles). [Próximo commit en esta sesión]
4. **HTML overlays para diálogo/menú/foro** + CRT scanlines en el wrapper. [Siguiente conversación]
5. **Loader JSON → RoomScene** (cerrar el ciclo del editor de salas). [Siguiente conversación]
6. **Separar combat engine de hooks** + rolling HP. [Cuando se añada el libro poseído]
7. **Sistema de actos** (`src/acts/actN.js`). [Cuando se planifique el Acto 2]
