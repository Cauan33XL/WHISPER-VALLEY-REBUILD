import Phaser from 'phaser';
import DOMUIComponent from './DOMUIComponent';
import UISoundManager from '../systems/UISoundManager';

export default class MainMenuUI extends DOMUIComponent {
    private onNewGame: () => void;
    private onLoadGame: () => void;
    private onSettings: () => void;
    
    private selectedIndex: number = 0;
    private isOverlayOpen: boolean = false;
    private keyboardListener: ((e: KeyboardEvent) => void) | null = null;

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
            <div class="relative z-20 flex flex-col items-center justify-center w-full h-full p-16 pb-32">
                
                <!-- Título movido mais para cima com luz verde pulsante -->
                <h1 class="text-8xl md:text-[8rem] font-title font-bold text-white tracking-widest uppercase mb-12 text-center w-full animate-title-glow">
                    WHISPER VALLEY REBUILD
                </h1>

                <!-- Menu Scroll Window -->
                <div class="w-full max-w-sm relative h-[420px] overflow-hidden py-2 px-4 -mx-4">
                    <div id="menu-scroll-container" class="flex flex-col items-center space-y-6 w-full transition-transform duration-300">
                        <button id="main-new-game" data-glow="animate-box-glow" class="menu-btn w-full py-3 px-6 font-pixel text-2xl whitespace-nowrap font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl transition-all cursor-pointer" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                            NOVO JOGO
                        </button>
                        
                        <button id="main-load-game" data-glow="animate-box-glow" class="menu-btn w-full py-3 px-6 font-pixel text-2xl whitespace-nowrap font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl transition-all cursor-pointer" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                            CARREGAR JOGO
                        </button>

                        <button id="main-online" data-glow="animate-box-glow" class="menu-btn w-full py-3 px-6 font-pixel text-2xl whitespace-nowrap font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl transition-all cursor-pointer" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                            MODO ONLINE
                        </button>
                        
                        <button id="main-original" data-glow="animate-box-glow-brown" class="menu-btn w-full py-3 px-6 font-pixel text-xl whitespace-nowrap font-bold text-white bg-[#2b160b] border-2 border-[#140a05] rounded-2xl transition-all cursor-pointer" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                            JOGO ORIGINAL
                        </button>
                        
                        <button id="main-sycamore" data-glow="animate-box-glow-red" class="menu-btn w-full py-3 px-6 font-pixel text-xl whitespace-nowrap font-bold text-white bg-[#300000] border-2 border-[#1a0000] rounded-2xl transition-all cursor-pointer" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                            SYCAMORE VALLEY
                        </button>
                        
                        <button id="main-credits" data-glow="animate-box-glow" class="menu-btn w-full py-3 px-6 font-pixel text-2xl whitespace-nowrap font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl transition-all cursor-pointer" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                            CRÉDITOS
                        </button>
                        
                        <button id="main-settings" data-glow="animate-box-glow" class="menu-btn w-full py-3 px-6 font-pixel text-2xl whitespace-nowrap font-bold text-white bg-[#041207] border-2 border-[#020803] rounded-2xl transition-all cursor-pointer" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">
                            CONFIGURAÇÕES
                        </button>
                    </div>
                </div>
            </div>

            <!-- Original Game IFrame Overlay -->
            <div id="original-overlay" class="absolute inset-0 z-50 flex-col bg-black hidden pointer-events-auto">
                <div class="h-10 w-full bg-[#1c0d06] flex justify-between items-center px-6 border-b-2 border-[#402010]">
                    <span class="text-white font-pixel font-bold text-base mt-1">Whisper Valley (Original Clássico)</span>
                    <button id="close-original" class="text-white hover:text-[#a0522d] font-bold text-xl px-2 cursor-pointer font-pixel transition-colors mt-1">X</button>
                </div>
                <div id="original-iframe-wrapper" class="flex-grow w-full relative">
                </div>
            </div>

            <!-- Sycamore Valley IFrame Overlay -->
            <div id="sycamore-overlay" class="absolute inset-0 z-50 flex-col bg-black hidden pointer-events-auto">
                <div class="h-10 w-full bg-[#1a0000] flex justify-between items-center px-6 border-b-2 border-red-900">
                    <span class="text-white font-pixel font-bold text-base mt-1">Sycamore Valley (AU)</span>
                    <button id="close-sycamore" class="text-white hover:text-red-500 font-bold text-xl px-2 cursor-pointer font-pixel transition-colors mt-1">X</button>
                </div>
                <div id="sycamore-iframe-wrapper" class="flex-grow w-full relative">
                </div>
            </div>

            <!-- Credits Overlay -->
            <div id="credits-overlay" class="absolute inset-0 z-50 flex-col bg-black/90 hidden pointer-events-auto items-center justify-center p-8 backdrop-blur-sm">
                <div class="bg-[#041207] border-2 border-green-900 rounded-xl p-8 max-w-2xl w-full text-center shadow-[0_0_30px_rgba(0,255,0,0.15)]">
                    <h2 class="text-4xl font-title font-bold text-white mb-8 uppercase tracking-widest" style="-webkit-text-stroke: 1px black; text-shadow: 3px 3px 0 #000;">CRÉDITOS</h2>
                    
                    <div class="space-y-6 text-white font-pixel leading-relaxed">
                        <div>
                            <p class="text-green-500 font-bold mb-2">Whisper Valley Rebuild Desenvolvido por:</p>
                            <p class="text-xl">Cauan <span class="text-sm">(33XL Games System)</span></p>
                        </div>
                        
                        <div class="pt-4 border-t border-green-900/50">
                            <p class="text-green-500 font-bold mb-2">Equipe do Jogo Original <br><span class="text-sm text-gray-400">("The Mystery of Whisper Valley")</span></p>
                            <p class="text-lg">Caio, Cauan, Anna, Filipe e Gabriel</p>
                        </div>
                        
                        <div class="pt-4 border-t border-green-900/50">
                            <p class="text-green-500 font-bold mb-2">Distribuição:</p>
                            <p class="text-2xl font-bold tracking-widest text-red-600" style="-webkit-text-stroke: 1px black; text-shadow: 2px 2px 0 #000;">33XL GAMES SYSTEM</p>
                        </div>
                    </div>

                    <button id="close-credits" class="mt-10 py-3 px-8 font-pixel text-xl font-bold text-white bg-[#041207] border-2 border-green-900 rounded-xl hover:bg-[#08220d] hover:border-green-500 hover:scale-105 transition-all cursor-pointer">
                        FECHAR
                    </button>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const scrollContainer = this.container.querySelector('#menu-scroll-container') as HTMLElement;
        const menuButtons = Array.from(this.container.querySelectorAll('.menu-btn')) as HTMLButtonElement[];
        
        const updateSelection = () => {
            menuButtons.forEach((btn, index) => {
                const glowClass = btn.getAttribute('data-glow');
                if (index === this.selectedIndex) {
                    btn.classList.add('scale-105');
                    if (glowClass) btn.classList.add(glowClass);
                    
                    if (btn.id === 'main-original') {
                        btn.classList.replace('border-[#140a05]', 'border-[#6a351a]');
                        btn.classList.replace('bg-[#2b160b]', 'bg-[#402010]');
                    } else if (btn.id === 'main-sycamore') {
                        btn.classList.replace('border-[#1a0000]', 'border-red-600');
                        btn.classList.replace('bg-[#300000]', 'bg-[#4a0000]');
                    } else {
                        btn.classList.replace('border-[#020803]', 'border-green-900');
                        btn.classList.replace('bg-[#041207]', 'bg-[#08220d]');
                    }
                } else {
                    btn.classList.remove('scale-105');
                    if (glowClass) btn.classList.remove(glowClass);
                    
                    if (btn.id === 'main-original') {
                        btn.classList.replace('border-[#6a351a]', 'border-[#140a05]');
                        btn.classList.replace('bg-[#402010]', 'bg-[#2b160b]');
                    } else if (btn.id === 'main-sycamore') {
                        btn.classList.replace('border-red-600', 'border-[#1a0000]');
                        btn.classList.replace('bg-[#4a0000]', 'bg-[#300000]');
                    } else {
                        btn.classList.replace('border-green-900', 'border-[#020803]');
                        btn.classList.replace('bg-[#08220d]', 'bg-[#041207]');
                    }
                }
            });

            if (scrollContainer) {
                const visibleCount = 5;
                const offsetIndex = Math.max(0, Math.min(this.selectedIndex - 2, menuButtons.length - visibleCount));
                
                // button height ~60px + space-y-6 (24px) = 84px total
                const scrollOffset = offsetIndex * 84;
                scrollContainer.style.transform = `translateY(-${scrollOffset}px)`;
            }
        };

        // Initialize state
        updateSelection();

        menuButtons.forEach((btn, index) => {
            btn.addEventListener('mouseenter', () => {
                if (!this.isOverlayOpen) {
                    UISoundManager.playSelect();
                    this.selectedIndex = index;
                    updateSelection();
                }
            });
            btn.addEventListener('click', () => {
                if (!this.isOverlayOpen) {
                    this.handleMenuClick(btn.id);
                }
            });
        });

        const closeOriginalBtn = this.container.querySelector('#close-original');
        closeOriginalBtn?.addEventListener('click', () => this.closeAllOverlays());

        const closeSycamoreBtn = this.container.querySelector('#close-sycamore');
        closeSycamoreBtn?.addEventListener('click', () => this.closeAllOverlays());

        const closeCreditsBtn = this.container.querySelector('#close-credits');
        closeCreditsBtn?.addEventListener('click', () => this.closeAllOverlays());

        // Global Keyboard Event
        this.keyboardListener = (e: KeyboardEvent) => {
            // Verify if MainMenu is active in DOM
            if (this.container.classList.contains('hidden') || !this.isVisible) return;

            if (this.isOverlayOpen) {
                if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                    this.closeAllOverlays();
                }
                return;
            }

            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                UISoundManager.playSelect();
                this.selectedIndex = (this.selectedIndex + 1) % menuButtons.length;
                updateSelection();
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                UISoundManager.playSelect();
                this.selectedIndex = (this.selectedIndex - 1 + menuButtons.length) % menuButtons.length;
                updateSelection();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                menuButtons[this.selectedIndex].click();
            }
        };
        window.addEventListener('keydown', this.keyboardListener);
    }

    private handleMenuClick(id: string) {
        UISoundManager.playConfirm();
        switch (id) {
            case 'main-new-game':
                this.hide(() => this.onNewGame());
                break;
            case 'main-load-game':
                this.onLoadGame();
                break;
            case 'main-online':
                console.log("Modo Online clicked");
                break;
            case 'main-settings':
                this.onSettings();
                break;
            case 'main-original': {
                this.isOverlayOpen = true;
                this.scene.sound.pauseAll(); // Pausa a música de fundo
                const originalOverlay = this.container.querySelector('#original-overlay');
                const originalIframeWrapper = this.container.querySelector('#original-iframe-wrapper');
                if (originalOverlay && originalIframeWrapper) {
                    originalOverlay.classList.remove('hidden');
                    originalOverlay.classList.add('flex');
                    originalIframeWrapper.innerHTML = '<iframe src="https://caio-oliveiraa.github.io/whiper-valley/" class="w-full h-full border-none" allow="autoplay; fullscreen"></iframe>';
                }
                break;
            }
            case 'main-sycamore': {
                this.isOverlayOpen = true;
                this.scene.sound.pauseAll(); // Pausa a música de fundo
                const sycamoreOverlay = this.container.querySelector('#sycamore-overlay');
                const sycamoreIframeWrapper = this.container.querySelector('#sycamore-iframe-wrapper');
                if (sycamoreOverlay && sycamoreIframeWrapper) {
                    sycamoreOverlay.classList.remove('hidden');
                    sycamoreOverlay.classList.add('flex');
                    sycamoreIframeWrapper.innerHTML = '<iframe src="https://sycamore-valley-game.vercel.app/" class="w-full h-full border-none" allow="autoplay; fullscreen"></iframe>';
                }
                break;
            }
            case 'main-credits': {
                this.isOverlayOpen = true;
                const creditsOverlay = this.container.querySelector('#credits-overlay');
                if (creditsOverlay) {
                    creditsOverlay.classList.remove('hidden');
                    creditsOverlay.classList.add('flex');
                }
                break;
            }
        }
    }

    private closeAllOverlays() {
        UISoundManager.playSelect();
        
        if (this.isOverlayOpen) {
            this.scene.sound.resumeAll(); // Retoma a música de fundo
        }
        this.isOverlayOpen = false;
        
        const originalOverlay = this.container.querySelector('#original-overlay');
        const originalIframeWrapper = this.container.querySelector('#original-iframe-wrapper');
        if (originalOverlay && originalIframeWrapper) {
            originalOverlay.classList.add('hidden');
            originalOverlay.classList.remove('flex');
            originalIframeWrapper.innerHTML = '';
        }

        const sycamoreOverlay = this.container.querySelector('#sycamore-overlay');
        const sycamoreIframeWrapper = this.container.querySelector('#sycamore-iframe-wrapper');
        if (sycamoreOverlay && sycamoreIframeWrapper) {
            sycamoreOverlay.classList.add('hidden');
            sycamoreOverlay.classList.remove('flex');
            sycamoreIframeWrapper.innerHTML = '';
        }

        const creditsOverlay = this.container.querySelector('#credits-overlay');
        if (creditsOverlay) {
            creditsOverlay.classList.add('hidden');
            creditsOverlay.classList.remove('flex');
        }
    }

    public destroy(): void {
        if (this.keyboardListener) {
            window.removeEventListener('keydown', this.keyboardListener);
            this.keyboardListener = null;
        }
        super.destroy();
    }
}
