import Phaser from 'phaser';
import Player from './Player';
import UISoundManager from '../systems/UISoundManager';

export default class NPC extends Phaser.Physics.Arcade.Image {
  private dialogSequences: string[][];
  private sequenceIndex = 0;
  private falas: string[] = [];
  private indiceFala = 0;
  public interagindo = false;
  
  private promptText: Phaser.GameObjects.Text;
  private shadow: Phaser.GameObjects.Ellipse;
  private dialogBox: Phaser.GameObjects.Graphics;
  private dialogText: Phaser.GameObjects.Text;
  private continueText: Phaser.GameObjects.Text;
  
  private typingTimer?: Phaser.Time.TimerEvent;
  private isTyping = false;
  private fullText = "";

  // AI properties
  private anchorX: number;
  private anchorY: number;
  private wanderRadius = 150;
  private aiState: 'idle' | 'wandering' = 'idle';
  private stateTimer = Number.MAX_SAFE_INTEGER; // Não anda até ser abordado
  private targetX = 0;
  private targetY = 0;
  private hasSpoken = false; // Libera a IA após a primeira conversa

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, dialogSequences: string[][] = []) {
    super(scene, x, y, texture);
    this.dialogSequences = dialogSequences;
    this.falas = this.dialogSequences[this.sequenceIndex] || [];
    
    this.anchorX = x;
    this.anchorY = y;
    
    // Configurações do Sprite
    this.setOrigin(0.5, 1); // Centro horizontal, base nos pés
    
    // Calcula a escala com base numa altura ideal, um pouco maior que a do player
    const targetHeight = 195;
    const baseScale = targetHeight / this.height;
    
    // Deixa mais largo (45% extra) para ficarem mais proporcionais (mais grossos)
    const scaleX = baseScale * 1.45;
    const scaleY = baseScale;
    this.setScale(scaleX, scaleY);

    scene.add.existing(this);
    scene.physics.add.existing(this, false); // false = corpo dinâmico
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setImmovable(true);
      // Hitbox vertical: corpo inteiro do NPC (não só os pés)
      const hitW = this.width * 0.4;
      const hitH = this.height * 0.85;
      body.setSize(hitW, hitH);
      body.setOffset((this.width - hitW) / 2, this.height - hitH);
    }
    
    // Configura a profundidade baseada no Y dos pés
    this.setDepth(this.y);

    // Sombra no chão (posicionada nos pés, origin 0.5,1 = base)
    this.shadow = scene.add.ellipse(this.x, this.y - 5, 60, 25, 0x000000, 0.4);
    this.shadow.setDepth(this.depth - 1);

    // Texto flutuante de dica
    this.promptText = scene.add.text(this.x, this.y - this.displayHeight - 20, 'ESPAÇO para interagir', {
      font: '16px monospace',
      color: '#ffffff',
      backgroundColor: '#00000088'
    }).setOrigin(0.5).setVisible(false);

    // UI de Diálogo (fixa na tela da câmera)
    this.dialogBox = scene.add.graphics();
    this.dialogBox.setScrollFactor(0); // Fica fixo na tela
    this.dialogBox.setDepth(1000);
    this.dialogBox.setVisible(false);

    this.dialogText = scene.add.text(0, 0, '', {
      font: '18px monospace',
      color: '#ffffff',
      wordWrap: { width: 560 }
    });
    this.dialogText.setScrollFactor(0);
    this.dialogText.setDepth(1001);
    this.dialogText.setVisible(false);

    this.continueText = scene.add.text(0, 0, 'ESPAÇO para continuar', {
      font: '14px monospace',
      color: '#aaaaaa'
    });
    this.continueText.setScrollFactor(0);
    this.continueText.setDepth(1001);
    this.continueText.setVisible(false);
  }

  update(_time: number, delta: number, player: Player, spaceKey: Phaser.Input.Keyboard.Key) {
    const centerX = this.x;
    const centerY = this.y - this.displayHeight / 2;
    const dist = Phaser.Math.Distance.Between(centerX, centerY, player.x, player.y);
    
    if (dist < 200) {
      if (!this.interagindo) {
        this.promptText.setVisible(true);
      } else {
        this.promptText.setVisible(false);
      }

      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this.interagir(player);
      }
    } else {
      this.promptText.setVisible(false);
      if (this.interagindo) {
        this.fecharDialogo(player);
      }
    }
    
    this.updateAI(delta);
    
    // Atualiza a posição da sombra e do texto de dica (origin 0.5, 1 = base nos pés)
    this.shadow.setPosition(this.x, this.y - 5);
    this.shadow.setDepth(this.depth - 1);
    this.promptText.setPosition(this.x, this.y - this.displayHeight - 20);
  }

  private updateAI(delta: number) {
    if (this.interagindo || !this.body) {
      (this.body as Phaser.Physics.Arcade.Body)?.setVelocity(0);
      return;
    }

    // Só ativa a IA após o jogador ter conversado com o NPC ao menos uma vez
    if (!this.hasSpoken) return;

    if (this.aiState === 'idle') {
      this.stateTimer -= delta;
      if (this.stateTimer <= 0) {
        this.aiState = 'wandering';
        this.targetX = this.anchorX + (Math.random() * 2 - 1) * this.wanderRadius;
        this.targetY = this.anchorY + (Math.random() * 2 - 1) * this.wanderRadius;
        this.scene.physics.moveTo(this, this.targetX, this.targetY, 40);
      }
    } else if (this.aiState === 'wandering') {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
      if (dist < 10) {
        this.aiState = 'idle';
        this.stateTimer = 2000 + Math.random() * 3000;
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
      }
    }
    
    // Atualiza o Z-index dinamicamente baseado no Y dos pés
    this.setDepth(this.y);
  }

  private interagir(player: Player) {
    if (!this.interagindo) {
      // Inicia a interação
      UISoundManager.playOpen();
      this.interagindo = true;
      this.indiceFala = 0;
      this.mostrarCaixaDialogo();
      player.active = false; // Trava o player de se mover
      (player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
    } else {
      if (this.isTyping) {
        // Pula o efeito de digitação
        if (this.typingTimer) this.typingTimer.remove();
        this.dialogText.setText(this.fullText);
        this.isTyping = false;
        this.continueText.setVisible(true);
      } else {
        // Avança a fala
        this.indiceFala++;
        if (this.indiceFala >= this.falas.length) {
          this.fecharDialogo(player);
        } else {
          UISoundManager.playConfirm();
          this.mostrarCaixaDialogo();
        }
      }
    }
  }

  private mostrarCaixaDialogo() {
    const cx = this.scene.cameras.main.width;
    const cy = this.scene.cameras.main.height;
    
    const larguraCaixa = 600;
    const alturaCaixa = 110;
    const px = (cx - larguraCaixa) / 2;
    const py = cy - alturaCaixa - 30;

    this.dialogBox.clear();
    this.dialogBox.fillStyle(0x000000, 0.85);
    this.dialogBox.fillRect(px, py, larguraCaixa, alturaCaixa);
    this.dialogBox.lineStyle(2, 0xffffff);
    this.dialogBox.strokeRect(px, py, larguraCaixa, alturaCaixa);
    this.dialogBox.setVisible(true);

    this.fullText = this.falas[this.indiceFala];
    this.dialogText.setText('');
    this.dialogText.setPosition(px + 16, py + 16);
    this.dialogText.setVisible(true);

    this.continueText.setPosition(px + 16, py + alturaCaixa - 24);
    this.continueText.setVisible(false); // Oculta até terminar de digitar
    
    UISoundManager.setSpeakerFromText(this.fullText);
    
    if (this.typingTimer) this.typingTimer.remove();
    this.isTyping = true;
    let charIndex = 0;
    
    this.typingTimer = this.scene.time.addEvent({
        delay: 35,
        callback: () => {
            if (!this.isTyping) return;
            const char = this.fullText[charIndex];
            this.dialogText.text += char;
            if (char !== ' ') {
                UISoundManager.playTyping();
            }
            charIndex++;
            if (charIndex >= this.fullText.length) {
                this.isTyping = false;
                this.continueText.setVisible(true);
            }
        },
        repeat: this.fullText.length - 1
    });
  }

  getHasSpoken() { return this.hasSpoken; }
  setHasSpoken(v: boolean) { this.hasSpoken = v; }
  getSequenceIndex() { return this.sequenceIndex; }
  setSequenceIndex(v: number) { this.sequenceIndex = v; this.falas = this.dialogSequences[this.sequenceIndex] || []; }
  getAnchorX() { return this.anchorX; }
  getAnchorY() { return this.anchorY; }

  private fecharDialogo(player: Player) {
    if (this.typingTimer) this.typingTimer.remove();
    this.isTyping = false;
    UISoundManager.playClose();
    this.interagindo = false;
    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);
    this.continueText.setVisible(false);
    player.active = true; // Destrava o player
    this.hasSpoken = true; // Libera a IA para andar após a primeira conversa
    
    // Avança para a próxima sequência de falas (se houver) para a próxima vez que falar com ele
    if (this.sequenceIndex < this.dialogSequences.length - 1) {
        this.sequenceIndex++;
        this.falas = this.dialogSequences[this.sequenceIndex];
    }
  }
}
