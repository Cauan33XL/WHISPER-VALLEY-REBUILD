import Phaser from 'phaser';
import DOMUIComponent from './DOMUIComponent';
import UISoundManager from '../systems/UISoundManager';

export default class InventoryUI extends DOMUIComponent {
    private onClose: () => void;
    private items: { nome: string, texture: string }[] = [];

    constructor(
        scene: Phaser.Scene,
        uiScene: Phaser.Scene,
        callbacks: {
            onClose: () => void
        }
    ) {
        super(scene, uiScene, 'inventory-menu-overlay');
        this.onClose = callbacks.onClose;
        this.createUI();
    }

    private createUI(): void {
        this.container.className = 'absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-50 overflow-hidden hidden pointer-events-auto';

        this.container.innerHTML = `
            <div class="relative z-20 flex flex-col items-center w-full max-w-2xl h-[60vh] max-h-[600px] p-6 bg-green-950/90 border border-green-800/80 rounded shadow-[0_0_30px_rgba(0,0,0,0.95)]">
                
                <!-- Cabeçalho -->
                <div class="flex justify-between items-center w-full border-b border-green-800 pb-3 mb-6">
                    <h2 class="text-xl font-pixel font-bold text-white tracking-widest text-shadow">MOCHILA DE ETHAN</h2>
                    <button id="inv-close" class="text-xs font-pixel text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-red-950/50 hover:bg-red-900/50 px-3 py-1 rounded border border-red-900/50">X</button>
                </div>

                <!-- Grid de Itens -->
                <div id="inv-grid" class="w-full flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 content-start pr-2 custom-scrollbar">
                    <!-- Itens serão injetados aqui -->
                </div>
                
                <!-- Empty State -->
                <div id="inv-empty" class="absolute inset-0 flex items-center justify-center pointer-events-none hidden">
                    <p class="text-slate-400 font-pixel text-sm">A mochila está vazia.</p>
                </div>
            </div>
        `;

        // Add custom scrollbar styles dynamically for inventory
        const style = document.createElement('style');
        style.innerHTML = `
            .custom-scrollbar::-webkit-scrollbar { width: 8px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(30, 80, 50, 0.8); border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(40, 100, 60, 1); }
        `;
        this.container.appendChild(style);

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const closeBtn = this.container.querySelector('#inv-close');
        closeBtn?.addEventListener('click', () => {
            UISoundManager.playClose();
            this.hide(() => this.onClose());
        });
    }

    public updateItems(items: { nome: string, texture: string }[]): void {
        this.items = items;
        const grid = this.container.querySelector('#inv-grid');
        const emptyState = this.container.querySelector('#inv-empty');

        if (!grid || !emptyState) return;

        grid.innerHTML = ''; // Clear current

        if (this.items.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            
            this.items.forEach(item => {
                const itemDiv = document.createElement('div');
                // Path resolution logic since Phaser assets are now in public/assets
                let imagePath: string;
                if (item.texture === 'chave') imagePath = '/assets/itens/chave.png';
                else if (item.texture === 'lanterna') imagePath = '/assets/itens/lanterna.png';
                else if (item.texture === 'caderno') imagePath = '/assets/itens/caderno.png';
                // Add fallback or generic resolution if needed
                else imagePath = `/assets/itens/${item.texture}.png`;

                itemDiv.className = 'group flex flex-col items-center justify-center p-3 bg-black/60 border border-green-900/50 hover:border-green-600 hover:bg-green-900/40 rounded transition-all cursor-help relative';
                itemDiv.innerHTML = `
                    <img src="${imagePath}" alt="${item.nome}" class="w-12 h-12 object-contain filter drop-shadow-md group-hover:scale-110 transition-transform pixelated" onerror="this.src='/assets/itens/default.png'" />
                    <span class="mt-2 text-[10px] font-pixel text-slate-300 group-hover:text-green-300 text-center truncate w-full" title="${item.nome}">${item.nome}</span>
                    
                    <!-- Tooltip Nativo Tailwind -->
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity font-pixel border border-green-800">
                        ${item.nome}
                    </div>
                `;
                grid.appendChild(itemDiv);
            });
        }
    }
}
