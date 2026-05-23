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
├── characters.js        ← factory de sprites 16×24 (estilos por personaje)
├── events.js            ← EventBus pub/sub compartido
├── story.js             ← capítulos / progresión
├── save.js              ← guardar y cargar partida (JSON descargable)
└── scenes/
    ├── RoomScene.js     ← base de cualquier sala (input, físicas, NPCs, visión)
    ├── Aula.js          ← clase: profesora, alumnos, Lucas
    ├── Biblioteca.js    ← libro poseído, bibliotecaria, lector
    ├── Patio.js         ← Pablo (NPC o enemigo según capítulo), niños
    ├── DialogueScene.js ← overlay de diálogo (mono o multi-speaker)
    ├── ForumScene.js    ← overlay tipo chat para reuniones del Club
    ├── MenuScene.js     ← menú con tabs y tarjetas de personaje
    └── CombatScene.js   ← combate por turnos (con mecánica especial para Pablo)
```

## Personajes

- **Tú (Protagonista)** — un protagonista vacío que intenta tomar las decisiones correctas. Cabello rubio rizado, suéter negro.
- **Jorge** — miembro del Club. Tiene tourette, sus aportaciones tienden al absurdo. Capucha de dinosaurio verde.
- **Bárbara** — miembro del Club. El cerebro. Pelo bob blanco arriba / morado abajo, hoodie negro.
- **Pablo** — el bully. Lleva días repitiendo la misma frase. Pelo morado corto, mostacho, chupa de cuero (próximamente).
- **Nivea (profesora)** — está rallada con Pablo. Pelirroja con gafas, jersey verde.
- **Martina (bibliotecaria), niño lector, Lucas, Marta, Dani, Sofía, Iván, Clara** — secundarios.

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

Los **retratos** de los personajes (las imágenes detalladas que se ven en el menú y en los diálogos) están hechos con [Picrew — Image Maker by Nuggts](https://picrew.me/ja/image_maker/1868017). Viven en `perosnajes/`.

Los **sprites in-world** (los muñequitos 16×24 que ves moverse en las salas) son pixel art generado programáticamente desde [`src/characters.js`](src/characters.js) intentando evocar esos retratos.

Cuando los sprites pixel definitivos estén hechos, se sustituirán y se dará crédito apropiado en este README y en los créditos del juego. Por ahora estamos en pruebas.

## Stack

- [Phaser 3.80.1](https://phaser.io/) (vía CDN, sin build)
- Vanilla JS + ES modules
- Sin dependencias de runtime

## Roadmap inmediato

- Sustituir sprites programáticos por pixel art real
- Más capítulos (el libro poseído ya está esperando)
- Sistema de "preguntas con respuesta falsa" (el protagonista vacío toma la decisión contraria)
- Combate en grupo (Jorge y Bárbara con turnos propios)
