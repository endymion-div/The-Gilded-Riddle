import { AudioSettings, MusicTensionState } from '../types/game';
import { DEFAULT_AUDIO_SETTINGS } from './saveSystem';

export type SoundEffectType =
  | 'click'
  | 'evidence'
  | 'clue_sting'
  | 'paper'
  | 'case_file'
  | 'deduction_confirm'
  | 'contradiction'
  | 'wrong'
  | 'door_creak'
  | 'footstep_wood'
  | 'thunder'
  | 'case_solved';

type SubtitleListener = (caption: string) => void;

export interface AudioDiagnostics {
  contextState: AudioContextState | 'unavailable';
  masterGain: number;
  musicGain: number;
  ambienceGain: number;
  effectsGain: number;
  rainActive: boolean;
  musicLoopActive: boolean;
  effectsTriggered: number;
  musicNotesPlayed: number;
  rmsLevel: number;
  peakLevel: number;
}

class VictorianSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;

  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;
  private tension: MusicTensionState = 'NORMAL';
  private rainNodes: AudioBufferSourceNode[] = [];
  private droneNodes: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private clockTimer: number | null = null;
  private crackleTimer: number | null = null;
  private musicStep = 0;
  private tickPhase = 0;
  private crackleCount = 0;
  private effectsTriggered = 0;
  private musicNotesPlayed = 0;
  private subtitleListener: SubtitleListener | null = null;
  private isPaused = false;
  private analyserBuffer: Float32Array<ArrayBuffer> | null = null;

  public setSubtitleListener(cb: SubtitleListener | null) {
    this.subtitleListener = cb;
  }

  private emitSubtitle(text: string) {
    if (this.subtitleListener) {
      this.subtitleListener(text);
    }
  }

  private setupBusGraph(ctx: AudioContext) {
    if (this.masterGain && this.compressor && this.analyser) return;

    this.masterGain = ctx.createGain();
    this.musicGain = ctx.createGain();
    this.ambienceGain = ctx.createGain();
    this.effectsGain = ctx.createGain();
    this.compressor = ctx.createDynamicsCompressor();
    this.analyser = ctx.createAnalyser();

    this.compressor.threshold.value = -14;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.2;

    this.analyser.fftSize = 256;
    this.analyserBuffer = new Float32Array(new ArrayBuffer(this.analyser.fftSize * 4));

    this.musicGain.connect(this.masterGain);
    this.ambienceGain.connect(this.masterGain);
    this.effectsGain.connect(this.masterGain);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.applyBusGains(true);
  }

  private applyBusGains(immediate = false) {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain || !this.musicGain || !this.ambienceGain || !this.effectsGain) {
      return;
    }

    const now = ctx.currentTime;
    const allMuted =
      !this.settings.musicEnabled && !this.settings.ambienceEnabled && !this.settings.effectsEnabled;

    const targetMaster = allMuted ? 0 : Math.max(0, Math.min(1, this.settings.masterVolume));
    const targetMusic =
      !this.settings.musicEnabled || this.isPaused
        ? 0
        : Math.max(0, Math.min(1, this.settings.musicVolume)) * 0.68;

    const ambienceScale = this.tension === 'FINAL_DEDUCTION' ? 0.24 : 0.62;
    const targetAmbience =
      !this.settings.ambienceEnabled || this.isPaused
        ? 0
        : Math.max(0, Math.min(1, this.settings.ambienceVolume)) * ambienceScale;

    const targetEffects = !this.settings.effectsEnabled
      ? 0
      : Math.max(0, Math.min(1, this.settings.effectsVolume)) * 0.9;

    if (immediate) {
      this.masterGain.gain.setValueAtTime(targetMaster, now);
      this.musicGain.gain.setValueAtTime(targetMusic, now);
      this.ambienceGain.gain.setValueAtTime(targetAmbience, now);
      this.effectsGain.gain.setValueAtTime(targetEffects, now);
    } else {
      this.masterGain.gain.setTargetAtTime(targetMaster, now, 0.06);
      this.musicGain.gain.setTargetAtTime(targetMusic, now, 0.08);
      this.ambienceGain.gain.setTargetAtTime(targetAmbience, now, 0.12);
      this.effectsGain.gain.setTargetAtTime(targetEffects, now, 0.04);
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      this.setupBusGraph(this.ctx);
      return this.ctx;
    } catch {
      return null;
    }
  }

  private async ensureRunning(): Promise<AudioContext | null> {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return ctx;
      }
    }
    return ctx;
  }

  public async unlockAndStart(): Promise<boolean> {
    const ctx = await this.ensureRunning();
    if (!ctx) return false;

    this.applyBusGains();
    this.syncAmbience();
    this.syncMusicLoop(true);

    if (typeof window !== 'undefined') {
      (window as unknown as { __gildedAudioDiagnostics?: () => AudioDiagnostics }).__gildedAudioDiagnostics =
        () => this.getDiagnostics();
    }
    return ctx.state === 'running';
  }

  public updateSettings(next: AudioSettings) {
    this.settings = next;
    this.applyBusGains();
    this.syncAmbience();
    this.syncMusicLoop(false);
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    this.applyBusGains();
  }

  public setTensionState(state: MusicTensionState) {
    if (this.tension === state) return;
    this.tension = state;
    this.applyBusGains();
  }

  private buildNormalizedRainBuffer(ctx: AudioContext, seconds = 3): AudioBuffer {
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let maxAbs = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      const sample = b0 + b1 + b2 + white * 0.1848;
      data[i] = sample;
      const abs = Math.abs(sample);
      if (abs > maxAbs) maxAbs = abs;
    }

    // Normalize to strong 0.85 peak and smooth loop boundary crossfade
    const scale = maxAbs > 0 ? 0.85 / maxAbs : 1;
    const fadeLen = Math.min(2048, Math.floor(bufferSize * 0.05));
    for (let i = 0; i < bufferSize; i++) {
      data[i] *= scale;
    }
    for (let i = 0; i < fadeLen; i++) {
      const t = i / fadeLen;
      const tailIdx = bufferSize - fadeLen + i;
      const blended = data[i] * t + data[tailIdx] * (1 - t);
      data[i] = blended;
      data[tailIdx] = blended;
    }

    return buffer;
  }

  private syncAmbience() {
    if (typeof window === 'undefined') return;
    const ctx = this.ctx;
    if (!ctx || !this.ambienceGain) return;

    this.applyBusGains();

    if (!this.settings.ambienceEnabled || this.isPaused) {
      if (this.clockTimer !== null) {
        window.clearInterval(this.clockTimer);
        this.clockTimer = null;
      }
      if (this.crackleTimer !== null) {
        window.clearInterval(this.crackleTimer);
        this.crackleTimer = null;
      }
      return;
    }

    if (this.rainNodes.length === 0) {
      try {
        const buffer = this.buildNormalizedRainBuffer(ctx, 3);

        // Layer 1: Warm outdoor rain body
        const lowSource = ctx.createBufferSource();
        lowSource.buffer = buffer;
        lowSource.loop = true;

        const lowFilter = ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.value = 620;

        const lowGain = ctx.createGain();
        lowGain.gain.value = 0.44;

        lowSource.connect(lowFilter);
        lowFilter.connect(lowGain);
        lowGain.connect(this.ambienceGain);
        lowSource.start();

        // Layer 2: Crisp windowpane rain patter
        const highSource = ctx.createBufferSource();
        highSource.buffer = buffer;
        highSource.loop = true;

        const highFilter = ctx.createBiquadFilter();
        highFilter.type = 'bandpass';
        highFilter.frequency.value = 1850;
        highFilter.Q.value = 0.7;

        const highGain = ctx.createGain();
        highGain.gain.value = 0.25;

        highSource.connect(highFilter);
        highFilter.connect(highGain);
        highGain.connect(this.ambienceGain);
        highSource.start(0, 1.1);

        this.rainNodes = [lowSource, highSource];
      } catch {
        // graceful degradation
      }
    }

    if (this.clockTimer === null) {
      this.clockTimer = window.setInterval(() => {
        if (!this.settings.ambienceEnabled || this.isPaused) return;
        if (
          this.tension === 'INVESTIGATION' ||
          this.tension === 'DISCOVERY' ||
          this.tension === 'SUSPICION' ||
          this.tension === 'DANGER' ||
          this.tension === 'FINAL_DEDUCTION'
        ) {
          this.playTickSound();
        }
      }, 1000);
    }

    if (this.crackleTimer === null) {
      this.crackleTimer = window.setInterval(() => {
        if (!this.settings.ambienceEnabled || this.isPaused) return;
        this.playHearthCrackle();
        this.crackleCount++;
        if (this.crackleCount % 26 === 0 && this.tension !== 'FINAL_DEDUCTION') {
          this.playDistantThunder();
        }
      }, 720);
    }
  }

  private playTickSound() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.ambienceGain) return;
    try {
      const now = ctx.currentTime;
      const isTock = this.tickPhase % 2 === 1;
      this.tickPhase++;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isTock ? 980 : 1340, now);
      osc.frequency.exponentialRampToValueAtTime(isTock ? 240 : 320, now + 0.025);

      const level = this.tension === 'FINAL_DEDUCTION' ? 0.34 : 0.22;
      gain.gain.setValueAtTime(level, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gain);
      gain.connect(this.ambienceGain);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // ignore
    }
  }

  private playHearthCrackle() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.ambienceGain) return;
    try {
      const now = ctx.currentTime;
      const len = Math.max(1, Math.floor(ctx.sampleRate * 0.035));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      }

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2100 + Math.random() * 1400;
      filter.Q.value = 1.6;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14 + Math.random() * 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambienceGain);
      src.start(now);
    } catch {
      // ignore
    }
  }

  private playDistantThunder() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.ambienceGain) return;
    try {
      const now = ctx.currentTime;
      this.noiseBurstToBus(ctx, this.ambienceGain, 1.9, 130, 0.42, now);
      this.emitSubtitle('[Distant thunder rolls across London]');
    } catch {
      // ignore
    }
  }

  private ensureGhostDrone(ctx: AudioContext) {
    if (this.droneNodes.length > 0 || !this.musicGain) return;
    try {
      const droneFilter = ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 185;
      droneFilter.Q.value = 2.2;

      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.22;

      const oscA = ctx.createOscillator();
      oscA.type = 'triangle';
      oscA.frequency.value = 55; // A1 ghostly root

      const oscB = ctx.createOscillator();
      oscB.type = 'sine';
      oscB.frequency.value = 55.45; // eerie slow beating shimmer

      // Slow LFO sweeping the drone filter like cold air through a corridor
      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.16;
      lfoDepth.gain.value = 65;
      lfo.connect(lfoDepth);
      lfoDepth.connect(droneFilter.frequency);

      oscA.connect(droneFilter);
      oscB.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.musicGain);

      oscA.start();
      oscB.start();
      lfo.start();

      this.droneNodes = [oscA, oscB, lfo];
      this.droneGain = droneGain;
    } catch {
      // ignore
    }
  }

  private syncMusicLoop(playImmediately: boolean) {
    if (typeof window === 'undefined') return;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    const ctx = this.ctx;
    if (ctx && this.droneGain) {
      const target =
        !this.settings.musicEnabled || this.isPaused || this.tension === 'FINAL_DEDUCTION'
          ? 0
          : 0.22;
      this.droneGain.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
    }

    if (!this.settings.musicEnabled) return;
    if (ctx && ctx.state === 'running') {
      this.ensureGhostDrone(ctx);
    }

    if (playImmediately && !this.isPaused && this.tension !== 'FINAL_DEDUCTION') {
      this.playMusicPhraseNote();
    }

    this.musicTimer = window.setInterval(() => {
      if (!this.settings.musicEnabled || this.isPaused) return;
      if (this.tension === 'FINAL_DEDUCTION') return;
      if (this.ctx && this.ctx.state === 'running') {
        this.ensureGhostDrone(this.ctx);
      }
      this.playMusicPhraseNote();
    }, 1550);
  }

  private playMusicPhraseNote() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.musicGain) return;

    this.ensureGhostDrone(ctx);

    // Paranormal murder-mystery motifs: Phrygian / tritone / diminished suspense intervals
    const palettes: Record<MusicTensionState, number[]> = {
      NORMAL: [220, 233.08, 311.13, 293.66, 207.65, 220],
      INVESTIGATION: [196, 207.65, 277.18, 261.63, 185, 196],
      SUSPICION: [185, 196, 261.63, 246.94, 174.61, 185],
      DISCOVERY: [220, 277.18, 311.13, 415.3, 329.63, 233.08],
      DANGER: [146.83, 155.56, 207.65, 196, 138.59, 146.83],
      FINAL_DEDUCTION: [],
      CASE_SOLVED: [220, 261.63, 329.63, 440, 523.25, 440],
    };

    const notes = palettes[this.tension];
    if (!notes || notes.length === 0) return;

    const step = this.musicStep;
    const freq = notes[step % notes.length];
    this.musicStep++;
    this.musicNotesPlayed++;

    try {
      const now = ctx.currentTime;

      // 1. Eerie theremin / bowed glass-harmonica voice with subtle pitch glide & vibrato
      const osc = ctx.createOscillator();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = this.tension === 'DANGER' || this.tension === 'SUSPICION' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq * 0.985, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.14);

      vibrato.type = 'sine';
      vibrato.frequency.value = 4.8;
      vibratoGain.gain.value = freq * 0.012;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      filter.type = 'lowpass';
      filter.frequency.value = this.tension === 'DANGER' ? 980 : 1450;

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.16);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      vibrato.start(now);
      osc.stop(now + 1.54);
      vibrato.stop(now + 1.54);

      // 2. Haunting distant music-box / celesta chime on alternating steps
      if (step % 2 === 1) {
        const bellOsc = ctx.createOscillator();
        const overtoneOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        const overtoneGain = ctx.createGain();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(freq * 2, now + 0.08);
        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(freq * 3.01, now + 0.08); // eerie slight inharmonicity

        bellGain.gain.setValueAtTime(0.0001, now + 0.08);
        bellGain.gain.linearRampToValueAtTime(0.16, now + 0.095);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

        overtoneGain.gain.value = 0.25;

        bellOsc.connect(bellGain);
        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(bellGain);
        bellGain.connect(this.musicGain);

        bellOsc.start(now + 0.08);
        overtoneOsc.start(now + 0.08);
        bellOsc.stop(now + 1.3);
        overtoneOsc.stop(now + 1.3);
      }

      // 3. Dark cello sub-pulse on phrase anchors
      if (step % 3 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassFilter = ctx.createBiquadFilter();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(freq * 0.5, now);
        bassFilter.type = 'lowpass';
        bassFilter.frequency.value = 360;
        bassGain.gain.setValueAtTime(0.0001, now);
        bassGain.gain.linearRampToValueAtTime(0.28, now + 0.08);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + 1.95);
      }
    } catch {
      // ignore
    }
  }

  public playEffect(effect: SoundEffectType) {
    if (!this.settings.effectsEnabled) return;
    void this.dispatchEffect(effect);
  }

  private async dispatchEffect(effect: SoundEffectType) {
    const ctx = await this.ensureRunning();
    if (!ctx || !this.effectsGain) return;

    this.applyBusGains();
    this.effectsTriggered++;

    const now = ctx.currentTime;
    const bus = this.effectsGain;

    try {
      switch (effect) {
        case 'click': {
          this.toneToBus(ctx, bus, 720, 460, 0.055, 'triangle', 0.42, now);
          break;
        }
        case 'evidence': {
          this.toneToBus(ctx, bus, 587.33, 587.33, 0.38, 'triangle', 0.58, now);
          this.toneToBus(ctx, bus, 880, 880, 0.5, 'sine', 0.52, now + 0.08);
          this.emitSubtitle('[Metallic chime — Evidence catalogued]');
          break;
        }
        case 'clue_sting': {
          this.toneToBus(ctx, bus, 329.63, 329.63, 0.34, 'triangle', 0.54, now);
          this.toneToBus(ctx, bus, 493.88, 493.88, 0.54, 'sine', 0.54, now + 0.1);
          this.emitSubtitle('[Investigative sting — Observation logged]');
          break;
        }
        case 'paper':
        case 'case_file': {
          this.noiseBurstToBus(ctx, bus, 0.14, 1800, 0.45, now);
          this.emitSubtitle('[Parchment rustle]');
          break;
        }
        case 'deduction_confirm': {
          this.toneToBus(ctx, bus, 220, 220, 0.55, 'triangle', 0.58, now);
          this.toneToBus(ctx, bus, 329.63, 329.63, 0.6, 'sine', 0.54, now + 0.09);
          this.toneToBus(ctx, bus, 440, 440, 0.78, 'sine', 0.48, now + 0.18);
          this.emitSubtitle('[Resonant chord — Deduction verified]');
          break;
        }
        case 'contradiction': {
          this.toneToBus(ctx, bus, 233.08, 220, 0.48, 'sawtooth', 0.48, now, 780);
          this.toneToBus(ctx, bus, 311.13, 293.66, 0.52, 'triangle', 0.46, now + 0.1);
          this.emitSubtitle('[Tense chord — Contradiction exposed]');
          break;
        }
        case 'wrong': {
          this.toneToBus(ctx, bus, 174.61, 146.83, 0.34, 'triangle', 0.5, now);
          this.emitSubtitle('[Low tone — Hypothesis unconfirmed]');
          break;
        }
        case 'door_creak': {
          this.toneToBus(ctx, bus, 145, 215, 0.38, 'sawtooth', 0.36, now, 520);
          this.emitSubtitle('[Heavy oak door]');
          break;
        }
        case 'footstep_wood': {
          this.noiseBurstToBus(ctx, bus, 0.065, 520, 0.42, now);
          break;
        }
        case 'thunder': {
          this.noiseBurstToBus(ctx, bus, 1.65, 160, 0.85, now);
          this.emitSubtitle('[Distant thunder rolls over London]');
          break;
        }
        case 'case_solved': {
          const chord = [220, 277.18, 329.63, 440, 554.37];
          chord.forEach((f, idx) => {
            this.toneToBus(ctx, bus, f, f, 1.7, 'sine', 0.46, now + idx * 0.12);
          });
          this.emitSubtitle('[Orchestral resolution — Case Closed]');
          break;
        }
      }
    } catch {
      // graceful audio fallback
    }
  }

  public async playTestSound(): Promise<boolean> {
    const running = await this.unlockAndStart();
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return running;

    this.effectsTriggered++;
    const now = ctx.currentTime;
    // Play directly to masterGain so speakers can be tested even if individual SFX toggle was off
    this.toneToBus(ctx, this.masterGain, 293.66, 293.66, 0.4, 'triangle', 0.48, now);
    this.toneToBus(ctx, this.masterGain, 440, 440, 0.48, 'sine', 0.44, now + 0.1);
    this.toneToBus(ctx, this.masterGain, 587.33, 587.33, 0.65, 'sine', 0.4, now + 0.2);
    this.emitSubtitle('[Audio Check — Victorian Study Soundscape Active]');
    return running;
  }

  public getDiagnostics(): AudioDiagnostics {
    let rmsLevel = 0;
    let peakLevel = 0;

    if (this.analyser && this.analyserBuffer) {
      this.analyser.getFloatTimeDomainData(this.analyserBuffer);
      let sumSq = 0;
      for (let i = 0; i < this.analyserBuffer.length; i++) {
        const v = this.analyserBuffer[i];
        sumSq += v * v;
        const abs = Math.abs(v);
        if (abs > peakLevel) peakLevel = abs;
      }
      rmsLevel = Math.sqrt(sumSq / this.analyserBuffer.length);
    }

    return {
      contextState: this.ctx ? this.ctx.state : 'unavailable',
      masterGain: this.masterGain ? Number(this.masterGain.gain.value.toFixed(3)) : 0,
      musicGain: this.musicGain ? Number(this.musicGain.gain.value.toFixed(3)) : 0,
      ambienceGain: this.ambienceGain ? Number(this.ambienceGain.gain.value.toFixed(3)) : 0,
      effectsGain: this.effectsGain ? Number(this.effectsGain.gain.value.toFixed(3)) : 0,
      rainActive: this.rainNodes.length > 0 && this.settings.ambienceEnabled && !this.isPaused,
      musicLoopActive: this.musicTimer !== null && this.settings.musicEnabled,
      effectsTriggered: this.effectsTriggered,
      musicNotesPlayed: this.musicNotesPlayed,
      rmsLevel: Number(rmsLevel.toFixed(5)),
      peakLevel: Number(peakLevel.toFixed(5)),
    };
  }

  private toneToBus(
    ctx: AudioContext,
    target: AudioNode,
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    startTime: number,
    lowpass?: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), startTime + duration);
    }
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    if (lowpass) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = lowpass;
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(target);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  private noiseBurstToBus(
    ctx: AudioContext,
    target: AudioNode,
    duration: number,
    filterFreq: number,
    volume: number,
    startTime: number
  ) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(target);
    src.start(startTime);
  }
}

export const soundEngine = new VictorianSoundEngine();
