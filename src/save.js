import { snapshotState, applyState } from './state.js';
import { getChapterNode } from './story.js';

// Sistema de saves: 3 slots manuales + 1 autosave, todos en localStorage.
// El export/import a archivo se mantiene como funcionalidad extra para
// portar partidas entre dispositivos.

const SLOT_KEYS = {
  1: 'elteto-save-1',
  2: 'elteto-save-2',
  3: 'elteto-save-3',
  auto: 'elteto-save-auto',
};

export function saveToSlot(game, slot) {
  const data = {
    version: 2,
    slot,
    savedAt: new Date().toISOString(),
    state: snapshotState(game.registry),
  };
  // Metadatos amigables para preview en UI
  const node = getChapterNode(game.registry);
  data.preview = {
    scene: data.state.player?.scene || 'Aula',
    chapter: node ? node.title : '?',
    storyId: node ? node.id : '?',
  };
  try {
    localStorage.setItem(SLOT_KEYS[slot], JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('saveToSlot failed', e);
    return false;
  }
}

export function loadFromSlot(game, slot) {
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot]);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.state || !data.state.player) throw new Error('formato inválido');
    applyState(game.registry, data.state);
    game.scene.scenes.forEach((s) => {
      if (game.scene.isActive(s.scene.key)) game.scene.stop(s.scene.key);
    });
    game.scene.start(data.state.player.scene);
    return true;
  } catch (e) {
    console.error('loadFromSlot failed', e);
    return false;
  }
}

export function previewSlot(slot) {
  try {
    const raw = localStorage.getItem(SLOT_KEYS[slot]);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      savedAt: data.savedAt,
      scene: data.preview?.scene,
      chapter: data.preview?.chapter,
    };
  } catch {
    return null;
  }
}

export function setupSaveUI(game) {
  const btnSave = document.getElementById('btn-save');
  const btnLoad = document.getElementById('btn-load');
  const fileInput = document.getElementById('file-input');

  // Botón principal: descarga archivo (legacy).
  btnSave.addEventListener('click', () => {
    const data = {
      version: 2,
      savedAt: new Date().toISOString(),
      state: snapshotState(game.registry),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `elteto-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  btnLoad.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.state || !data.state.player) throw new Error('formato inválido');
      applyState(game.registry, data.state);
      game.scene.scenes.forEach((s) => {
        if (game.scene.isActive(s.scene.key)) game.scene.stop(s.scene.key);
      });
      game.scene.start(data.state.player.scene);
    } catch (err) {
      alert('Archivo de partida inválido');
      console.error(err);
    }
    fileInput.value = '';
  });

  // ============================================================ slots UI
  // Los slots se renderizan dinámicamente bajo los botones legacy.
  const slotsContainer = document.getElementById('slots');
  if (slotsContainer) {
    function render() {
      slotsContainer.innerHTML = '';
      for (const slot of [1, 2, 3, 'auto']) {
        const preview = previewSlot(slot);
        const label = slot === 'auto' ? 'Auto' : `Slot ${slot}`;
        const info = preview
          ? `${preview.scene} · ${preview.chapter}`
          : 'vacío';

        const row = document.createElement('div');
        row.className = 'slot-row';
        row.innerHTML = `<span class="slot-label">${label}</span><span class="slot-info">${info}</span>`;

        const save = document.createElement('button');
        save.textContent = 'Guardar';
        save.disabled = slot === 'auto';
        save.addEventListener('click', () => {
          if (saveToSlot(game, slot)) render();
        });
        row.appendChild(save);

        const load = document.createElement('button');
        load.textContent = 'Cargar';
        load.disabled = !preview;
        load.addEventListener('click', () => loadFromSlot(game, slot));
        row.appendChild(load);

        slotsContainer.appendChild(row);
      }
    }
    render();

    // Autosave global: cualquier cambio de sala o capítulo se replica
    // al slot 'auto'. Suscrito al registry de Phaser. Throttle de 1s
    // para no spamear cuando se actualizan múltiples flags consecutivos.
    let lastAutosave = 0;
    game.registry.events.on('changedata', (_, key) => {
      if (key === 'player' || key === 'flags') {
        const now = Date.now();
        if (now - lastAutosave < 800) return;
        lastAutosave = now;
        saveToSlot(game, 'auto');
        render();
        showAutosaveToast(game);
      }
    });
  }
}

// Toast discreto "guardado" en la esquina superior derecha de la escena
// activa. Aparece 1s y desaparece. No pretende ser intrusivo.
function showAutosaveToast(game) {
  const active = game.scene.getScenes(true)[0];
  if (!active) return;
  const W = active.scale.width;
  const text = active.add.text(W - 6, 4, '✓ guardado', {
    fontFamily: '"Press Start 2P", monospace', fontSize: '7px',
    color: '#88ff88',
  }).setOrigin(1, 0).setDepth(9998).setScrollFactor(0).setAlpha(0);
  active.tweens.add({
    targets: text,
    alpha: { from: 0, to: 1 },
    duration: 200,
    yoyo: true,
    hold: 700,
    onComplete: () => text.destroy(),
  });
}
