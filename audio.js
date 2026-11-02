// ==========================================================
// Web Audio API Synthesizer - 8-Bit Retro Chiptune & FX
// Inspired by Danny Phantom theme and retro game sounds
// ==========================================================

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  playTone(freq, type = 'square', duration = 0.1, startTime = 0, gainVal = 0.2) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // Sound Effect: Dialogue blip
  playDialogueBlip(pitch = 380) {
    if (!this.ctx || this.isMuted) return;
    this.playTone(pitch, 'triangle', 0.04, 0, 0.15);
  }

  // Sound Effect: Interact chime
  playInteract() {
    if (!this.ctx || this.isMuted) return;
    this.playTone(523.25, 'triangle', 0.08, 0, 0.2); // C5
    this.playTone(659.25, 'triangle', 0.08, 0.06, 0.2); // E5
    this.playTone(783.99, 'triangle', 0.12, 0.12, 0.25); // G5
  }

  // Sound Effect: Ghost Portal Hum
  playGhostPortal() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.6);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Sound Effect: Drink mixing / bubbling
  playBubbles() {
    if (!this.ctx || this.isMuted) return;
    for (let i = 0; i < 5; i++) {
      this.playTone(400 + Math.random() * 500, 'sine', 0.06, i * 0.07, 0.15);
    }
  }

  // Sound Effect: Box Ghost laugh / box pop
  playBoxPop() {
    if (!this.ctx || this.isMuted) return;
    this.playTone(220, 'square', 0.1, 0, 0.2);
    this.playTone(440, 'square', 0.1, 0.08, 0.25);
    this.playTone(330, 'square', 0.15, 0.16, 0.2);
  }

  // Sound Effect: Birthday Candles blow
  playCandlesBlow() {
    if (!this.ctx || this.isMuted) return;
    // White noise simulation for blowing wind
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(this.ctx.currentTime);

    // Chimes following
    setTimeout(() => {
      this.playTone(784, 'triangle', 0.2, 0, 0.2);
      this.playTone(1046, 'triangle', 0.25, 0.1, 0.25);
      this.playTone(1318, 'triangle', 0.4, 0.2, 0.3);
    }, 250);
  }

  // Sound Effect: Firework explosion
  playFirework() {
    if (!this.ctx || this.isMuted) return;
    this.playTone(120, 'sawtooth', 0.18, 0, 0.3);
    this.playTone(900 + Math.random() * 300, 'triangle', 0.2, 0.05, 0.2);
  }

  // 8-bit Danny Phantom motif + party groove background loop
  startBGM() {
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;

    // Danny Phantom iconic progression (D minor / G / C# mysterious ghost bass)
    // Notes in Hz
    const D3 = 146.83, F3 = 174.61, G3 = 196.00, Ab3 = 207.65, A3 = 220.00, C4 = 261.63, D4 = 293.66;
    const bassline = [
      { f: D3, d: 0.18 }, { f: D3, d: 0.18 }, { f: F3, d: 0.18 }, { f: G3, d: 0.22 },
      { f: Ab3, d: 0.18 }, { f: G3, d: 0.18 }, { f: F3, d: 0.18 }, { f: D3, d: 0.3 },
      { f: D3, d: 0.18 }, { f: F3, d: 0.18 }, { f: G3, d: 0.18 }, { f: C4, d: 0.25 },
      { f: D4, d: 0.3 }, { f: 0, d: 0.15 }
    ];

    let step = 0;
    const playNext = () => {
      if (!this.bgmPlaying) return;
      const note = bassline[step % bassline.length];
      if (note.f > 0) {
        this.playTone(note.f, 'sawtooth', note.d * 0.9, 0, 0.12);
        // High harmonic sparkle
        if (step % 4 === 0) {
          this.playTone(note.f * 3, 'sine', 0.08, 0.05, 0.05);
        }
      }
      step++;
      this.bgmTimer = setTimeout(playNext, note.d * 1000 * 1.3);
    };

    playNext();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // Play Celebration Fanfare
  playCelebrationFanfare() {
    if (!this.ctx || this.isMuted) return;
    const melody = [
      { f: 523, t: 0 },
      { f: 523, t: 0.15 },
      { f: 587, t: 0.3 },
      { f: 523, t: 0.5 },
      { f: 698, t: 0.7 },
      { f: 659, t: 0.95 },
      { f: 523, t: 1.3 },
      { f: 523, t: 1.45 },
      { f: 587, t: 1.6 },
      { f: 523, t: 1.8 },
      { f: 784, t: 2.0 },
      { f: 698, t: 2.3 }
    ];
    melody.forEach(n => {
      this.playTone(n.f, 'square', 0.22, n.t, 0.25);
      this.playTone(n.f / 2, 'triangle', 0.22, n.t, 0.2);
    });
  }
}

const sounds = new SoundManager();
