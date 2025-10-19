class SoundService {
    private audioContext: AudioContext | null = null;
    private isMuted = false;
    private masterGain: GainNode | null = null;
    private lastPlayed: { [key: string]: number } = {};
    
    // Throttle duration in seconds. Prevents sounds from playing too rapidly.
    private throttleConfig: { [key: string]: number } = {
        'sand_fall': 0.1,
        'water': 0.08,
        'fire': 0.15,
        'lava': 0.2,
        'acid': 0.1,
        'steam_hiss': 0.2,
        'place': 0.02,
        'erase': 0.02,
    };

    private initAudioContext() {
        if (this.audioContext) return;
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.4; // Master volume control (reduced from 0.5)
            this.masterGain.connect(this.audioContext.destination);
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }
    
    private playTone(freq: number, vol: number, dur: number, type: OscillatorType, freqEnd?: number) {
        if (!this.audioContext || !this.masterGain) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        if (freqEnd) {
            oscillator.frequency.exponentialRampToValueAtTime(freqEnd, this.audioContext.currentTime + dur * 0.9);
        }
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, this.audioContext.currentTime + dur * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + dur);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + dur);
    }

    private playNoise(vol: number, dur: number, filterType: BiquadFilterType, filterFreq: number) {
        if (!this.audioContext || !this.masterGain) return;
        
        const bufferSize = this.audioContext.sampleRate * dur;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = filterFreq;
        
        const gainNode = this.audioContext.createGain();
        
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, this.audioContext.currentTime + dur * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + dur);
        
        noiseSource.start(this.audioContext.currentTime);
        noiseSource.stop(this.audioContext.currentTime + dur);
    }

    public playSound(soundType: string) {
        this.initAudioContext();
        if (this.isMuted || !this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Throttling logic
        const now = this.audioContext.currentTime;
        const throttleDuration = this.throttleConfig[soundType] || 0;
        const lastTime = this.lastPlayed[soundType] || 0;
        if (now - lastTime < throttleDuration) {
            return;
        }
        this.lastPlayed[soundType] = now;

        switch (soundType) {
            case 'place':
                this.playTone(180, 0.15, 0.1, 'sine', 120);
                break;
            case 'erase':
                this.playNoise(0.1, 0.15, 'lowpass', 1000);
                break;
            case 'select':
                this.playTone(440, 0.1, 0.1, 'triangle');
                break;
            case 'sand_fall':
                this.playNoise(0.05, 0.1, 'bandpass', 800);
                break;
            case 'water':
                this.playTone(800, 0.08, 0.1, 'sine', 600);
                break;
            case 'fire':
                this.playNoise(0.08, 0.1, 'bandpass', 1500);
                break;
            case 'lava':
                this.playNoise(0.2, 0.3, 'lowpass', 200);
                break;
            case 'acid':
                this.playNoise(0.07, 0.2, 'highpass', 3000);
                break;
            case 'steam_hiss':
                this.playNoise(0.1, 0.4, 'highpass', 4000);
                break;
        }
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        this.initAudioContext();
        if (!this.audioContext || !this.masterGain) return this.isMuted;

        if (this.isMuted) {
            this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.2);
        } else {
             if (this.audioContext.state === 'suspended') {
                 this.audioContext.resume();
            }
            this.masterGain.gain.exponentialRampToValueAtTime(0.4, this.audioContext.currentTime + 0.2);
        }
        return this.isMuted;
    }
}

export const soundService = new SoundService();