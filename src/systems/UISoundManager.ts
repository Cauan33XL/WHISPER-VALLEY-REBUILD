import * as Tone from 'tone';

export default class UISoundManager {
    private static initialized = false;
    private static selectSynth: Tone.PolySynth;
    private static confirmSynth: Tone.PolySynth;
    private static uiSynth: Tone.PolySynth;
    private static typeSynth: Tone.Synth;
    private static masterVolume: Tone.Volume;
    private static lastTypingTime: number = 0;
    
    // Configuração atual de voz do "Typewriter"
    private static currentVoice = { 
        pitches: ["C3", "D3"], 
        duration: "128n" 
    };

    public static async init() {
        if (this.initialized) return;
        this.initialized = true;

        // Global UI volume (-15 decibels)
        this.masterVolume = new Tone.Volume(-15).toDestination();

        // Ominous, low pitched blip for hover
        this.selectSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.2, sustain: 0, release: 0.2 }
        }).connect(this.masterVolume);

        // Heavy, resonant strike for confirm
        this.confirmSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.8 }
        }).connect(this.masterVolume);

        // Eerie ambient swell for opening menus
        this.uiSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.1, decay: 0.4, sustain: 0, release: 1.0 }
        }).connect(this.masterVolume);

        // Retro 8-bit blip for typewriter text (volume ajustado)
        const typingVolume = new Tone.Volume(-18).toDestination();
        this.typeSynth = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.005, decay: 0.02, sustain: 0, release: 0.02 }
        }).connect(typingVolume);
    }

    private static ensureContext() {
        if (!this.initialized) this.init();
        if (Tone.context.state !== 'running') {
            Tone.start().catch(() => {});
        }
    }

    public static playSelect() {
        this.ensureContext();
        if (this.selectSynth) {
            this.selectSynth.triggerAttackRelease("C3", "16n"); // Som grave
        }
    }

    public static playConfirm() {
        this.ensureContext();
        if (this.confirmSynth) {
            // Um som pesado, grave e ressoante
            const now = Tone.now();
            this.confirmSynth.triggerAttackRelease("C2", "8n", now);
            this.confirmSynth.triggerAttackRelease("G2", "4n", now + 0.05);
        }
    }
    
    public static playOpen() {
        this.ensureContext();
        if (this.uiSynth) {
            const now = Tone.now();
            this.uiSynth.triggerAttackRelease("A2", "8n", now);
            this.uiSynth.triggerAttackRelease("E3", "4n", now + 0.1);
        }
    }

    public static playClose() {
        this.ensureContext();
        if (this.uiSynth) {
            const now = Tone.now();
            this.uiSynth.triggerAttackRelease("E3", "16n", now);
            this.uiSynth.triggerAttackRelease("A2", "8n", now + 0.1);
        }
    }

    public static playSuccess() {
        this.ensureContext();
        if (this.confirmSynth) {
            const now = Tone.now();
            // Som etéreo/triunfante, porém mantendo o tom misterioso
            this.confirmSynth.triggerAttackRelease("C3", "8n", now);
            this.confirmSynth.triggerAttackRelease("E3", "8n", now + 0.1);
            this.confirmSynth.triggerAttackRelease("G3", "4n", now + 0.2);
            this.confirmSynth.triggerAttackRelease("C4", "2n", now + 0.3);
        }
    }

    // Analisa a fala para determinar de quem é a voz, focado em Suspense/Terror
    public static setSpeakerFromText(text: string) {
        if (!this.typeSynth) return;
        
        // Voz padrão (Narrador / Ambiente) - Grave, sombria
        this.currentVoice = { pitches: ["C3", "D3"], duration: "128n" };
        this.typeSynth.oscillator.type = "triangle";
        this.typeSynth.envelope.attack = 0.01;

        const match = text.match(/^([^:]+):/);
        if (match) {
            const speaker = match[1].trim().toLowerCase();
            
            if (speaker.includes("ethan")) {
                // Ethan: Protagonista tenso. Square wave, tom médio/baixo
                this.currentVoice = { pitches: ["E3", "F3"], duration: "128n" };
                this.typeSynth.oscillator.type = "square";
                this.typeSynth.envelope.attack = 0.005;
            } 
            else if (speaker.includes("sebastião")) {
                // Sebastião: Voz áspera, idoso desconfiado. Sawtooth bem grave.
                this.currentVoice = { pitches: ["G2", "A2"], duration: "64n" };
                this.typeSynth.oscillator.type = "sawtooth";
                this.typeSynth.envelope.attack = 0.02; 
            } 
            else if (speaker.includes("joão")) {
                // João: Assustado, fala rápida. Triangle um pouco mais agudo.
                this.currentVoice = { pitches: ["A3", "B3"], duration: "128n" };
                this.typeSynth.oscillator.type = "triangle";
                this.typeSynth.envelope.attack = 0.005; 
            }
            else if (speaker.includes("ana") || speaker.includes("helena") || speaker.includes("sofia")) {
                // Mulheres/Fantasmas: Voz espectral, arrastada. Sine wave pura.
                this.currentVoice = { pitches: ["C4", "E4"], duration: "32n" };
                this.typeSynth.oscillator.type = "sine";
                this.typeSynth.envelope.attack = 0.05; 
            }
            else if (speaker.includes("weverson") || speaker.includes("jonas")) {
                // Cultistas/Severos: Som seco, quase percussivo. Square grave.
                this.currentVoice = { pitches: ["C2", "D2"], duration: "128n" };
                this.typeSynth.oscillator.type = "square";
                this.typeSynth.envelope.attack = 0.001; 
            }
            else {
                // Outro NPC genérico
                let hash = 0;
                for (let i = 0; i < speaker.length; i++) {
                    hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
                }
                const notes = ["C", "D", "E", "F", "G", "A", "B"];
                const octaves = ["2", "3"]; // Manter octavas graves para manter o clima de terror
                const note = notes[Math.abs(hash) % notes.length];
                const octave = octaves[Math.abs(hash) % octaves.length];
                this.currentVoice = { pitches: [note + octave], duration: "128n" };
                this.typeSynth.oscillator.type = "triangle";
            }
        }
    }

    public static playTyping() {
        this.ensureContext();
        if (this.typeSynth) {
            const now = Tone.now();
            
            // Limitador (throttle): 50ms (permite bipes rápidos o suficiente, mas evita distorção)
            if (now - this.lastTypingTime < 0.05) return;
            this.lastTypingTime = now;

            const pitches = this.currentVoice.pitches;
            const pitch = pitches[Math.floor(Math.random() * pitches.length)];
            this.typeSynth.triggerAttackRelease(pitch, this.currentVoice.duration);
        }
    }
}
