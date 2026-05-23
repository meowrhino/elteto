import { snapshotState, applyState } from './state.js';

export function setupSaveUI(game) {
  const btnSave = document.getElementById('btn-save');
  const btnLoad = document.getElementById('btn-load');
  const fileInput = document.getElementById('file-input');

  btnSave.addEventListener('click', () => {
    const data = {
      version: 1,
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
      // Detener todas las escenas activas y arrancar la guardada
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
}
