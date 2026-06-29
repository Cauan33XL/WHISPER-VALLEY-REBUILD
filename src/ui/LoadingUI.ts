import Phaser from 'phaser';
import DOMUIComponent from './DOMUIComponent';

export default class LoadingUI extends DOMUIComponent {
    private progressBar!: HTMLDivElement;
    private progressText!: HTMLDivElement;
    private statusText!: HTMLDivElement;

    constructor(scene: Phaser.Scene) {
        // Usa um ID único para o loading
        super(scene, null, 'loading-ui-overlay');
        this.createUI();
        this.show();
    }

    private createUI(): void {
        this.container.className = 'absolute inset-0 flex flex-col items-center justify-center bg-black z-[100] overflow-hidden pointer-events-none transition-opacity duration-1000';
        
        this.container.innerHTML = `
            <!-- Fundo de Neblina Sombria (Radial Gradient) -->
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#051a08] via-black to-black opacity-90 pointer-events-none"></div>
            
            <!-- Símbolo Cultista Central -->
            <div class="relative z-20 mb-12 flex flex-col items-center justify-center">
                <!-- Círculo pulsante -->
                <div class="w-32 h-32 rounded-full border border-green-900/40 flex items-center justify-center animate-spin-slow">
                    <div class="w-24 h-24 rounded-full border-2 border-green-700/30 flex items-center justify-center relative">
                        <div class="w-16 h-16 bg-green-900/20 blur-xl rounded-full absolute"></div>
                        <!-- Triângulo oculto ou runa (Feito em CSS) -->
                        <div class="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-green-800 opacity-60"></div>
                    </div>
                </div>
            </div>

            <!-- Informação de Carregamento -->
            <div class="relative z-20 flex flex-col items-center space-y-6 w-full max-w-md px-8">
                <!-- Status -->
                <div id="loading-status" class="text-green-600 font-pixel text-xl tracking-[0.2em] uppercase text-shadow-sm opacity-80">
                    ADENTRANDO A NEBLINA...
                </div>
                
                <!-- Barra de Progresso Container -->
                <div class="w-full h-1 bg-gray-900 rounded-full overflow-hidden border border-[#020803] relative">
                    <!-- Barra Interna -->
                    <div id="loading-progress-bar" class="h-full bg-green-700 w-0 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(21,128,61,0.8)]"></div>
                </div>
                
                <!-- Porcentagem -->
                <div id="loading-percentage" class="text-green-800 font-mono text-xs tracking-widest mt-2 opacity-50">
                    0%
                </div>
            </div>

            <!-- Detalhe decorativo estilo found footage -->
            <div class="absolute bottom-6 left-6 text-[10px] font-mono text-green-900/40 tracking-tighter pointer-events-none">
                REC • // WHISPER_VALLEY_FILES_
            </div>
        `;

        this.progressBar = this.container.querySelector('#loading-progress-bar') as HTMLDivElement;
        this.progressText = this.container.querySelector('#loading-percentage') as HTMLDivElement;
        this.statusText = this.container.querySelector('#loading-status') as HTMLDivElement;
    }

    public updateProgress(value: number) {
        if (this.progressBar) this.progressBar.style.width = `${value * 100}%`;
        if (this.progressText) this.progressText.innerText = `${Math.round(value * 100)}%`;
        
        if (value > 0.4 && value < 0.7) {
            if (this.statusText) this.statusText.innerText = 'ATRAVESSANDO A FLORESTA...';
        } else if (value >= 0.7 && value < 0.99) {
            if (this.statusText) this.statusText.innerText = 'AS VOZES SE APROXIMAM...';
        } else if (value >= 0.99) {
            if (this.statusText) this.statusText.innerText = 'BEM-VINDO.';
        }
    }

    public async finish(): Promise<void> {
        // Garante que mostre 100%
        this.updateProgress(1);
        
        // Pausa dramática para o jogador ler a última frase ("BEM-VINDO.")
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (this.container) {
            // Inicia o fade out (a classe transition-opacity duration-1000 faz isso durar 1s)
            this.container.style.opacity = '0';
            
            // Aguarda o fim do fade
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.destroy();
        }
    }
}
