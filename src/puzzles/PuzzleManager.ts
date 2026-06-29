import Phaser from 'phaser';
import Player from '../entities/Player';
import UISoundManager from '../systems/UISoundManager';
import { CemeteryPuzzle } from './cemeteryPuzzle';
import { ChurchPuzzle } from './churchPuzzle';
import { LakePuzzle } from './lakePuzzle';
import { RuinsPuzzle } from './ruinsPuzzle';

interface IPuzzle {
    isCompleted: () => boolean;
    playerInArea: (player: Player, map: unknown) => boolean;
    isModalOpen?: () => boolean;
    showModal: () => void;
    forceComplete?: () => void;
}

export default class PuzzleManager {

  private promptText: Phaser.GameObjects.Text;
  
  private puzzles = [
    { name: 'Cemetery', obj: CemeteryPuzzle },
    { name: 'Church', obj: ChurchPuzzle },
    { name: 'Ruins', obj: RuinsPuzzle },
    { name: 'Lake', obj: LakePuzzle }
  ];
  private completedStates: boolean[] = [false, false, false, false];

  constructor(scene: Phaser.Scene) {

    CemeteryPuzzle.init({ x: 2900, y: 200, w: 1100, h: 600 });
    ChurchPuzzle.init({
      x: 5450,
      y: 800,
      w: 300,
      h: 300,
      orientationVisible: false,
      symbols: [
        "assets/simbolos/chave.jpg",
        "assets/simbolos/fragmento.jpg",
        "assets/simbolos/sol.jpg",
        "assets/simbolos/triangulo.jpg"
      ],
      correctSequence: [1, 3, 0, 2]
    });
    RuinsPuzzle.init({ x: 10250, y: 3373, w: 600, h: 600 });
    LakePuzzle.init({ x: 5440, y: 5470, w: 400, h: 200 });

    this.promptText = scene.add.text(0, 0, 'ESPAÇO para interagir', {
      font: '24px monospace',
      color: '#ffffff',
      backgroundColor: '#00000088'
    }).setOrigin(0.5).setVisible(false).setDepth(1500);
  }

  update(player: Player, spaceKey: Phaser.Input.Keyboard.Key) {
    let nearPuzzle = false;
    let activePuzzleObj: IPuzzle | null = null;

    for (const p of this.puzzles) {
      if (!p.obj.isCompleted() && p.obj.playerInArea(player, null)) {
        nearPuzzle = true;
        activePuzzleObj = p.obj;
        // Posicionar o texto acima do player
        this.promptText.setPosition(player.x, player.y - 60);
        break;
      }
    }

    if (nearPuzzle && !activePuzzleObj!.isModalOpen?.()) {
      this.promptText.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        UISoundManager.playOpen();
        activePuzzleObj!.showModal();
      }
    } else {
      this.promptText.setVisible(false);
    }

    // Check for newly completed puzzles
    for (let i = 0; i < this.puzzles.length; i++) {
        const isCompletedNow = this.puzzles[i].obj.isCompleted();
        if (isCompletedNow && !this.completedStates[i]) {
            this.completedStates[i] = true;
            UISoundManager.playSuccess();
        }
    }
  }

  isAnyModalOpen(): boolean {
    for (const p of this.puzzles) {
      if ((p.obj as unknown as IPuzzle).isModalOpen?.()) return true;
      // Some puzzles might have different state checking, let's assume they all expose isModalOpen()
      // Note: we might need to add `isModalOpen: () => STATE.showModal` to Lake and Ruins if missing.
      // Or check if a DOM element exists and is visible.
    }
    return (document.getElementById('cemetery-puzzle-modal')?.style.visibility === 'visible') ||
           (document.getElementById('church-puzzle-modal')?.style.display === 'flex') ||
           (document.getElementById('ruins-puzzle-modal')?.style.display === 'flex') ||
           (document.getElementById('lake-puzzle-modal')?.style.display === 'flex');
  }

  isCompleted(index: number): boolean {
    return this.puzzles[index]?.obj.isCompleted() ?? false;
  }

  setCompleted(index: number, value: boolean): void {
    if (value) {
      this.puzzles[index]?.obj.forceComplete?.();
      this.completedStates[index] = true;
    }
  }

  areAllCompleted(): boolean {
    return this.puzzles.every(p => p.obj.isCompleted());
  }
}
