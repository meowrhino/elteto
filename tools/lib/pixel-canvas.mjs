// "Canvas" mínimo compatible con la interfaz de drawing usada por los drawers
// (g.fillStyle(intColor).fillRect(x,y,w,h)). El color es 0xRRGGBB.
// Pinta sobre un buffer RGBA. Las pinturas fuera de bounds se ignoran.

export class PixelCanvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buf = new Uint8Array(w * h * 4); // RGBA, todo 0 (transparente)
    this.color = [0, 0, 0, 255];
  }

  fillStyle(color) {
    this.color[0] = (color >> 16) & 0xff;
    this.color[1] = (color >> 8) & 0xff;
    this.color[2] = color & 0xff;
    this.color[3] = 255;
    return this;
  }

  fillRect(x, y, w, h) {
    x = x | 0; y = y | 0; w = w | 0; h = h | 0;
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(this.w, x + w);
    const y1 = Math.min(this.h, y + h);
    const [r, gC, b, a] = this.color;
    for (let py = y0; py < y1; py++) {
      for (let px = x0; px < x1; px++) {
        const idx = (py * this.w + px) * 4;
        this.buf[idx] = r;
        this.buf[idx + 1] = gC;
        this.buf[idx + 2] = b;
        this.buf[idx + 3] = a;
      }
    }
    return this;
  }

  // Círculo relleno aproximado por bucle sobre bounding box. Misma firma
  // que Phaser.Graphics.fillCircle(cx, cy, r) — el centro es (cx, cy)
  // en lugar de la esquina superior izquierda como en fillRect.
  fillCircle(cx, cy, radius) {
    cx = cx | 0; cy = cy | 0;
    const r2 = radius * radius;
    const x0 = Math.max(0, cx - radius);
    const y0 = Math.max(0, cy - radius);
    const x1 = Math.min(this.w, cx + radius + 1);
    const y1 = Math.min(this.h, cy + radius + 1);
    const [r, gC, b, a] = this.color;
    for (let py = y0; py < y1; py++) {
      const dy = py - cy;
      for (let px = x0; px < x1; px++) {
        const dx = px - cx;
        if (dx * dx + dy * dy <= r2) {
          const idx = (py * this.w + px) * 4;
          this.buf[idx] = r;
          this.buf[idx + 1] = gC;
          this.buf[idx + 2] = b;
          this.buf[idx + 3] = a;
        }
      }
    }
    return this;
  }
}
