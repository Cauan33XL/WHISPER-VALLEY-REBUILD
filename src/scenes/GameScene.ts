import Phaser from 'phaser';
import Player from '../entities/Player';
import NPC from '../entities/NPC';
import { Item, Inventory } from '../entities/Item';
import PuzzleManager from '../puzzles/PuzzleManager';
import { colisoes, TAM_BLOCO } from '../data/colisoes';
import { CutsceneConfig } from './CutsceneScene';
import LoadingUI from '../ui/LoadingUI';
import { SaveData } from '../save/SaveManager';

interface EventZone {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  triggered: boolean;
  sequence: CutsceneConfig[];
}

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private collisionLayer!: Phaser.Tilemaps.TilemapLayer;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  
  private npcs: NPC[] = [];
  private items: Item[] = [];
  private inventory!: Inventory;
  private puzzleManager!: PuzzleManager;
  private eventZones: EventZone[] = [];

  private loadingUI?: LoadingUI;
  // MiniMapa
  private minimapDots!: Phaser.GameObjects.Graphics;
  private mmCX!: number;
  private mmCY!: number;
  private mmScale!: number;
  public bigMinimapOpen = false;
  private bigMMBg!: Phaser.GameObjects.Graphics;
  private bigMMImg!: Phaser.GameObjects.Image;
  private bigMMDots!: Phaser.GameObjects.Graphics;
  private bigMMScale!: number;
  private bigMMW!: number;
  private bigMMH!: number;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.loadingUI = new LoadingUI(this);

    this.load.on('progress', (value: number) => {
        this.loadingUI?.updateProgress(value);
    });

    this.load.image('cena-5', 'assets/cenas/cena-5.png');
    this.load.image('cena-6', 'assets/cenas/cena-6.png');
    this.load.image('cena-7', 'assets/cenas/cena-7.png');
    this.load.image('cena-8', 'assets/cenas/cena-8.png');
    this.load.image('cena-9', 'assets/cenas/cena-9.png');
    this.load.image('cena-10', 'assets/cenas/cena-10.png');
    this.load.image('cena-11', 'assets/cenas/cena-11.png');
    this.load.image('cena-12', 'assets/cenas/cena-12.png');
    this.load.image('cena-13', 'assets/cenas/cena-13.png');
    this.load.image('cena-14', 'assets/cenas/cena-14.png');
    this.load.image('cena-15', 'assets/cenas/cena-15.png');
    this.load.image('cena-16', 'assets/cenas/cena-16.png');
    this.load.image('mapa_jogo', 'assets/mapas/mapa_jogo.webp');
    this.load.audio('passos', 'assets/audio/ethan/passos.mp3');
    this.load.image('npc-1', 'assets/npcs/npc-1.png');
    this.load.image('npc-2', 'assets/npcs/npc-2.png');
    this.load.image('npc-3', 'assets/npcs/npc-3.png');
    this.load.image('npc-4', 'assets/npcs/npc-4.png');
    this.load.image('npc-5', 'assets/npcs/npc-5.png');

    // Itens
    this.load.image('pedra', 'assets/itens/pedra.png');
    this.load.image('flor', 'assets/itens/flor.png');
    this.load.image('calice', 'assets/itens/calice.png');
    this.load.image('pena', 'assets/itens/pena.png');
    this.load.image('reliquia', 'assets/itens/reliquia.png');
    this.load.image('mochila', 'assets/itens/mochila.png');

    // Spritesheet do Player (de Player.js: 102x101)
    this.load.spritesheet('player', 'assets/spritesheets/spritesheet.png', {
      frameWidth: 102,
      frameHeight: 101
    });
  }

  create() {
    this.npcs = [];
    this.items = [];
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const mapImage = this.add.image(0, 0, 'mapa_jogo').setOrigin(0, 0);
    this.physics.world.setBounds(0, 0, mapImage.width, mapImage.height);
    this.cameras.main.setBounds(0, 0, mapImage.width, mapImage.height);

    const map = this.make.tilemap({
      data: colisoes,
      tileWidth: TAM_BLOCO,
      tileHeight: TAM_BLOCO
    });
    
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff0000, 0.3);
    graphics.fillRect(0, 0, TAM_BLOCO, TAM_BLOCO);
    graphics.generateTexture('collisionTile', TAM_BLOCO, TAM_BLOCO);

    const tileset = map.addTilesetImage('collisionTile');
    this.collisionLayer = map.createLayer(0, tileset!, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    this.collisionLayer.setCollision(1);
    this.collisionLayer.setVisible(false);

    // Inicializar Player
    this.player = new Player(this, 1770, 3020);
    this.physics.add.collider(this.player, this.collisionLayer);

    // Inicializar Câmera
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setZoom(1.0);

    // MiniMapa retangular com contornos verdes
    const mmMargin = 10;
    const mmW = 180;
    const mmTextureW = colisoes[0].length; // 178
    const mmTextureH = colisoes.length;    // 97
    this.mmScale = mmW / mmTextureW;
    const mmH = Math.floor(mmTextureH * this.mmScale);
    this.mmCX = this.cameras.main.width - mmMargin - mmW / 2;
    this.mmCY = this.cameras.main.height - mmMargin - mmH / 2;
    const mmDispW = mmW;
    const mmDispH = mmH;

    // Renderiza o mapa de colisão: fundo preto, paredes em verde
    const tempG = new Phaser.GameObjects.Graphics(this);
    tempG.fillStyle(0x000000, 1);
    tempG.fillRect(0, 0, mmTextureW, mmTextureH);
    for (let row = 0; row < mmTextureH; row++) {
      for (let col = 0; col < mmTextureW; col++) {
        // Oculta todo o corredor L invertido + bordas + entrada
        const isHiddenTile =
          (row >= 1 && row <= 5 && col >= 105 && col <= 177) ||
          (row >= 6 && col >= 172 && col <= 177);
        if (isHiddenTile) continue;
        if (colisoes[row][col] === 1) {
          tempG.fillStyle(0x22c55e, 1);
          tempG.fillRect(col, row, 1, 1);
        }
      }
    }
    tempG.generateTexture('mm_tex', mmTextureW, mmTextureH);
    tempG.destroy();

    // Fundo preto
    const mmBg = this.add.graphics();
    mmBg.fillStyle(0x000000, 0.85);
    mmBg.fillRect(this.mmCX - mmW / 2, this.mmCY - mmH / 2, mmW, mmH);
    mmBg.setScrollFactor(0).setDepth(98);

    this.add.image(this.mmCX, this.mmCY, 'mm_tex')
      .setDisplaySize(mmDispW, mmDispH)
      .setScrollFactor(0)
      .setDepth(99);

    this.minimapDots = this.add.graphics()
      .setScrollFactor(0)
      .setDepth(100);

    // Borda retangular verde
    const mmBorder = this.add.graphics();
    mmBorder.lineStyle(2, 0x22c55e, 0.7);
    mmBorder.strokeRect(this.mmCX - mmW / 2, this.mmCY - mmH / 2, mmW, mmH);
    mmBorder.setScrollFactor(0).setDepth(101);

    // Zona clicável para abrir mini mapa expandido
    const mmZone = this.add.zone(this.mmCX, this.mmCY, mmW, mmH)
      .setScrollFactor(0).setDepth(102);
    mmZone.setInteractive({ useHandCursor: true });
    mmZone.on('pointerdown', () => {
      this.bigMinimapOpen = !this.bigMinimapOpen;
      this.bigMMBg.setVisible(this.bigMinimapOpen);
      this.bigMMImg.setVisible(this.bigMinimapOpen);
      this.bigMMDots.setVisible(this.bigMinimapOpen);
      this.bigMMDots.clear();
      bigBorder.setVisible(this.bigMinimapOpen);
      bigCloseText.setVisible(this.bigMinimapOpen);
      if (this.bigMinimapOpen) {
        this.drawBigMinimapDots();
        closeBgZone.setInteractive({ useHandCursor: false });
      } else {
        closeBgZone.disableInteractive();
      }
    });

    // Mini mapa expandido (invisível por padrão)
    const bigScale = 3;
    this.bigMMW = Math.floor(mmTextureW * bigScale);
    this.bigMMH = Math.floor(mmTextureH * bigScale);
    this.bigMMScale = bigScale;
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.bigMMBg = this.add.graphics()
      .setScrollFactor(0).setDepth(9000);
    this.bigMMBg.fillStyle(0x000000, 0.6);
    this.bigMMBg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    this.bigMMImg = this.add.image(cx, cy, 'mm_tex')
      .setDisplaySize(this.bigMMW, this.bigMMH)
      .setScrollFactor(0).setDepth(9001);

    const bigBorder = this.add.graphics()
      .setScrollFactor(0).setDepth(9002);
    bigBorder.lineStyle(3, 0x22c55e, 0.9);
    bigBorder.strokeRect(cx - this.bigMMW / 2, cy - this.bigMMH / 2, this.bigMMW, this.bigMMH);

    this.bigMMDots = this.add.graphics()
      .setScrollFactor(0).setDepth(9003);

    // Texto de fechar
    const bigCloseText = this.add.text(cx, cy + this.bigMMH / 2 + 18, 'CLIQUE PARA FECHAR', {
      fontFamily: 'monospace', fontSize: '12px', color: '#aaaaaa',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9004);

    this.bigMMBg.setVisible(false);
    this.bigMMImg.setVisible(false);
    bigBorder.setVisible(false);
    this.bigMMDots.setVisible(false);
    bigCloseText.setVisible(false);

    // Fechar com ESC
    this.input.keyboard!.on('keydown-ESC', () => {
      if (this.bigMinimapOpen) {
        this.bigMinimapOpen = false;
        this.bigMMBg.setVisible(false);
        this.bigMMImg.setVisible(false);
        bigBorder.setVisible(false);
        this.bigMMDots.setVisible(false);
        bigCloseText.setVisible(false);
        closeBgZone.disableInteractive();
      }
    });

    // Fechar clicando fora do mapa expandido
    const closeBgZone = this.add.zone(cx, cy, this.cameras.main.width, this.cameras.main.height)
      .setScrollFactor(0).setDepth(8999);
    closeBgZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.bigMinimapOpen) return;
      const hw = this.bigMMW / 2;
      const hh = this.bigMMH / 2;
      if (p.x < cx - hw || p.x > cx + hw || p.y < cy - hh || p.y > cy + hh) {
        this.bigMinimapOpen = false;
        this.bigMMBg.setVisible(false);
        this.bigMMImg.setVisible(false);
        bigBorder.setVisible(false);
        this.bigMMDots.setVisible(false);
        bigCloseText.setVisible(false);
        closeBgZone.disableInteractive();
      }
    });
    this.events.on('bigmap-open', () => {
      closeBgZone.setInteractive({ useHandCursor: false });
    });

    // Inicializar NPCs (dados do index.html legado)
    this.npcs.push(new NPC(this, 5744, 2750, 'npc-1', [
      [
        "Sebastião: Whisper Valley guarda segredos que nem o vento ousa contar...",
        "Sebastião: À noite, as vozes chamam do lago.",
        "Sebastião: Você escuta se ficar em silêncio por tempo demais."
      ],
      [
        "Sebastião: Foi assim que Daniel se perdeu... o lago o levou.",
        "Sebastião: Cuidado, forasteiro. O lago está com fome."
      ],
      [
        "Sebastião: Não olhe para a água por muito tempo."
      ]
    ]));
    this.npcs.push(new NPC(this, 3384, 2500, 'npc-2', [
      [
        "João: Os moradores... eles não são mais os mesmos.",
        "João: Olhos que não piscam... sorrisos que não alcançam o rosto."
      ],
      [
        "João: Dizem que Sofia tentou ir embora... mas acabou morrendo entre as árvores.",
        "João: Não confie nas árvores. Elas sussurram mentiras."
      ],
      [
        "João: Eles estão nos observando..."
      ]
    ]));
    this.npcs.push(new NPC(this, 6064, 1270, 'npc-3', [
      [
        "Ana: Abraxas... esse nome ainda ecoa aqui.",
        "Ana: Alguns o chamam de deus. Outros, de punição."
      ],
      [
        "Ana: Jonas... ele acreditou demais. E agora está em silêncio eterno como o resto.",
        "Ethan: Abraxas outra vez...",
        "Ethan: Todos falam desse nome como se fosse uma sombra viva."
      ],
      [
        "Ethan: Parece que cheguei mais perto do que devia.",
        "Ana: Que os deuses antigos tenham piedade de nós."
      ]
    ]));
    this.npcs.push(new NPC(this, 2554, 1010, 'npc-4', [
      [
        "Weverson: Você é novo por aqui, não é?!",
        "Weverson: Então escute bem... há algo que domina essa cidade."
      ],
      [
        "Weverson: Uma seita... chamam de Abraxas.",
        "Weverson: Eles observam tudo. E não gostam de forasteiros curiosos."
      ],
      [
        "Weverson: Tome cuidado... nem todos que sorriem aqui são humanos por completo."
      ]
    ]));
    this.npcs.push(new NPC(this, 3064, 4990, 'npc-5', [
      [
        "Helena: A seita pode ser vencida... mas não com força.",
        "Helena: Há um item... antigo. Escondido onde a névoa toca o chão."
      ],
      [
        "Helena: Miguel... ele também o procurava.",
        "Ethan: Miguel também...?",
        "Ethan: Então ele realmente esteve aqui."
      ],
      [
        "Ethan: O que você estava tentando me mostrar, amigo?",
        "Helena: Siga o caminho que ele deixou."
      ]
    ]));

    // Colisão do player com os NPCs
    this.physics.add.collider(this.player, this.npcs);
    // Colisão dos NPCs com o cenário
    this.physics.add.collider(this.npcs, this.collisionLayer);

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

    // Inicializar Zonas de Evento (Cutscenes do mapa)
    this.eventZones = [
      {
        id: 'pousada', x: 6100, y: 2600, w: 200, h: 200, triggered: false,
        sequence: [
          { type: 'image', imageKey: 'cena-5', texts: [
            "Ethan: Estranho... não há ninguém aqui dentro.",
            "Ethan: É melhor eu me aproximar do balcão."
          ]},
          { type: 'image', imageKey: 'cena-6', texts: [
            "Ethan: Um bilhete...? O que é isso?",
            "Ethan: 'Bem-vindo à Whisper Valley, Ethan... estávamos te esperando'.",
            "Ethan: Quem escreveu isso... e como sabia que eu viria?"
          ]}
        ]
      },
      {
        id: 'igreja', x: 5450, y: 900, w: 200, h: 200, triggered: false,
        sequence: [
          { type: 'image', imageKey: 'cena-7', texts: [
            "Ethan: Que lugar é esse...? Uma igreja...",
            "Ethan: Estranho... não parece uma igreja comum.",
            "Ethan: Esses símbolos... nunca vi nada assim. Tem algo de errado aqui.",
            "Ethan: Hmm... o que é isso? Há uma frase na frente...",
            "Ethan: Parece algum tipo de enigma..."
          ]}
        ]
      },
      {
        id: 'cemiterio', x: 2900, y: 200, w: 1100, h: 550, triggered: false,
        sequence: [
          { type: 'image', imageKey: 'cena-8', texts: [
            "Ethan: Não gosto do aspecto disto.",
            "(Observando o cemitério e a torre ao longe.)",
            "Ethan: Tem sete lápides. Quatro com nomes ilegíveis, e três...",
            "Ethan: ...estas estão completamente em branco.",
            "Ethan: Isto não foi um acidente."
          ]}
        ]
      },
      {
        id: 'lago', x: 5400, y: 5500, w: 400, h: 200, triggered: false,
        sequence: [
          { type: 'image', imageKey: 'cena-9', texts: [
            "Ethan: A névoa está densa aqui.",
            "Ethan: Silêncio absoluto... não ouço nada.",
            "Ethan: O lago... parece um espelho negro, refletindo nada além da escuridão."
          ]}
        ]
      },
      {
        id: 'ruinas', x: 10250, y: 3400, w: 600, h: 600, triggered: false,
        sequence: [
          { type: 'image', imageKey: 'cena-10', texts: [
            "Ethan: Mas o que é isso...? Ruínas em meio a este lugar... É de dar calafrios.",
            "Ethan: Essas estátuas... e os pedestais. Eles não parecem estar aqui por acaso.",
            "Ethan: Símbolos em cada um... Um de água, outro de folha ou broto, terra... e um tipo de espiral?",
            "Ethan: Devem ser indicações. Cada pedestal pede por um item específico que corresponda ao seu símbolo.",
            "Ethan: A chave para o que for que esteja aqui deve ser colocar os itens corretos em cada um deles. É o que eu tenho que fazer."
          ]}
        ]
      }
    ];

    // Iniciar UI
    this.scene.launch('UIScene');

    // Finalizar o LoadingUI com a transição dramática e revelar a cena
    if (this.input.keyboard) this.input.keyboard.enabled = false;
    if (this.loadingUI) {
        this.loadingUI.finish().then(() => {
            if (this.input.keyboard) this.input.keyboard.enabled = true;
        });
    } else {
        if (this.input.keyboard) this.input.keyboard.enabled = true;
    }
  }

  private updateMinimap() {
    const g = this.minimapDots;
    g.clear();
    const mmTLX = this.mmCX - (colisoes[0].length * this.mmScale) / 2;
    const mmTLY = this.mmCY - (colisoes.length * this.mmScale) / 2;

    const toMM = (wx: number, wy: number) => ({
      x: mmTLX + (wx / TAM_BLOCO) * this.mmScale,
      y: mmTLY + (wy / TAM_BLOCO) * this.mmScale,
    });

    // Player (branco)
    const pp = toMM(this.player.x, this.player.y);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(pp.x, pp.y, 3);

    // NPCs (amarelo)
    for (const npc of this.npcs) {
      const np = toMM(npc.x, npc.y);
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(np.x, np.y, 2);
    }

    // Itens (exceto relíquia) - cada um com sua cor
    for (const item of this.items) {
      if (item.coletado || item.nome === 'Relíquia') continue;
      const ip = toMM(item.x, item.y);
      let color = 0x38bdf8;
      if (item.nome === 'Pedra') color = 0x888888;
      else if (item.nome === 'Flor') color = 0xe879f9;
      else if (item.nome === 'Cálice') color = 0xfbbf24;
      else if (item.nome === 'Pena') color = 0x38bdf8;
      g.fillStyle(color, 1);
      g.fillCircle(ip.x, ip.y, 2);
    }
  }

  private drawBigMinimapDots() {
    const g = this.bigMMDots;
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    const bigTLX = cx - (colisoes[0].length * this.bigMMScale) / 2;
    const bigTLY = cy - (colisoes.length * this.bigMMScale) / 2;

    const toBMM = (wx: number, wy: number) => ({
      x: bigTLX + (wx / TAM_BLOCO) * this.bigMMScale,
      y: bigTLY + (wy / TAM_BLOCO) * this.bigMMScale,
    });

    // Player (branco)
    const pp = toBMM(this.player.x, this.player.y);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(pp.x, pp.y, 5);

    // NPCs (amarelo)
    for (const npc of this.npcs) {
      const np = toBMM(npc.x, npc.y);
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(np.x, np.y, 4);
    }

    // Itens (exceto relíquia)
    for (const item of this.items) {
      if (item.coletado || item.nome === 'Relíquia') continue;
      const ip = toBMM(item.x, item.y);
      let color = 0x38bdf8;
      if (item.nome === 'Pedra') color = 0x888888;
      else if (item.nome === 'Flor') color = 0xe879f9;
      else if (item.nome === 'Cálice') color = 0xfbbf24;
      else if (item.nome === 'Pena') color = 0x38bdf8;
      g.fillStyle(color, 1);
      g.fillCircle(ip.x, ip.y, 4);
    }
  }

  update(time: number, delta: number) {
    // Se um puzzle modal está aberto, congelar player
    if (this.puzzleManager.isAnyModalOpen()) {
      this.player.active = false;
      this.player.anims.stop();
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
      return;
    } else {
      let interactingNPC = false;
      for (const npc of this.npcs) {
        npc.update(time, delta, this.player, this.spaceKey);
        if (npc.interagindo) {
          interactingNPC = true;
        }
      }
      this.player.active = !interactingNPC;
    }

    if (this.player.active) {
      this.player.update();
    }

    // Atualizar Puzzles
    this.puzzleManager.update(this.player, this.spaceKey);

    // Atualizar Itens
    for (const item of this.items) {
      item.update(this.player, this.spaceKey, this.inventory);
    }

    // Atualizar MiniMapa
    this.updateMinimap();
    if (this.bigMinimapOpen) {
      this.bigMMDots.clear();
      this.drawBigMinimapDots();
    }

    // Checar Zonas de Evento
    for (const zone of this.eventZones) {
      if (!zone.triggered) {
        const px = this.player.x;
        const py = this.player.y;
        if (px >= zone.x && px <= zone.x + zone.w && py >= zone.y && py <= zone.y + zone.h) {
          zone.triggered = true;
          this.scene.pause();
          this.scene.launch('CutsceneScene', { sequence: zone.sequence, isResume: true, nextScene: 'GameScene' });
          return;
        }
      }
    }

    // Checar condição de final de jogo
    if (this.puzzleManager.areAllCompleted()) {
      this.scene.start('FinalScene', { inventory: this.inventory.itens });
    }
  }

  getSaveData(): SaveData {
    return {
      version: 1,
      timestamp: Date.now(),
      player: { x: this.player.x, y: this.player.y, hp: this.player.hp, maxHp: this.player.maxHp },
      inventory: { itens: [...this.inventory.itens] },
      items: this.items.map((item) => ({
        nome: item.nome,
        coletado: item.coletado,
        x: item.x,
        y: item.y,
        texture: item.texture.key,
      })),
      npcs: this.npcs.map((npc, i) => ({
        id: i,
        hasSpoken: npc.getHasSpoken(),
        sequenceIndex: npc.getSequenceIndex(),
        x: npc.x,
        y: npc.y,
        anchorX: npc.getAnchorX(),
        anchorY: npc.getAnchorY(),
      })),
      eventZones: this.eventZones.map((z) => ({ id: z.id, triggered: z.triggered })),
      puzzles: {
        cemeteryCompleted: this.puzzleManager.isCompleted(0),
        churchCompleted: this.puzzleManager.isCompleted(1),
        ruinsCompleted: this.puzzleManager.isCompleted(2),
        lakeCompleted: this.puzzleManager.isCompleted(3),
      },
    };
  }

  applySaveData(data: SaveData): void {
    this.player.setPosition(data.player.x, data.player.y);
    this.player.hp = data.player.hp;
    this.player.maxHp = data.player.maxHp;
    this.inventory.itens = data.inventory.itens;

    for (const item of this.items) {
      const saved = data.items.find((si) => si.nome === item.nome);
      if (saved) {
        item.coletado = saved.coletado;
        item.setPosition(saved.x, saved.y);
      }
    }

    for (let i = 0; i < this.npcs.length; i++) {
      const saved = data.npcs.find((sn) => sn.id === i);
      if (saved) {
        this.npcs[i].setHasSpoken(saved.hasSpoken);
        this.npcs[i].setSequenceIndex(saved.sequenceIndex);
        this.npcs[i].setPosition(saved.x, saved.y);
      }
    }

    for (const zone of this.eventZones) {
      const saved = data.eventZones.find((sz) => sz.id === zone.id);
      if (saved) zone.triggered = saved.triggered;
    }

    this.puzzleManager.setCompleted(0, data.puzzles.cemeteryCompleted);
    this.puzzleManager.setCompleted(1, data.puzzles.churchCompleted);
    this.puzzleManager.setCompleted(2, data.puzzles.ruinsCompleted);
    this.puzzleManager.setCompleted(3, data.puzzles.lakeCompleted);
  }
}
