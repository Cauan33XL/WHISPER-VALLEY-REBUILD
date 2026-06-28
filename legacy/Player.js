class Player {
  constructor(canvas, x, y) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.x = x;
    this.y = y;
    this.largura = 62;
    this.altura = 62;
    this.velocidade = 7; // Velocidade ajustada

    // 0 = baixo, 1 = esquerda, 2 = direita, 3 = cima
    this.direcao = 0;
    this.isMoving = false;

    // Controle de animação
    this.frameIndex = 0;       // frame atual
    this.tickCount = 0;        // contador para mudança de frame
    this.ticksPerFrame = 20;   // velocidade da animação

    this.frameW = 102;
    this.frameH = 101;
    this.rows = [0, 1, 2, 3]; // linhas da spritesheet

    this.spritesheet = new Image();
    this.spritesheet.src = "assets/spritesheet.png";

    this.frameInicial = 0;

    // Hitbox Corrigida (valores originais para posicionar na base do sprite)
    this.hitboxOffsetX = 100;
    this.hitboxOffsetY = 100;
    this.hitboxWidth = 40;
    this.hitboxHeight = 50;
  }

  // --- FUNÇÃO MOVER ATUALIZADA (COM LÓGICA DE SLIDE CORRIGIDA) ---
  mover(teclas, map) {

    if (
      (ChurchPuzzle.isModalOpen && ChurchPuzzle.isModalOpen()) ||
      (CemeteryPuzzle.isModalOpen && CemeteryPuzzle.isModalOpen()) ||
      (LakePuzzle.isModalOpen && LakePuzzle.isModalOpen()) ||
      (RuinsPuzzle.isModalOpen && RuinsPuzzle.isModalOpen())
    ) {
      this.isMoving = false;
      return; // Impede movimento do player
    }

    if (npcInteragindo || puzzleAtivo) {
      this.isMoving = false;
      return;
    }
    // 'teclas' é o objeto { cima: true, baixo: false, ... }
    let novaX = this.x;
    let novaY = this.y;
    let mexeu = false;

    if (teclas.cima) { novaY -= this.velocidade; this.direcao = 3; mexeu = true; }
    if (teclas.baixo) { novaY += this.velocidade; this.direcao = 0; mexeu = true; }
    if (teclas.esquerda) { novaX -= this.velocidade; this.direcao = 1; mexeu = true; }
    if (teclas.direita) { novaX += this.velocidade; this.direcao = 2; mexeu = true; }

    // --- CORREÇÃO DE ANIMAÇÃO ---
    // Se 'mexeu' for falso (nenhuma tecla pressionada),
    // definimos isMoving como falso e saímos.
    if (!mexeu) {
      this.isMoving = false;
      return;
    }
   
    this.isMoving = true; // Se 'mexeu' for verdadeiro, define como movendo

    // --- CORREÇÃO DE COLISÃO DIAGONAL (SLIDE) ---
    // 1. Verifica e move no eixo X primeiro
    if (this.x !== novaX) { // Só checa se houve tentativa de mover em X
      if (!this.checarColisao(novaX, this.y)) {
        this.x = novaX;
      }
    }
    // 2. Verifica e move no eixo Y DEPOIS, usando a posição X atualizada (this.x)
    if (this.y !== novaY) { // Só checa se houve tentativa de mover em Y
      if (!this.checarColisao(this.x, novaY)) { // Usa this.x (o X novo)
        this.y = novaY;
      }
    }
    // --- FIM DA CORREÇÃO DE COLISÃO ---

    // Garante que o jogador não saia dos limites do mapa
    // A lógica de limite agora usa a hitbox correta (largura/altura)
    this.x = Math.max(0, Math.min(this.x, map.imagem.width - this.hitboxWidth));
    this.y = Math.max(0, Math.min(this.y, map.imagem.height - this.hitboxHeight));

    map.atualizarCamera(this);
  }

  checarColisao(x, y) {
    // A lógica de checagem em si está correta, mas agora
    // usará os novos valores de hitbox (offset 0, size 62)
    const esquerda = Math.floor((x + this.hitboxOffsetX) / TAM_BLOCO);
    const direita = Math.floor((x + this.hitboxOffsetX + this.hitboxWidth - 1) / TAM_BLOCO);
    const topo = Math.floor((y + this.hitboxOffsetY) / TAM_BLOCO);
    const base = Math.floor((y + this.hitboxOffsetY + this.hitboxHeight - 1) / TAM_BLOCO);

    for (let linha = topo; linha <= base; linha++) {
      for (let coluna = esquerda; coluna <= direita; coluna++) {
        // Verifica se a linha existe e se a coluna é 1
        if (colisoes[linha] && colisoes[linha][coluna] === 1) {
          return true; // Colisão
        }
      }
    }
    return false; // Sem colisão
  }

  // A lógica de animação está corretamente aqui
  desenhar(ctx, map) {
    const linha = this.rows[this.direcao];
    const posX = (this.x - map.cameraX) * map.zoom;
    const posY = (this.y - map.cameraY) * map.zoom;
    const spriteWidth = this.largura * 1.7;
    const spriteHeight = this.altura * 1.7;

    // --- Lógica de Animação ---
    if (this.isMoving) {
      this.tickCount++;
      if (this.tickCount > this.ticksPerFrame) {
        this.tickCount = 0;
        this.frameIndex++;
        if (this.frameIndex > 5) this.frameIndex = 0; // loop de 6 frames
      }
    } else {
      this.frameIndex = this.frameInicial; // volta para o frame inicial
      this.tickCount = 0;
    }
    // --- Fim da Lógica de Animação ---

    ctx.drawImage(
      this.spritesheet,
      this.frameIndex * this.frameW, linha * this.frameH,
      this.frameW, this.frameH,
      posX, posY,
      spriteWidth, spriteHeight
    );
  }
}