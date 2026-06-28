import Phaser from 'phaser';
import Player from './Player';

export class Item extends Phaser.GameObjects.Image {
  public nome: string;
  public coletado = false;
  private promptText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, nome: string, texture: string) {
    super(scene, x, y, texture);
    this.nome = nome;
    
    // Configurações do item
    this.setDisplaySize(48, 48);
    scene.add.existing(this);

    // Texto flutuante de dica
    this.promptText = scene.add.text(x, y - 50, 'ESPAÇO para coletar', {
      font: '16px monospace',
      color: '#ffffff',
      backgroundColor: '#00000088'
    }).setOrigin(0.5).setVisible(false);
  }

  update(player: Player, spaceKey: Phaser.Input.Keyboard.Key, inventory: Inventory) {
    if (this.coletado) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    
    if (dist < 120) {
      this.promptText.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this.coletar(inventory);
      }
    } else {
      this.promptText.setVisible(false);
    }
  }

  private coletar(inventory: Inventory) {
    this.coletado = true;
    this.setVisible(false);
    this.promptText.setVisible(false);
    inventory.adicionarItem(this.nome);
  }
}

export class Inventory {
  public itens: string[] = [];
  public visivel = false;
  
  private scene: Phaser.Scene;
  private btnImage: Phaser.GameObjects.Image;
  private bgBox: Phaser.GameObjects.Graphics;
  private titleText: Phaser.GameObjects.Text;
  private itemsText: Phaser.GameObjects.Text;
  private notificationText: Phaser.GameObjects.Text;
  private notificationBg: Phaser.GameObjects.Graphics;
  private notificationTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Botão de mochila
    this.btnImage = scene.add.image(50, 50, 'mochila').setDisplaySize(44, 44);
    this.btnImage.setScrollFactor(0);
    this.btnImage.setDepth(2000);
    this.btnImage.setInteractive({ useHandCursor: true });
    this.btnImage.on('pointerdown', () => this.toggle());

    // Painel do Inventário
    this.bgBox = scene.add.graphics();
    this.bgBox.setScrollFactor(0);
    this.bgBox.setDepth(2001);
    this.bgBox.setVisible(false);

    this.titleText = scene.add.text(scene.cameras.main.width / 2, scene.cameras.main.height / 2 - 90, 'Mochila', {
      font: '22px monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2002).setVisible(false);

    this.itemsText = scene.add.text(scene.cameras.main.width / 2 - 170, scene.cameras.main.height / 2 - 50, '', {
      font: '18px monospace',
      color: '#ffffff',
      align: 'left'
    }).setScrollFactor(0).setDepth(2002).setVisible(false);

    // Notificação
    this.notificationBg = scene.add.graphics();
    this.notificationBg.setScrollFactor(0);
    this.notificationBg.setDepth(3000);
    this.notificationBg.setVisible(false);
    
    this.notificationText = scene.add.text(scene.cameras.main.width / 2, scene.cameras.main.height - 80, '', {
      font: '18px monospace',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3001).setVisible(false);
  }

  toggle() {
    this.visivel = !this.visivel;
    
    if (this.visivel) {
      const cx = this.scene.cameras.main.width;
      const cy = this.scene.cameras.main.height;
      const largura = 400;
      const altura = 250;
      const px = (cx - largura) / 2;
      const py = (cy - altura) / 2;

      this.bgBox.clear();
      this.bgBox.fillStyle(0x000000, 0.85);
      this.bgBox.fillRect(px, py, largura, altura);
      this.bgBox.lineStyle(2, 0xffffff);
      this.bgBox.strokeRect(px, py, largura, altura);
      this.bgBox.setVisible(true);

      this.titleText.setPosition(cx / 2, cy / 2 - 90);
      this.titleText.setVisible(true);

      let text = '';
      if (this.itens.length === 0) {
        text = 'Vazia';
      } else {
        text = this.itens.map(item => `• ${item}`).join('\n');
      }
      this.itemsText.setText(text);
      this.itemsText.setPosition(cx / 2 - 170, cy / 2 - 50);
      this.itemsText.setVisible(true);

    } else {
      this.bgBox.setVisible(false);
      this.titleText.setVisible(false);
      this.itemsText.setVisible(false);
    }
  }

  adicionarItem(nome: string) {
    this.itens.push(nome);
    this.mostrarNotificacao(`Você coletou: ${nome}`);
  }

  mostrarNotificacao(texto: string) {
    const cx = this.scene.cameras.main.width;
    const cy = this.scene.cameras.main.height;
    const largura = 500;
    const altura = 100;
    const px = (cx - largura) / 2;
    const py = cy - altura - 30;

    this.notificationBg.clear();
    this.notificationBg.fillStyle(0x000000, 0.85);
    this.notificationBg.fillRect(px, py, largura, altura);
    this.notificationBg.lineStyle(2, 0xffffff);
    this.notificationBg.strokeRect(px, py, largura, altura);
    
    this.notificationBg.setVisible(true);
    
    this.notificationText.setText(texto);
    this.notificationText.setPosition(cx / 2, cy - 80);
    this.notificationText.setVisible(true);

    if (this.notificationTimer) this.notificationTimer.remove(false);

    this.notificationTimer = this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.notificationBg.setVisible(false);
        this.notificationText.setVisible(false);
      }
    });
  }
}
