import Phaser from 'phaser';
import DOMUIComponent from './DOMUIComponent';
import UISoundManager from '../systems/UISoundManager';

export default class PauseMenuUI extends DOMUIComponent {
    private onResume: () => void;
    private onSettings: () => void;
    private onMainMenu: () => void;
    private onSave: () => void;
    private onLoad: () => void;

    constructor(
        scene: Phaser.Scene,
        uiScene: Phaser.Scene,
        callbacks: {
            onResume: () => void,
            onSettings: () => void,
            onMainMenu: () => void,
            onSave: () => void,
            onLoad: () => void
        }
    ) {
        super(scene, uiScene, 'pause-menu-overlay');
        this.onResume = callbacks.onResume;
        this.onSettings = callbacks.onSettings;
        this.onMainMenu = callbacks.onMainMenu;
        this.onSave = callbacks.onSave;
        this.onLoad = callbacks.onLoad;
        this.createUI();
    }

    private createUI(): void {
        this.container.className = 'absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 overflow-hidden hidden pointer-events-auto';

        this.container.innerHTML = `
            <!-- Background florestal escuro -->
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-950/40 via-green-950/60 to-black/90 pointer-events-none"></div>
            
            <div class="relative z-20 flex flex-col items-center space-y-8 w-full max-w-sm p-8 bg-black/70 border-2 border-green-900/40 rounded backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                
                <h2 class="text-3xl font-pixel text-white tracking-widest mb-2 text-center w-full border-b border-green-800 pb-4">
                    PAUSADO
                </h2>

                <div class="flex flex-col space-y-4 w-full text-center mt-4">
                    <button id="pause-resume" class="text-xs py-3 group font-pixel text-slate-300 hover:text-green-400 transition-colors cursor-pointer border border-transparent hover:border-green-800/50 hover:bg-green-900/20 rounded">
                        CONTINUAR
                    </button>
                    
                    <button id="pause-save" class="text-xs py-3 group font-pixel text-slate-300 hover:text-green-400 transition-colors cursor-pointer border border-transparent hover:border-green-800/50 hover:bg-green-900/20 rounded">
                        SALVAR JOGO
                    </button>

                    <button id="pause-load" class="text-xs py-3 group font-pixel text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer border border-transparent hover:border-cyan-800/50 hover:bg-cyan-900/20 rounded">
                        CARREGAR JOGO
                    </button>

                    <button id="pause-settings" class="text-xs py-3 group font-pixel text-slate-300 hover:text-green-400 transition-colors cursor-pointer border border-transparent hover:border-green-800/50 hover:bg-green-900/20 rounded">
                        CONFIGURAÇÕES
                    </button>
                    
                    <button id="pause-mainmenu" class="text-xs py-3 group font-pixel text-red-500/80 hover:text-red-400 transition-colors cursor-pointer border border-transparent hover:border-red-900/50 hover:bg-red-900/20 rounded mt-4 pt-2">
                        VOLTAR AO MENU
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const resumeBtn = this.container.querySelector('#pause-resume');
        resumeBtn?.addEventListener('click', () => {
            UISoundManager.playClose();
            this.hide(() => this.onResume());
        });

        const settingsBtn = this.container.querySelector('#pause-settings');
        settingsBtn?.addEventListener('click', () => {
            UISoundManager.playConfirm();
            this.onSettings();
        });

        const mainMenuBtn = this.container.querySelector('#pause-mainmenu');
        mainMenuBtn?.addEventListener('click', () => {
            UISoundManager.playConfirm();
            this.hide(() => this.onMainMenu());
        });

        const saveBtn = this.container.querySelector('#pause-save');
        saveBtn?.addEventListener('click', () => {
            UISoundManager.playConfirm();
            this.hide(() => this.onSave());
        });

        const loadBtn = this.container.querySelector('#pause-load');
        loadBtn?.addEventListener('click', () => {
            UISoundManager.playConfirm();
            this.hide(() => this.onLoad());
        });
    }
}
