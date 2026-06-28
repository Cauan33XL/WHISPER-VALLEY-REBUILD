import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // ProgressBar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Carregando...',
        style: {
            font: '20px monospace',
            color: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });
    
    this.load.on('complete', () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
    });

    // Load assets here
    // Exemplo (os assets reais precisarão ser checados):
    this.load.image('logo', 'assets/logo.png');
    this.load.image('instrucoes', 'assets/instrucoes.jpg');
    this.load.image('cena-1', 'assets/cena-1.png');
    this.load.image('cena-2', 'assets/cena-2.png');
    this.load.image('cena-3', 'assets/cena-3.png');
    this.load.image('cena-4', 'assets/cena-4.png');
    this.load.image('mapa_jogo', 'assets/mapa_jogo.webp');
    this.load.image('npc-1', 'assets/npc-1.png');
    this.load.image('npc-2', 'assets/npc-2.png');
    this.load.image('npc-3', 'assets/npc-3.png');
    this.load.image('npc-4', 'assets/npc-4.png');
    this.load.image('npc-5', 'assets/npc-5.png');

    // Itens
    this.load.image('pedra', 'assets/itens/pedra.png');
    this.load.image('flor', 'assets/itens/flor.png');
    this.load.image('calice', 'assets/itens/calice.png');
    this.load.image('pena', 'assets/itens/pena.png');
    this.load.image('reliquia', 'assets/itens/reliquia.png');
    this.load.image('mochila', 'assets/itens/mochila.png');

    // Spritesheet do Player (de Player.js: 102x101)
    this.load.spritesheet('player', 'assets/spritesheet.png', {
      frameWidth: 102,
      frameHeight: 101
    });

    this.load.audio('musica', 'assets/audio/musica.mp3');
  }

  create() {
    this.scene.start('CutsceneScene');
  }
}
