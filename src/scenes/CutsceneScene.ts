import Phaser from 'phaser';
import { dialogos } from '../data/dialogos';
import type MainMenuUI from '../ui/MainMenuUI';
import UISoundManager from '../systems/UISoundManager';

export interface CutsceneConfig {
  type: 'image' | 'text';
  imageKey?: string;
  texts?: string[];
}

export interface CutsceneInitData {
  sequence?: CutsceneConfig[];
  nextScene?: string;
  isResume?: boolean;
}

const introSequence: CutsceneConfig[] = [
  { type: 'image', imageKey: 'logo' },
  { type: 'image', imageKey: 'instrucoes' },
  {
    type: 'text',
    texts: [
      "O protagonista, Ethan Graves, é um jornalista que costuma\n" +
      "se sair bem em suas matérias, mas tudo muda quando seu\n" +
      "melhor amigo, Miguel, desaparece misteriosamente em uma\n" +
      "floresta. Depois desse acontecimento, seu desempenho\n" +
      "cai e ele precisa escrever uma matéria urgente para o\n" +
      "jornal em que trabalha, caso contrário será demitido.\n" +
      "A mando de seu chefe, Ethan viaja para uma cidade\n" +
      "escondida entre as árvores, em busca de desvendar os\n" +
      "mistérios do lugar: Whisper Valley."
    ]
  },
  { type: 'image', imageKey: 'cena-1', texts: dialogos.cena1 },
  { type: 'image', imageKey: 'cena-2', texts: dialogos.cena2 },
  { type: 'image', imageKey: 'cena-3', texts: dialogos.cena3 },
  { type: 'image', imageKey: 'cena-4', texts: dialogos.cena4 },
];

export default class CutsceneScene extends Phaser.Scene {
  private cutsceneSequence: CutsceneConfig[] = [];
  private nextScene: string = 'GameScene';
  private isResume: boolean = false;
  private currentIndex = 0;
  private currentTextIndex = 0;

  private bgImage?: Phaser.GameObjects.Image;
  private dialogBox?: Phaser.GameObjects.Graphics;
  private dialogText?: Phaser.GameObjects.Text;
  private promptText?: Phaser.GameObjects.Text;
  
  private typeWriterEvent?: Phaser.Time.TimerEvent;
  private currentFullText = "";
  private currentTypedText = "";
  private backgroundMusic?: Phaser.Sound.BaseSound;

  constructor() {
    super('CutsceneScene');
  }

  init(data: CutsceneInitData = {}) {
    if (data.sequence) {
      this.cutsceneSequence = data.sequence;
    } else {
      this.cutsceneSequence = introSequence;
    }
    
    if (data.nextScene) {
      this.nextScene = data.nextScene;
    } else {
      this.nextScene = 'GameScene';
    }

    if (data.isResume !== undefined) {
      this.isResume = data.isResume;
    } else {
      this.isResume = false;
    }
  }

  create() {
    this.scene.bringToTop();
    this.currentIndex = 0;
    this.currentTextIndex = 0;

    const width = this.scale.width;
    const height = this.scale.height;

    this.bgImage = this.add.image(width / 2, height / 2, '').setOrigin(0.5);
    this.bgImage.setVisible(false);

    this.dialogBox = this.add.graphics();
    this.dialogText = this.add.text(50, height - 140, ' ', {
      font: '20px monospace',
      color: '#ffffff',
      wordWrap: { width: width - 100 }
    });

    this.promptText = this.add.text(width - 35, height - 40, 'ESPAÇO avançar | ESC pular', {
      font: '18px monospace',
      color: '#ffffff'
    }).setOrigin(1, 1);

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const w = gameSize.width;
      const h = gameSize.height;
      this.bgImage?.setPosition(w / 2, h / 2);
      if (this.bgImage && this.bgImage.texture.key !== '__DEFAULT') {
          this.bgImage.setDisplaySize(w, h);
      }
      this.promptText?.setPosition(w - 35, h - 40);
      if (this.dialogText?.originX === 0.5) {
        this.dialogText?.setPosition(w / 2, h / 2);
      } else {
        this.dialogText?.setPosition(50, h - 140);
        this.dialogText?.setStyle({ wordWrap: { width: w - 100 } });
      }
      this.drawBox(this.cutsceneSequence[this.currentIndex]?.type === 'image');
    });

    this.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 800
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      // Tocar a música no primeiro input do usuário
      if (!this.backgroundMusic) {
          this.backgroundMusic = this.sound.add('intro', { loop: true, volume: 0.2 });
          this.backgroundMusic.play();
      }
      // Não avançar se o menu estiver aberto
      if (this.mainMenuUI && this.mainMenuUI.isVisibleCheck()) {
          return;
      }
      this.advance();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.skipAll();
    });

    this.renderCurrentScene();
  }

  skipAll() {
    if (this.isResume) {
      this.scene.resume(this.nextScene);
      this.scene.stop();
    } else {
      this.scene.start(this.nextScene);
    }
  }

  advance() {
    const current = this.cutsceneSequence[this.currentIndex];
    
    // Se o efeito de digitação ainda não terminou, completa ele imediatamente
    if (this.typeWriterEvent && this.currentTypedText.length < this.currentFullText.length) {
      this.typeWriterEvent.remove(false);
      this.currentTypedText = this.currentFullText;
      if (current.type === 'text') {
        this.dialogText?.setText(this.currentTypedText);
        this.dialogText?.setPosition(this.scale.width / 2, this.scale.height / 2); // centralizado
        this.dialogText?.setOrigin(0.5);
      } else {
        this.dialogText?.setText(this.currentTypedText);
      }
      return;
    }

    if (current.texts && this.currentTextIndex < current.texts.length - 1) {
      this.currentTextIndex++;
      this.showText();
    } else {
      this.currentIndex++;
      this.currentTextIndex = 0;
      if (this.currentIndex >= this.cutsceneSequence.length) {
        if (this.isResume) {
          this.scene.resume(this.nextScene);
          this.scene.stop();
        } else {
          this.scene.start(this.nextScene);
        }
      } else {
        // Se formos para a cena 1 (instruções) e o menu não foi exibido ainda, exibe o Menu Principal
        if (this.currentIndex === 1 && !this.mainMenuUI && !this.isResume) {
            this.showMainMenu();
        } else {
            this.renderCurrentScene();
        }
      }
    }
  }

  private mainMenuUI?: MainMenuUI; // vai importar a classe depois, mas o vite lida bem

  private showMainMenu() {
      // Desabilita input temporariamente
      if (this.input.keyboard) this.input.keyboard.enabled = false;

      // Adiciona o efeito Pixelate na imagem de fundo (logo)
      // @ts-expect-error: postFX is not explicitly typed in Phaser Image but exists at runtime
      const fx = this.bgImage?.postFX?.addPixelate(1);

      if (fx) {
          // Tween para aumentar o tamanho dos pixels, dando o efeito de "desmontando em pixels"
          this.tweens.add({
              targets: fx,
              amount: 40,
              duration: 150,
              ease: 'Power2'
          });
      }

      // Fade out da câmera para o preto
      this.cameras.main.fadeOut(150, 0, 0, 0);

      // Aguarda metade da transição para começar a mostrar o menu principal
      this.time.delayedCall(75, () => {
          import('../ui/MainMenuUI').then((module) => {
              const MainMenuUI = module.default;
              this.mainMenuUI = new MainMenuUI(this, {
                  onNewGame: () => {
                      try {
                          if (this.mainMenuUI) {
                              this.mainMenuUI.destroy();
                              this.mainMenuUI = undefined;
                          }
                          if (this.input.keyboard) this.input.keyboard.enabled = true;
                          
                          if (this.bgImage && (this.bgImage as any).postFX) {
                              (this.bgImage as any).postFX.clear();
                          }
                          this.cameras.main.setAlpha(1);
                          this.cameras.main.fadeIn(1000, 0, 0, 0);
                          
                          // Force advance to the next state (text sequence)
                          this.advance();
                      } catch (err) {
                          console.error("Error in onNewGame:", err);
                          // Fallback se algo der errado
                          this.advance();
                      }
                  },
                  onLoadGame: () => {
                      console.log("Load Game não implementado ainda.");
                  },
                  onSettings: () => {
                      console.log("Settings não implementado ainda.");
                  }
              });
              this.mainMenuUI.show();
              if (this.input.keyboard) this.input.keyboard.enabled = true;
          });
      });
  }

  renderCurrentScene() {
    const current = this.cutsceneSequence[this.currentIndex];

    if (current.type === 'image' && current.imageKey) {
      this.bgImage?.setTexture(current.imageKey);
      this.bgImage?.setDisplaySize(this.scale.width, this.scale.height);
      this.bgImage?.setVisible(true);
      // reset dialog styles
      this.dialogText?.setOrigin(0);
      this.dialogText?.setPosition(50, this.scale.height - 140);
      this.dialogText?.setAlign('left');
    } else {
      this.bgImage?.setVisible(false);
      // setup text style for intro
      this.dialogText?.setOrigin(0.5);
      this.dialogText?.setPosition(this.scale.width / 2, this.scale.height / 2);
      this.dialogText?.setAlign('center');
      this.drawBox(false);
    }

    if (current.texts && current.texts.length > 0) {
      this.showText();
    } else {
      this.dialogText?.setText('');
      this.drawBox(false);
    }
  }

  showText() {
    const current = this.cutsceneSequence[this.currentIndex];
    this.currentFullText = current.texts![this.currentTextIndex];
    this.currentTypedText = "";
    
    if (current.type === 'image') {
      this.drawBox(true);
    }

    if (this.typeWriterEvent) this.typeWriterEvent.remove(false);

    // Configura a voz do personagem atual
    UISoundManager.setSpeakerFromText(this.currentFullText);

    // Efeito de digitação para todas as falas
    let i = 0;
    this.typeWriterEvent = this.time.addEvent({
      delay: current.type === 'text' ? 40 : 25, // texto da intro um pouco mais lento
      repeat: this.currentFullText.length - 1,
      callback: () => {
        const char = this.currentFullText[i];
        this.currentTypedText += char;
        this.dialogText?.setText(this.currentTypedText);
        
        // Toca som de digitação apenas em caracteres visíveis
        if (char !== ' ') {
            UISoundManager.playTyping();
        }
        
        i++;
      }
    });
  }

  drawBox(visible: boolean) {
    const width = this.scale.width;
    const height = this.scale.height;
    this.dialogBox?.clear();
    if (visible) {
      const margem = 30;
      const caixaAltura = 120;
      this.dialogBox?.fillStyle(0x000000, 0.6);
      this.dialogBox?.fillRect(margem, height - caixaAltura - margem, width - margem * 2, caixaAltura);
      this.dialogBox?.lineStyle(2, 0xffffff);
      this.dialogBox?.strokeRect(margem, height - caixaAltura - margem, width - margem * 2, caixaAltura);
    }
  }
}
