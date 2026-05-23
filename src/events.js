// Pub/sub muy simple. Una sola instancia compartida en game.registry.
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const set = this.listeners.get(event);
    if (set) set.delete(fn);
  }

  emit(event, ...args) {
    const set = this.listeners.get(event);
    if (!set) return;
    // Copia para permitir off() durante la emisión
    [...set].forEach(fn => {
      try { fn(...args); } catch (e) { console.error(`[events] handler de "${event}" ha petado:`, e); }
    });
  }

  clear() {
    this.listeners.clear();
  }
}

// Helper para que cualquier escena acceda al bus desde this.registry
export function bus(registry) {
  return registry.get('events');
}
