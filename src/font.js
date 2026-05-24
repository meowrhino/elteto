// Fuente del juego. Press Start 2P es una bitmap font 8px clásica
// (cargada via Google Fonts en index.html). Cae a monospace si no carga.
//
// Por qué un helper: para que todo el juego use la misma familia
// sin repetir el string en 30 sitios.

export const PIXEL_FONT = '"Press Start 2P", "Courier New", monospace';

// Helper para construir un objeto de estilo de Phaser.Text con la fuente
// pixel preconfigurada. opts sobreescribe lo que necesites.
//
// Ejemplo:
//   this.add.text(x, y, 'hola', textStyle({ color: '#fff', fontSize: '8px' }));
export function textStyle(opts = {}) {
  return {
    fontFamily: PIXEL_FONT,
    fontSize: '8px',
    color: '#ffffff',
    resolution: 2,
    ...opts,
  };
}

// Espera a que la fuente esté cargada antes de continuar.
// Evita que el primer frame muestre la fuente fallback.
export function whenPixelFontReady() {
  if (!document.fonts || !document.fonts.load) {
    return Promise.resolve();
  }
  return document.fonts.load('8px "Press Start 2P"').then(() => {});
}
