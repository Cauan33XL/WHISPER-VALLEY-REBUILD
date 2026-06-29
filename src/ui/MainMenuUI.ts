import Phaser from 'phaser';
import DOMUIComponent from './DOMUIComponent';
import UISoundManager from '../systems/UISoundManager';

export default class MainMenuUI extends DOMUIComponent {
    private onNewGame: () => void;
    private onLoadGame: () => void;
    private onSettings: () => void;

    constructor(
        scene: Phaser.Scene,
        callbacks: {
            onNewGame: () => void,
            onLoadGame: () => void,
            onSettings: () => void
        }
    ) {
        super(scene, null, 'main-menu-overlay');
        this.onNewGame = callbacks.onNewGame;
        this.onLoadGame = callbacks.onLoadGame;
        this.onSettings = callbacks.onSettings;
        this.createUI();
    }

    private createUI(): void {
        this.container.className = 'absolute inset-0 flex flex-col items-center justify-center z-50 overflow-hidden hidden pointer-events-auto bg-cover bg-center';
        this.container.style.backgroundImage = "url('/assets/backgrounds/forest_bg.png')";

        this.container.innerHTML = `
            <div class="relative z-20 flex flex-col items-center justify-center w-full h-full p-16 mt-10">
                
                <!-- Título movido mais para cima com luz verde pulsante -->
                <h1 class="text-8xl md:text-[8rem] font-title font-bold text-white tracking-widest uppercase mb-16 text-center w-full animate-title-glow">
                    WHISPER VALLEY
                </h1>

                <!-- Botões estilizados: Verde ultra escuro, texto gordo, arredondados, com luz pulsante -->
                <div class="flex flex-col items-center space-y-6 w-full max-w-sm">
                    <button id="main-new-game" class="w-full py-5 px-6 font-pixel text-2xl font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl hover:bg-[#08220d] hover:border-green-900 hover:scale-105 transition-all cursor-pointer animate-box-glow" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                        NOVO JOGO
                    </button>
                    
                    <button id="main-load-game" class="w-full py-5 px-6 font-pixel text-2xl font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl hover:bg-[#08220d] hover:border-green-900 hover:scale-105 transition-all cursor-pointer animate-box-glow" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                        CARREGAR JOGO
                    </button>
                    
                    <button id="main-settings" class="w-full py-5 px-6 font-pixel text-2xl font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl hover:bg-[#08220d] hover:border-green-900 hover:scale-105 transition-all cursor-pointer mt-4 animate-box-glow" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                        CONFIGURAÇÕES
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const buttons = this.container.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                UISoundManager.playSelect();
            });
        });

        const newGameBtn = this.container.querySelector('#main-new-game');
        newGameBtn?.addEventListener('click', () => {
            UISoundManager.playConfirm();
            this.hide(() => this.onNewGame());
        });

        const loadGameBtn = this.container.querySelector('#main-load-game');
        loadGameBtn?.addEventListener('click', () => {
            UISoundManager.playConfirm();
            this.onLoadGame();
        });

        const settingsBtn = this.container.querySelector('#main-settings');
        settingsBtn?.addEventListener('click', () => {
            UISoundManager.playConfirm();
            this.onSettings();
        });
    }
}
