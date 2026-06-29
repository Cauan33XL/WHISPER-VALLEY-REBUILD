import Phaser from 'phaser';
import PauseMenuUI from '../ui/PauseMenuUI';
import InventoryUI from '../ui/InventoryUI';
import SaveSlotUI from '../save/SaveSlotUI';
import SaveManager from '../save/SaveManager';

export default class UIScene extends Phaser.Scene {
  
  // Pause Menu DOM
  private pauseMenuUI!: PauseMenuUI;
  private isPaused: boolean = false;

  // Save / Load
  private saveSlotUI!: SaveSlotUI;

  // Inventory DOM
  private backpackBtn!: Phaser.GameObjects.Image;
  private inventoryUI!: InventoryUI;
  private isInvOpen: boolean = false;
  private itemsData: {nome: string, texture: string}[] = [];

  // Notifications
  private notifBg!: Phaser.GameObjects.Graphics;
  private notifText!: Phaser.GameObjects.Text;
  private notifTimer?: Phaser.Time.TimerEvent;

  // Health Bar
  private healthBarBg!: Phaser.GameObjects.Graphics;
  private healthBarFill!: Phaser.GameObjects.Graphics;
  private hpBarW = 180;
  private hpBarH = 20;

  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    // 1. Botão de Configurações (Engrenagem Pixel Art verde) no canto superior direito
    const gearContainer = this.add.dom(this.cameras.main.width - 50, 50).createFromHTML(`
      <div id="gear-settings-btn" style="cursor:pointer; width:44px; height:44px; display:flex; align-items:center; justify-content:center; filter: drop-shadow(0 0 6px rgba(34,197,94,0.5)); transition: transform 0.3s ease, filter 0.3s ease;">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 16 16" shape-rendering="crispEdges">
          <rect x="6" y="0" width="4" height="2" fill="#22c55e"/>
          <rect x="6" y="14" width="4" height="2" fill="#22c55e"/>
          <rect x="0" y="6" width="2" height="4" fill="#22c55e"/>
          <rect x="14" y="6" width="2" height="4" fill="#22c55e"/>
          <rect x="2" y="2" width="2" height="2" fill="#22c55e"/>
          <rect x="12" y="2" width="2" height="2" fill="#22c55e"/>
          <rect x="2" y="12" width="2" height="2" fill="#22c55e"/>
          <rect x="12" y="12" width="2" height="2" fill="#22c55e"/>
          <rect x="4" y="2" width="8" height="2" fill="#16a34a"/>
          <rect x="4" y="12" width="8" height="2" fill="#16a34a"/>
          <rect x="2" y="4" width="2" height="8" fill="#16a34a"/>
          <rect x="12" y="4" width="2" height="8" fill="#16a34a"/>
          <rect x="4" y="4" width="8" height="8" fill="#15803d"/>
          <rect x="6" y="6" width="4" height="4" fill="#052e16"/>
        </svg>
      </div>
    `);
    gearContainer.setScrollFactor(0).setDepth(100);

    const gearEl = gearContainer.getChildByID('gear-settings-btn') as HTMLElement;
    if (gearEl) {
      gearEl.addEventListener('mouseenter', () => {
        gearEl.style.transform = 'rotate(90deg) scale(1.15)';
        gearEl.style.filter = 'drop-shadow(0 0 12px rgba(34,197,94,0.8))';
      });
      gearEl.addEventListener('mouseleave', () => {
        gearEl.style.transform = 'rotate(0deg) scale(1)';
        gearEl.style.filter = 'drop-shadow(0 0 6px rgba(34,197,94,0.5))';
      });
      gearEl.addEventListener('click', () => this.togglePauseMenu());
    }

    // 2. Botão da Mochila
    this.backpackBtn = this.add.image(90, 58, 'mochila').setDisplaySize(44, 44)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(100);
    this.backpackBtn.on('pointerdown', () => this.toggleInventory());

    // Escuta tecla ESC para pausar/despausar
    this.input.keyboard?.on('keydown-ESC', () => {
      // Se inventário estiver aberto, fecha o inventário
      if (this.isInvOpen) {
        this.toggleInventory();
        return;
      }
      // Se mini mapa expandido estiver aberto, GameScene já trata o ESC
      const gs = this.scene.get('GameScene');
      if ((gs as any).bigMinimapOpen) return;
      this.togglePauseMenu();
    });

    // Escuta evento de coleta de item (pode vir do GameScene)
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('item-coletado', (itens: {nome: string, texture: string}[], itemName: string) => {
      this.itemsData = itens;
      this.showNotification(`Você encontrou: ${itemName}`);
      this.updateInventoryView();
    });

    this.createPauseMenu();
    this.saveSlotUI = new SaveSlotUI(this, {
      onClose: () => {
        this.togglePauseMenu();
      },
      onSaveCompleted: (slot) => {
        const gs = this.scene.get('GameScene') as any;
        const data = gs.getSaveData();
        SaveManager.save(slot, data);
        this.showNotification(`Save salvo no Slot ${slot + 1}!`);
      },
      onLoadSelected: (_slot, data) => {
        const gs = this.scene.get('GameScene') as any;
        gs.applySaveData(data);
        this.showNotification('Jogo carregado!');
        this.resumeAfterLoad();
      },
    });
    this.createInventoryUI();
    this.createNotificationUI();
    this.createHealthBar();
    this.inventoryUI.updateItems(this.itemsData); // Initialize empty state
  }

  update() {
    this.updateHealthBar();
  }

  private resumeAfterLoad() {
    this.isPaused = false;
    this.scene.resume('GameScene');
  }

  private togglePauseMenu() {
    if (this.isInvOpen) this.toggleInventory(); // Fecha inventário se estiver aberto

    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.scene.pause('GameScene');
      this.pauseMenuUI.show();
    } else {
      this.scene.resume('GameScene');
      this.pauseMenuUI.hide();
    }
  }

  private createPauseMenu() {
      this.pauseMenuUI = new PauseMenuUI(this, this, {
          onResume: () => {
              this.togglePauseMenu();
          },
          onSettings: () => {
              this.showNotification('Configurações em breve...');
          },
          onSave: () => {
              this.isPaused = false;
              this.scene.resume('GameScene');
              this.saveSlotUI.show('save');
          },
          onLoad: () => {
              this.isPaused = false;
              this.scene.resume('GameScene');
              this.saveSlotUI.show('load');
          },
          onMainMenu: () => {
              this.isPaused = false;
              this.scene.stop('GameScene');
              this.scene.start('PreloadScene');
          }
      });
  }

  private toggleInventory() {
    if (this.isPaused) return; // Não abre inventário se pausado

    this.isInvOpen = !this.isInvOpen;
    
    if (this.isInvOpen) {
      this.scene.pause('GameScene'); // Pausa o jogo ao ver o inventário
      this.inventoryUI.show();
    } else {
      this.scene.resume('GameScene');
      this.inventoryUI.hide();
    }
  }

  private createInventoryUI() {
      this.inventoryUI = new InventoryUI(this, this, {
          onClose: () => {
              this.toggleInventory();
          }
      });
  }

  private updateInventoryView() {
      this.inventoryUI.updateItems(this.itemsData);
  }

  private createNotificationUI() {
    this.notifBg = this.add.graphics();
    this.notifBg.setDepth(3000).setVisible(false);
    
    this.notifText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 80, '', {
      font: '20px monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(3001).setVisible(false);
  }

  private createHealthBar() {
    const margin = 10;
    const bx = margin;
    const by = this.cameras.main.height - margin - this.hpBarH;

    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 0.8);
    this.healthBarBg.fillRect(bx, by, this.hpBarW, this.hpBarH);
    this.healthBarBg.lineStyle(2, 0xffffff, 0.6);
    this.healthBarBg.strokeRect(bx, by, this.hpBarW, this.hpBarH);
    this.healthBarBg.setDepth(2000);

    this.healthBarFill = this.add.graphics();
    this.healthBarFill.setDepth(2001);

    this.add.text(bx + 4, by - 18, 'HP', {
      font: '14px monospace',
      color: '#ffffff'
    }).setDepth(2002);
  }

  private updateHealthBar() {
    const gameScene = this.scene.get('GameScene') as any;
    const player = gameScene?.player;
    if (!player) return;

    const margin = 10;
    const bx = margin;
    const by = this.cameras.main.height - margin - this.hpBarH;
    const ratio = player.hp / player.maxHp;

    this.healthBarFill.clear();

    const color = ratio > 0.5 ? 0x22c55e : ratio > 0.25 ? 0xeab308 : 0xef4444;
    this.healthBarFill.fillStyle(color, 1);
    this.healthBarFill.fillRect(bx + 2, by + 2, (this.hpBarW - 4) * ratio, this.hpBarH - 4);
  }

  private showNotification(texto: string) {
    const cx = this.cameras.main.width;
    const cy = this.cameras.main.height;
    const largura = 500;
    const altura = 60;
    const px = cx / 2 - largura / 2;
    const py = cy - altura - 50;

    this.notifBg.clear();
    this.notifBg.fillStyle(0x3E2723, 0.9);
    this.notifBg.fillRect(px, py, largura, altura);
    this.notifBg.lineStyle(2, 0x0B2545);
    this.notifBg.strokeRect(px, py, largura, altura);
    
    this.notifBg.setVisible(true);
    
    this.notifText.setText(texto);
    this.notifText.setPosition(cx / 2, py + altura / 2);
    this.notifText.setVisible(true);

    if (this.notifTimer) this.notifTimer.remove(false);

    this.notifTimer = this.time.addEvent({
      delay: 2500,
      callback: () => {
        this.notifBg.setVisible(false);
        this.notifText.setVisible(false);
      }
    });
  }
}
