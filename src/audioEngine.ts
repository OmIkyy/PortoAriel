// High-Tech Web Audio Ambient Sound Synthesizer & MP3 Stream Player
// Designed to bypass autoplay blocks through the fingerprint scan touch gesture.

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private synthGain: GainNode | null = null;
  private streamAudio: HTMLAudioElement | null = null;
  private isStreamMode: boolean = true; // Use real lofi track by default, fallback to web audio synth if blocked or offline.

  // High quality royalty-free atmospheric ambient track
  private streamUrl = "https://assets.codepen.io/25868/shoptalk-clip.mp3"; // Beautiful upbeat/lofi loop or similar track

  constructor() {
    // Lazy loaded after user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.streamAudio = new Audio();
      this.streamAudio.src = this.streamUrl;
      this.streamAudio.loop = true;
      this.streamAudio.volume = this.volume;
    } catch (e) {
      console.warn("Failed to initialize Web Audio API:", e);
    }
  }

  public setStreamUrl(url: string) {
    if (!url || url === this.streamUrl) return;
    this.streamUrl = url;
    if (this.streamAudio) {
      const wasPlaying = !this.streamAudio.paused;
      this.streamAudio.src = url;
      if (wasPlaying && this.isPlaying) {
        this.streamAudio.play().catch(e => console.warn("Failed to play updated audio url", e));
      }
    }
  }

  public async start() {
    this.init();
    if (this.isPlaying) return;

    if (this.ctx && this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    if (this.isStreamMode && this.streamAudio) {
      try {
        await this.streamAudio.play();
        this.isPlaying = true;
        return;
      } catch (err) {
        console.warn("Stream autoplay was blocked, falling back to Web Audio Synth", err);
      }
    }

    // FALLBACK WEB AUDIO SYNTHESIZER
    // Performs a beautiful, chill sci-fi ambient chord sequence: Am9 -> Fmaj9 -> Cmaj7 -> Gsus4
    if (this.ctx) {
      this.isPlaying = true;
      this.playSynthLoop();
    }
  }

  private stopInternal() {
    if (this.streamAudio) {
      this.streamAudio.pause();
    }
    if (this.ctx && this.ctx.state !== "closed") {
      this.isPlaying = false;
      if (this.synthGain) {
        this.synthGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    }
    this.isPlaying = false;
  }

  public stop() {
    // Disabled under user request: music is auto-played and cannot be paused.
    console.log("Audio termination is locked by user requirement.");
  }

  public toggle() {
    this.start();
    return true; // Always stays playing
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.streamAudio) {
      this.streamAudio.volume = this.volume;
    }
    if (this.synthGain && this.ctx) {
      this.synthGain.gain.linearRampToValueAtTime(this.volume * 0.15, this.ctx.currentTime + 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsStreamMode(): boolean {
    return this.isStreamMode;
  }

  public toggleMode() {
    this.stopInternal();
    this.isStreamMode = !this.isStreamMode;
    this.start();
    return this.isStreamMode;
  }

  // --- PRIVATE AMBIENT SYNTH CODE ---
  private playSynthLoop() {
    if (!this.ctx || !this.isPlaying) return;

    // Create main gain
    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.synthGain.gain.linearRampToValueAtTime(this.volume * 0.15, this.ctx.currentTime + 1.5);
    this.synthGain.connect(this.ctx.destination);

    const chords = [
      [220.00, 261.63, 329.63, 392.00, 440.00], // Am9 (A2, C4, E4, G4, B4)
      [174.61, 261.63, 349.23, 392.00, 440.00], // Fmaj9 (F2, C4, F4, G4, A4)
      [261.63, 329.63, 392.00, 493.88, 523.25], // Cmaj9 (C3, E4, G4, B4, C5)
      [196.00, 293.66, 392.00, 440.00, 587.33]  // Gsus4 (G2, D4, G4, A4, D5)
    ];

    let chordIndex = 0;
    const chordDuration = 5.0; // 5 seconds per chord

    const scheduleChord = () => {
      if (!this.isPlaying || !this.ctx || !this.synthGain) return;

      const now = this.ctx.currentTime;
      const notes = chords[chordIndex];

      // Play soft pad oscillators
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.synthGain) return;
        
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // High-tech warm triangle wave for retro tech vibe
        osc.type = idx === 0 ? "sine" : "triangle"; 
        osc.frequency.setValueAtTime(freq, now);

        // Micro detune for celestial chorus effect
        if (idx > 0) {
          osc.detune.setValueAtTime((Math.random() - 0.5) * 15, now);
        }

        // Keep high filter cutoff to make it smooth
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(idx === 0 ? 300 : 800, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + chordDuration - 0.5);

        // Soft ADSR envelope for each note
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.08 / notes.length, now + 1.2); // attack
        oscGain.gain.setValueAtTime(0.08 / notes.length, now + chordDuration - 1.5);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration); // release

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.synthGain);

        osc.start(now);
        osc.stop(now + chordDuration);
      });

      chordIndex = (chordIndex + 1) % chords.length;
      
      // Schedule next chord
      setTimeout(() => {
        if (this.isPlaying) {
          scheduleChord();
        }
      }, chordDuration * 1000 - 100);
    };

    scheduleChord();
  }
}

export const appAudio = new AudioEngine();
