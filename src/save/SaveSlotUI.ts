import SaveManager, { SaveData } from './SaveManager';

export default class SaveSlotUI {
  private container!: HTMLDivElement;
  private mode: 'save' | 'load' = 'save';
  private onClose: () => void;
  private onSaveCompleted: (slot: number) => void;
  private onLoadSelected: (slot: number, data: SaveData) => void;

  constructor(
    _scene: Phaser.Scene,
    callbacks: {
      onClose: () => void;
      onSaveCompleted: (slot: number) => void;
      onLoadSelected: (slot: number, data: SaveData) => void;
    }
  ) {
    this.onClose = callbacks.onClose;
    this.onSaveCompleted = callbacks.onSaveCompleted;
    this.onLoadSelected = callbacks.onLoadSelected;
    this.createContainer();
  }

  private createContainer() {
    const existing = document.getElementById('save-slot-overlay');
    if (existing?.parentNode) existing.parentNode.removeChild(existing);

    this.container = document.createElement('div');
    this.container.id = 'save-slot-overlay';
    this.container.className = 'absolute inset-0 z-50 pointer-events-none hidden';
    const gameContainer = document.getElementById('app') || document.body;
    gameContainer.appendChild(this.container);
  }

  show(mode: 'save' | 'load') {
    this.mode = mode;
    this.render();
    this.container.classList.remove('hidden', 'pointer-events-none');
    this.container.classList.add('pointer-events-auto');
  }

  hide() {
    this.container.classList.add('hidden', 'pointer-events-none');
    this.container.classList.remove('pointer-events-auto');
  }

  private render() {
    const slots = SaveManager.getAllSlots();
    const isSave = this.mode === 'save';

    let slotsHtml = slots.map((s, i) => {
      const exists = s.exists;
      const dateStr = exists ? new Date(s.timestamp).toLocaleString('pt-BR') : '— VAZIO —';

      let actions = '';
      if (isSave) {
        actions = `
          <button data-slot="${i}" data-action="save" class="text-xs py-2 px-4 font-pixel text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 rounded cursor-pointer transition-colors">
            ${exists ? 'SOBRESCREVER' : 'SALVAR'}
          </button>
          ${exists ? `<button data-slot="${i}" data-action="export" class="text-xs py-2 px-4 font-pixel text-slate-400 hover:text-slate-300 border border-slate-700 hover:border-slate-500 rounded cursor-pointer transition-colors">EXPORTAR</button>` : ''}
          ${exists ? `<button data-slot="${i}" data-action="delete" class="text-xs py-2 px-4 font-pixel text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 rounded cursor-pointer transition-colors">EXCLUIR</button>` : ''}
        `;
      } else {
        actions = `
          ${exists ? `<button data-slot="${i}" data-action="load" class="text-xs py-2 px-4 font-pixel text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 rounded cursor-pointer transition-colors">CARREGAR</button>` : '<span class="text-xs text-slate-600">—</span>'}
          ${exists ? `<button data-slot="${i}" data-action="export" class="text-xs py-2 px-4 font-pixel text-slate-400 hover:text-slate-300 border border-slate-700 hover:border-slate-500 rounded cursor-pointer transition-colors">EXPORTAR</button>` : ''}
          ${exists ? `<button data-slot="${i}" data-action="delete" class="text-xs py-2 px-4 font-pixel text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 rounded cursor-pointer transition-colors">EXCLUIR</button>` : ''}
        `;
      }

      return `
        <div class="flex items-center justify-between p-4 border border-green-900/50 rounded bg-black/60 ${exists ? 'hover:border-green-700/50' : 'opacity-60'} transition-colors">
          <div class="flex flex-col">
            <span class="font-pixel text-sm text-white">SLOT ${i + 1}</span>
            <span class="font-pixel text-xs text-slate-400 mt-1">${dateStr}</span>
          </div>
          <div class="flex gap-2">${actions}</div>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="absolute inset-0 bg-black/80 flex items-center justify-center">
        <div class="w-full max-w-2xl p-6 bg-black/80 border-2 border-green-900/40 rounded backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.9)]">
          <h2 class="text-2xl font-pixel text-white tracking-widest mb-6 text-center border-b border-green-800 pb-4">
            ${isSave ? 'SALVAR JOGO' : 'CARREGAR JOGO'}
          </h2>
          <div class="flex flex-col gap-3 mb-6">
            ${slotsHtml}
          </div>
          <div class="flex justify-center gap-4">
            <button id="slot-import" class="text-xs py-2 px-4 font-pixel text-cyan-400 hover:text-cyan-300 border border-cyan-800 hover:border-cyan-600 rounded cursor-pointer transition-colors">
              IMPORTAR SAVE
            </button>
            <button id="slot-back" class="text-xs py-2 px-4 font-pixel text-slate-400 hover:text-slate-300 border border-slate-700 hover:border-slate-500 rounded cursor-pointer transition-colors">
              VOLTAR
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupListeners();
  }

  private setupListeners() {
    this.container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const el = e.currentTarget as HTMLElement;
        const slot = parseInt(el.dataset.slot ?? '0', 10);
        const action = el.dataset.action;

        switch (action) {
          case 'save':
            this.onSaveCompleted(slot);
            this.hide();
            break;
          case 'load':
            {
              const data = SaveManager.load(slot);
              if (data) {
                this.onLoadSelected(slot, data);
                this.hide();
              }
            }
            break;
          case 'delete':
            if (confirm(`Excluir save do Slot ${slot + 1}?`)) {
              SaveManager.deleteSave(slot);
              this.render();
            }
            break;
          case 'export':
            SaveManager.exportSlot(slot);
            break;
        }
      });
    });

    this.container.querySelector('#slot-back')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    this.container.querySelector('#slot-import')?.addEventListener('click', async () => {
      const data = await SaveManager.readFile();
      if (!data) return;

      const slots = SaveManager.getAllSlots();
      const emptySlot = slots.find((s) => !s.exists);
      const targetSlot = emptySlot?.slot ?? 0;
      SaveManager.importData(data, targetSlot);
      this.render();
    });
  }
}
