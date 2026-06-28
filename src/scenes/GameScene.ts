import Phaser from 'phaser';
import Player from '../entities/Player';
import NPC from '../entities/NPC';
import { Item, Inventory } from '../entities/Item';
import PuzzleManager from '../puzzles/PuzzleManager';
import { colisoes, TAM_BLOCO } from '../data/colisoes';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private npcs: NPC[] = [];
  private items: Item[] = [];
  private inventory!: Inventory;
  private puzzleManager!: PuzzleManager;

  constructor() {
    super('GameScene');
  }

  create() {
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const mapImage = this.add.image(0, 0, 'mapa_jogo').setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, mapImage.width, mapImage.height);
    this.cameras.main.setBounds(0, 0, mapImage.width, mapImage.height);

    const map = this.make.tilemap({
      data: colisoes,
      tileWidth: TAM_BLOCO,
      tileHeight: TAM_BLOCO
    });
    
    const graphics = this.make.graphics({ x: 0, y: 0 } as any);
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillRect(0, 0, TAM_BLOCO, TAM_BLOCO);
    graphics.generateTexture('collisionTile', TAM_BLOCO, TAM_BLOCO);

    const tileset = map.addTilesetImage('collisionTile');
    this.collisionLayer = map.createLayer(0, tileset!, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    this.collisionLayer.setCollision(1);
    this.collisionLayer.setVisible(false);

    // Inicializar Player
    this.player = new Player(this, 1650, 2950);
    this.physics.add.collider(this.player, this.collisionLayer);

    // Inicializar Câmera
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setZoom(1.0);

    // Inicializar NPCs (dados do index.html legado)
    this.npcs.push(new NPC(this, 5680, 2750, 'npc-1', [
      "Sebastião: Whisper Valley guarda segredos que nem o vento ousa contar...",
      "Sebastião: À noite, as vozes chamam do lago.",
      "Sebastião: Você escuta se ficar em silêncio por tempo demais.",
      "Sebastião: Foi assim que Daniel se perdeu... o lago o levou."
    ]));
    this.npcs.push(new NPC(this, 3320, 2500, 'npc-2', [
      "João: Os moradores... eles não são mais os mesmos.",
      "João: Olhos que não piscam... sorrisos que não alcançam o rosto.",
      "João: Dizem que Sofia tentou ir embora... mas acabou morrendo entre as árvores."
    ]));
    this.npcs.push(new NPC(this, 6000, 1270, 'npc-3', [
      "Ana: Abraxas... esse nome ainda ecoa aqui.",
      "Ana: Alguns o chamam de deus. Outros, de punição.",
      "Ana: Jonas... ele acreditou demais. E agora está em silêncio eterno como o resto.",
      "Ethan: Abraxas outra vez...",
      "Ethan: Todos falam desse nome como se fosse uma sombra viva.",
      "Ethan: Parece que cheguei mais perto do que devia."
    ]));
    this.npcs.push(new NPC(this, 2490, 1010, 'npc-4', [
      "Weverson: Você é novo por aqui, não é?!",
      "Weverson: Então escute bem... há algo que domina essa cidade.",
      "Weverson: Uma seita... chamam de Abraxas.",
      "Weverson: Eles observam tudo. E não gostam de forasteiros curiosos.",
      "Weverson: Tome cuidado... nem todos que sorriem aqui são humanos por completo.",
    ]));
    this.npcs.push(new NPC(this, 3000, 4990, 'npc-5', [
      "Helena: A seita pode ser vencida... mas não com força.",
      "Helena: Há um item... antigo. Escondido onde a névoa toca o chão.",
      "Helena: Miguel... ele também o procurava.",
      "Ethan: Miguel também...?",
      "Ethan: Então ele realmente esteve aqui.",
      "Ethan: O que você estava tentando me mostrar, amigo?"
    ]));

    // Inicializar Inventário e Itens
    this.inventory = new Inventory(this);
    // Para simplificar, estamos criando texturas placeholder para os itens caso não existam as imagens
    // Os assets eram: 'pedra', 'flor', 'calice', 'pena', 'reliquia'
    this.items.push(new Item(this, 2500, 1250, 'Pedra', 'pedra'));
    this.items.push(new Item(this, 8500, 5400, 'Flor', 'flor'));
    this.items.push(new Item(this, 6030, 700, 'Cálice', 'calice'));
    this.items.push(new Item(this, 2300, 4400, 'Pena', 'pena'));
    this.items.push(new Item(this, 8560, 170, 'Relíquia', 'reliquia'));

    // Inicializar Puzzles
    this.puzzleManager = new PuzzleManager(this);

    // Música
    const music = this.sound.add('musica', { loop: true, volume: 0.5 });
    if (!this.sound.locked) {
      music.play();
    } else {
      this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        music.play();
      });
    }
  }

  update() {
    // Se o inventário está aberto ou um puzzle modal está aberto, congelar player
    if (this.inventory.visivel || this.puzzleManager.isAnyModalOpen()) {
      this.player.active = false;
      this.player.anims.stop();
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
      return;
    } else {
      let interactingNPC = false;
      for (const npc of this.npcs) {
        if (npc.interagindo) {
          interactingNPC = true;
          break;
        }
      }
      this.player.active = !interactingNPC;
    }

    if (this.player.active) {
      this.player.update();
    }

    // Atualizar NPCs
    for (const npc of this.npcs) {
      npc.update(this.player, this.spaceKey);
    }

    // Atualizar Puzzles
    this.puzzleManager.update(this.player, this.spaceKey);

    // Atualizar Itens
    for (const item of this.items) {
      item.update(this.player, this.spaceKey, this.inventory);
    }

    // Checar condição de final de jogo
    if (this.puzzleManager.areAllCompleted()) {
      this.scene.start('FinalScene', { inventory: this.inventory.itens });
    }
  }
}
