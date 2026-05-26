// Sistema de audio del juego.
//
// Tres canales mezclables: bgm (música), sfx (efectos), voice (babble de
// diálogos). Cada uno con volumen 0-10. Adicionalmente un master 0-10.
//
// Por defecto el master está muteado (mantenemos el control en manos del
// usuario hasta que decida activarlo). Los sliders están en index.html y
// se sincronizan con localStorage para persistir entre sesiones.
//
// Las voces babble se sintetizan con Web Audio (osciladores cortos por
// carácter), no requieren archivos. Los SFX y BGM por ahora también son
// sintéticos; cuando se sustituyan por archivos, solo cambia playSfx/playBgm.

const STORAGE_KEY = 'elteto-audio-volumes';

// Volúmenes iniciales (todo a 0 = muteado). Si hay valores guardados en
// localStorage los respetamos.
function loadVolumes() {
  const defaults = { master: 0, bgm: 5, sfx: 7, voice: 6 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function saveVolumes(volumes) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes)); } catch {}
}

export class AudioBus {
  constructor() {
    this.volumes = loadVolumes();
    this.ctx = null; // se crea perezosamente tras un gesto del usuario
    this.bgmNode = null;
    this.bgmOsc = null;
    this.listeners = new Set();
  }

  // Crear AudioContext perezosamente (autoplay policy de los navegadores).
  ensureContext() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    return this.ctx;
  }

  // Convierte 0-10 a 0-1 con curva ligeramente exponencial (los humanos
  // perciben volumen logarítmicamente).
  gainOf(channel) {
    const v = (this.volumes[channel] ?? 0) / 10;
    const m = (this.volumes.master ?? 0) / 10;
    return Math.pow(v * m, 1.6);
  }

  setVolume(channel, value) {
    this.volumes[channel] = Math.max(0, Math.min(10, value));
    saveVolumes(this.volumes);
    this.notify();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  notify() {
    for (const fn of this.listeners) fn(this.volumes);
  }

  // ============================================================ SFX
  // Sintetiza un beep corto. preset = 'confirm' | 'cancel' | 'hit' | 'door' | 'step'
  playSfx(preset) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const gain = this.gainOf('sfx');
    if (gain === 0) return;

    const presets = {
      confirm: { freq: 880, type: 'square', attack: 0.005, release: 0.08 },
      cancel:  { freq: 220, type: 'square', attack: 0.005, release: 0.12 },
      hit:     { freq: 110, type: 'sawtooth', attack: 0.005, release: 0.18 },
      door:    { freq: 320, type: 'sine', attack: 0.01, release: 0.25 },
      step:    { freq: 90, type: 'triangle', attack: 0.003, release: 0.05 },
    };
    const p = presets[preset] || presets.confirm;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = p.freq;
    osc.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain * 0.5, now + p.attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + p.attack + p.release);
    osc.start(now);
    osc.stop(now + p.attack + p.release + 0.02);
  }

  // ============================================================ Voces babble
  // Sintetiza un sonido corto que simula "una sílaba" para acompañar un
  // diálogo. Usa el voiceConfig del personaje para personalizar.
  //
  // voiceConfig: { baseFreq, type, jitter, attack, release }
  playVoiceTick(voiceConfig = {}) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const gain = this.gainOf('voice');
    if (gain === 0) return;

    const base = voiceConfig.baseFreq ?? 280;
    const type = voiceConfig.type ?? 'square';
    const jitter = voiceConfig.jitter ?? 30;
    const attack = voiceConfig.attack ?? 0.005;
    const release = voiceConfig.release ?? 0.06;

    const freq = base + (Math.random() * 2 - 1) * jitter;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain * 0.25, now + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, now + attack + release);
    osc.start(now);
    osc.stop(now + attack + release + 0.01);
  }

  // ============================================================ BGM
  // BGM con varias "capas": drone grave + pad medio + opcional LFO + ruido.
  // Cuando se quiera meter archivos CC0 reales, basta con sustituir este
  // método (BGM_PRESETS define qué se reproduce por sala).
  playBgm(preset = 'aula') {
    if (this.currentBgm === preset) return; // ya está sonando
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.stopBgm();
    this.currentBgm = preset;
    const gain = this.gainOf('bgm');
    if (gain === 0) return;

    const cfg = BGM_PRESETS[preset] || BGM_PRESETS.aula;
    const master = ctx.createGain();
    master.gain.value = gain * 0.06; // baja el nivel general
    master.connect(ctx.destination);

    const nodes = [];
    const oscs = [];

    // Drone grave (bajo)
    if (cfg.bass) {
      const o = ctx.createOscillator();
      o.type = cfg.bass.type || 'sine';
      o.frequency.value = cfg.bass.freq;
      const g = ctx.createGain();
      g.gain.value = cfg.bass.gain ?? 0.7;
      o.connect(g).connect(master);
      o.start();
      oscs.push(o); nodes.push(g);
    }

    // Pad medio (otro oscilador con detune)
    if (cfg.pad) {
      for (let i = 0; i < (cfg.pad.voices || 2); i++) {
        const o = ctx.createOscillator();
        o.type = cfg.pad.type || 'triangle';
        o.frequency.value = cfg.pad.freq;
        o.detune.value = (i - 0.5) * (cfg.pad.detune ?? 6);
        const g = ctx.createGain();
        g.gain.value = (cfg.pad.gain ?? 0.4) / (cfg.pad.voices || 2);
        o.connect(g).connect(master);
        o.start();
        oscs.push(o); nodes.push(g);
      }
    }

    // LFO opcional: modula el volumen del master sutilmente para que respire
    if (cfg.lfo) {
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = cfg.lfo.rate ?? 0.2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = (cfg.lfo.depth ?? 0.02) * gain;
      lfo.connect(lfoGain).connect(master.gain);
      lfo.start();
      oscs.push(lfo); nodes.push(lfoGain);
    }

    this.bgmNode = master;
    this.bgmOsc = oscs;
    this.bgmNodes = nodes;
  }

  stopBgm() {
    if (this.bgmOsc) {
      for (const o of this.bgmOsc) { try { o.stop(); } catch {} }
      this.bgmOsc = null;
    }
    if (this.bgmNode) { try { this.bgmNode.disconnect(); } catch {} ; this.bgmNode = null; }
    if (this.bgmNodes) {
      for (const n of this.bgmNodes) { try { n.disconnect(); } catch {} }
      this.bgmNodes = null;
    }
    this.currentBgm = null;
  }
}

// Presets de BGM por sala. Cada preset combina bass + pad + lfo. El
// resultado son drones más ricos que el drone único anterior, sin ser
// música de verdad. Cuando se sustituyan por archivos CC0, basta con
// reemplazar playBgm() conservando la API (playBgm(preset)).
export const BGM_PRESETS = {
  aula: {
    bass: { freq: 110, type: 'sine', gain: 0.6 },
    pad:  { freq: 220, type: 'triangle', voices: 2, detune: 10, gain: 0.4 },
    lfo:  { rate: 0.18, depth: 0.015 },
  },
  biblioteca: {
    bass: { freq: 73, type: 'sine', gain: 0.7 },
    pad:  { freq: 174, type: 'triangle', voices: 3, detune: 14, gain: 0.35 },
    lfo:  { rate: 0.12, depth: 0.018 },
  },
  patio: {
    bass: { freq: 196, type: 'triangle', gain: 0.4 },
    pad:  { freq: 392, type: 'sine', voices: 2, detune: 5, gain: 0.3 },
    lfo:  { rate: 0.4, depth: 0.025 },
  },
  pasillo: {
    bass: { freq: 87, type: 'sine', gain: 0.6 },
    pad:  { freq: 220, type: 'sine', voices: 2, detune: 7, gain: 0.3 },
    lfo:  { rate: 0.15, depth: 0.012 },
  },
  comedor: {
    bass: { freq: 130, type: 'triangle', gain: 0.5 },
    pad:  { freq: 261, type: 'triangle', voices: 2, detune: 8, gain: 0.35 },
    lfo:  { rate: 0.22, depth: 0.018 },
  },
  gimnasio: {
    bass: { freq: 165, type: 'sawtooth', gain: 0.35 },
    pad:  { freq: 330, type: 'square', voices: 2, detune: 12, gain: 0.25 },
    lfo:  { rate: 0.35, depth: 0.03 },
  },
  aula_musica: {
    bass: { freq: 98, type: 'sine', gain: 0.6 },
    pad:  { freq: 196, type: 'triangle', voices: 3, detune: 16, gain: 0.4 },
    lfo:  { rate: 0.2, depth: 0.02 },
  },
  salon_actos: {
    bass: { freq: 65, type: 'sine', gain: 0.8 },
    pad:  { freq: 196, type: 'sawtooth', voices: 2, detune: 18, gain: 0.3 },
    lfo:  { rate: 0.1, depth: 0.025 },
  },
  azotea: {
    bass: { freq: 220, type: 'sine', gain: 0.4 },
    pad:  { freq: 440, type: 'sine', voices: 2, detune: 4, gain: 0.25 },
    lfo:  { rate: 0.5, depth: 0.02 },
  },
  sotano: {
    bass: { freq: 55, type: 'sine', gain: 0.9 },
    pad:  { freq: 110, type: 'sine', voices: 2, detune: 20, gain: 0.4 },
    lfo:  { rate: 0.08, depth: 0.03 },
  },
  cuarto_prota: {
    bass: { freq: 87, type: 'sine', gain: 0.55 },
    pad:  { freq: 261, type: 'triangle', voices: 2, detune: 8, gain: 0.4 },
    lfo:  { rate: 0.15, depth: 0.018 },
  },
  sueno_pablo: {
    bass: { freq: 41, type: 'sine', gain: 1.0 },
    pad:  { freq: 87, type: 'sawtooth', voices: 3, detune: 30, gain: 0.35 },
    lfo:  { rate: 0.06, depth: 0.05 },
  },
  astral: {
    bass: { freq: 261, type: 'sine', gain: 0.3 },
    pad:  { freq: 523, type: 'sine', voices: 3, detune: 10, gain: 0.3 },
    lfo:  { rate: 0.6, depth: 0.04 },
  },
  combat: {
    bass: { freq: 73, type: 'sawtooth', gain: 0.5 },
    pad:  { freq: 220, type: 'square', voices: 2, detune: 14, gain: 0.25 },
    lfo:  { rate: 1.5, depth: 0.04 },
  },
};

// Instancia singleton del bus de audio.
export const audio = new AudioBus();

// Catálogo de voces por NPC. Cada uno tiene su pitch y timbre.
export const VOICES = {
  nivea:     { baseFreq: 360, type: 'sine',     jitter: 25, attack: 0.005, release: 0.08 },
  marta:     { baseFreq: 420, type: 'triangle', jitter: 40, attack: 0.004, release: 0.06 },
  dani:      { baseFreq: 240, type: 'square',   jitter: 50, attack: 0.004, release: 0.05 },
  lucas:     { baseFreq: 200, type: 'sine',     jitter: 15, attack: 0.008, release: 0.12 },
  martina:   { baseFreq: 320, type: 'triangle', jitter: 30, attack: 0.005, release: 0.07 },
  lector:    { baseFreq: 460, type: 'sine',     jitter: 35, attack: 0.004, release: 0.05 },
  ivan:      { baseFreq: 280, type: 'square',   jitter: 45, attack: 0.004, release: 0.06 },
  sofia:     { baseFreq: 380, type: 'triangle', jitter: 40, attack: 0.005, release: 0.06 },
  clara:     { baseFreq: 440, type: 'sine',     jitter: 30, attack: 0.005, release: 0.07 },
  pablo:     { baseFreq: 140, type: 'sawtooth', jitter: 60, attack: 0.006, release: 0.18 },
  pablo_npc: { baseFreq: 140, type: 'sawtooth', jitter: 60, attack: 0.006, release: 0.18 },
  protag:    { baseFreq: 300, type: 'square',   jitter: 20, attack: 0.005, release: 0.06 },
  default:   { baseFreq: 280, type: 'square',   jitter: 30, attack: 0.005, release: 0.06 },
};

// Devuelve el config de voz para un speaker (id o nombre legible).
export function voiceFor(speaker) {
  if (!speaker) return VOICES.default;
  // Buscar por nombre legible (los diálogos vienen con 'Marta', 'Nivea'...)
  const lower = String(speaker).toLowerCase();
  const aliases = {
    'tú': 'protag',
    'profesora': 'nivea',
    'bibliotecaria': 'martina',
    'bárbara': 'default',
    'jorge': 'dani',
    'anillo': 'lector',
    '—': 'default',
  };
  const key = aliases[lower] || lower;
  return VOICES[key] || VOICES.default;
}
