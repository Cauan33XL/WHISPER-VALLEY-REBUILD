import Phaser from 'phaser';
import LoadingUI from '../ui/LoadingUI';

export default class PreloadScene extends Phaser.Scene {
  private loadingUI!: LoadingUI;

  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.loadingUI = new LoadingUI(this);

    this.load.on('progress', (value: number) => {
        this.loadingUI.updateProgress(value);
    });
    
    this.load.on('complete', () => {
        // O transition da cena será tratado no create()
    });

    // Load assets here
    // Exemplo (os assets reais precisarão ser checados):
    this.load.image('logo', 'assets/capas/logo.png');
    this.load.image('instrucoes', 'assets/ui/instrucoes.png');
    this.load.image('cena-1', 'assets/cenas/cena-1.png');
    this.load.image('cena-2', 'assets/cenas/cena-2.png');
    this.load.image('cena-3', 'assets/cenas/cena-3.png');
    this.load.image('cena-4', 'assets/cenas/cena-4.png');
    this.load.audio('intro', 'assets/audio/intro.mp3');
    // Cena 5 em diante e assets do jogo foram movidos para o GameScene.ts
    // para acelerar o carregamento inicial da tela da logo/menu.
  }

  create() {
    // Quando o carregamento terminar, esperamos o fade-out do LoadingUI 
    // antes de ir para a CutsceneScene
    this.loadingUI.finish().then(() => {
        this.scene.start('CutsceneScene');
    });
  }
}
