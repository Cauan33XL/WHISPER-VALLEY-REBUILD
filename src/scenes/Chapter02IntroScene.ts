import Phaser from 'phaser';

export default class Chapter02IntroScene extends Phaser.Scene {
  constructor() {
    super('Chapter02IntroScene');
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor('#040a05');
    
    // Text showing "5 Anos Depois..."
    const textTime = this.add.text(width / 2, height / 2 - 80, '5 ANOS DEPOIS...', {
      font: '32px monospace',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    const textLore = this.add.text(width / 2, height / 2 + 20, 
      'Ethan nunca conseguiu esquecer os horrores de Whisper Valley.\nO pesadelo o chamou de volta para o Capítulo 02.', {
      font: '20px monospace',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    const btn = this.add.text(width / 2, height - 100, '[ VOLTAR AO MENU ]', {
      font: '24px monospace',
      color: '#22c55e'
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      window.location.reload();
    });

    // Fade in sequence
    this.tweens.add({
      targets: textTime,
      alpha: 1,
      duration: 2500,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: [textLore, btn],
          alpha: 1,
          duration: 2000,
          delay: 1500,
          ease: 'Power2'
        });
      }
    });
  }
}
