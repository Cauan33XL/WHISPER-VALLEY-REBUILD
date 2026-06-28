import Phaser from 'phaser';

export default class FinalScene extends Phaser.Scene {
  private inventoryItens: string[] = [];
  
  private cenasBom = [
    { imagem: "cena-14", falas: ["Ethan: Mas o quê?! Sumiram!", ".", "Ethan: Onde estão...? Os pedestais? As estátuas?", ".", "Ethan: Isto não está certo. De jeito nenhum."] },
    { imagem: "cena-15", falas: [".", "Líder da Seita: Você chegou, viajante. O momento da oferenda se aproxima.", ".", "Ethan: O quê...? Quem são vocês?! Fiquem longe de mim!", ".", "Membro da Seita: O Abraxas aguarda. Sua alma será uma dádiva.", ".", "Ethan: Dádiva? Não! Eu não serei sacrifício para ninguém!", ".", "Líder da Seita: Tola resistência.", ".", "(Ethan, desesperado, saca o talismã que havia pego.)", ".", "(Ele o ergue, e uma luz surge dele)", ".", "(desorientando os membros da seita por um breve momento.)", ".", "Membro da Seita: O que é isso?!", ".", "Líder da Seita: Peguem-no! Não o deixem escapar!"] },
    { imagem: "cena-16", falas: [".", "(Aproveitando a confusão)", ".", "( Ethan se vira e corre, desaparecendo rapidamente entre as árvores da floresta.)", ".", "(enquanto os gritos da seita ficam para trás.)"] }
  ];

  private cenasRuim = [
    { imagem: "cena-11", falas: ["Ethan: Mas o quê?! Sumiram!", ".", "Ethan: Onde estão...? Os pedestais? As estátuas?", ".", "Ethan: Isto não está certo. De jeito nenhum."] },
    { imagem: "cena-12", falas: [".", "Líder da Seita: Você chegou, Ethan. No momento certo.", ".", "Ethan: Quem... quem são vocês?! Fiquem longe!", ".", "Membro da Seita: O Abraxas espera. Sua chegada é um sinal.", ".", "Ethan: Sinal de quê?! Não! Eu não tenho nada a ver com isso!", ".", "Ethan: Deixem-me ir!", ".", "Líder da Seita: O sacrifício é necessário. Uma honra.", ".", "Ethan: Sacrifício?! Não! Eu me recuso!", ".", "(Os membros da seita avançam rapidamente sobre Ethan.)", ".", "Ethan: Não! Soltem-me! Eu não quero! NÃO!"] },
    { imagem: "cena-13", falas: [".", "(Gritos de Ethan são abafados enquanto ele é levado para o fogo.)", "Líder da Seita: A oferenda foi aceita. Glória a Abraxas."] }
  ];

  private bgImage?: Phaser.GameObjects.Image;
  private dialogBox?: Phaser.GameObjects.Graphics;
  private dialogText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;

  private currentSequence: any[] = [];
  private currentIndex = 0;
  private currentFalaIndex = 0;
  private isGoodEnding = false;
  private isFinished = false;

  constructor() {
    super('FinalScene');
  }

  init(data: { inventory: string[] }) {
    this.inventoryItens = data.inventory || [];
  }

  preload() {
    // Carregar imagens do final (usando fallback por segurança caso as imagens originais faltem no dev)
    this.load.image('cena-11', 'assets/cena-11.png');
    this.load.image('cena-12', 'assets/cena-12.png');
    this.load.image('cena-13', 'assets/cena-13.png');
    this.load.image('cena-14', 'assets/cena-14.png');
    this.load.image('cena-15', 'assets/cena-15.png');
    this.load.image('cena-16', 'assets/cena-16.png');
  }

  create() {
    this.isGoodEnding = this.inventoryItens.includes('Relíquia');
    this.currentSequence = this.isGoodEnding ? this.cenasBom : this.cenasRuim;
    this.currentIndex = 0;
    this.currentFalaIndex = 0;
    this.isFinished = false;

    const width = this.scale.width;
    const height = this.scale.height;

    this.bgImage = this.add.image(0, 0, '').setOrigin(0, 0);

    this.dialogBox = this.add.graphics();
    this.dialogText = this.add.text(50, height - 140, '', {
      font: '20px monospace',
      color: '#ffffff',
      wordWrap: { width: width - 100 }
    });

    this.promptText = this.add.text(width - 35, height - 40, 'ESPAÇO para avançar', {
      font: '18px monospace',
      color: '#ffffff'
    }).setOrigin(1, 1);

    this.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 800
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.advance();
    });

    this.renderCurrentScene();
  }

  advance() {
    if (this.isFinished) {
      // Reload page para resetar tudo
      window.location.reload();
      return;
    }

    const current = this.currentSequence[this.currentIndex];
    if (this.currentFalaIndex < current.falas.length - 1) {
      this.currentFalaIndex++;
      this.renderCurrentScene();
    } else {
      this.currentIndex++;
      this.currentFalaIndex = 0;
      if (this.currentIndex >= this.currentSequence.length) {
        this.showFinalScreen();
      } else {
        this.renderCurrentScene();
      }
    }
  }

  renderCurrentScene() {
    const current = this.currentSequence[this.currentIndex];

    const width = this.scale.width;
    const height = this.scale.height;

    // Carregar background
    this.bgImage?.setTexture(current.imagem);
    this.bgImage?.setDisplaySize(width, height);

    // Dialog Box
    const margem = 30;
    const caixaAltura = 120;
    this.dialogBox?.clear();
    this.dialogBox?.fillStyle(0x000000, 0.7);
    this.dialogBox?.fillRect(margem, height - caixaAltura - margem, width - margem * 2, caixaAltura);
    this.dialogBox?.lineStyle(2, 0xffffff);
    this.dialogBox?.strokeRect(margem, height - caixaAltura - margem, width - margem * 2, caixaAltura);

    const fala = current.falas[this.currentFalaIndex];
    this.dialogText?.setText(fala);
  }

  showFinalScreen() {
    const width = this.scale.width;
    const height = this.scale.height;
    
    this.isFinished = true;
    this.bgImage?.setVisible(false);
    this.dialogBox?.clear();
    this.dialogText?.setText('');
    this.promptText?.setText('Pressione "ESPAÇO" para jogar de novo');

    if (this.isGoodEnding) {
      const mensagem = "Depois de retornar, Ethan publica sua matéria, mas ninguém acredita em sua história.\nO mundo a trata como uma obra de ficção.\nPor causa do fracasso da publicação, ele é demitido do jornal e\npermanece como o único vivo que conhece a verdade sobre Whisper Valley.";
      
      this.add.text(width / 2, height / 2 - 100, mensagem, { font: '20px monospace', color: '#ffffff', align: 'center' }).setOrigin(0.5);
      this.add.text(width / 2, height / 2 + 80, "Fim! Você fez o final bom?!", { font: '28px monospace', color: '#ffffff', align: 'center' }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height / 2 - 20, "Fim!", { font: '28px monospace', color: '#ffffff', align: 'center' }).setOrigin(0.5);
      this.add.text(width / 2, height / 2 + 20, "Você fez o final ruim!", { font: '20px monospace', color: '#ffffff', align: 'center' }).setOrigin(0.5);
    }
  }
}
