// npc.js
class NPC {
  constructor(x, y, largura = 32, altura = 48, falas = [], imagemSrc = "assets/npc-1.png") {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;
    this.falas = falas;
    this.indiceFala = 0;
    this.distanciaInteracao = 150;
    this.interagindo = false;
    this.mensagemVisivel = false;

    // Carrega a imagem do NPC
    this.imagem = new Image();
    this.imagem.src = imagemSrc;
    this.imagemPronta = false;
    this.imagem.onload = () => {
      this.imagemPronta = true;
    };
  }

  checarInteracao(player) {
  const playerCentroX = player.x + player.hitboxOffsetX + player.hitboxWidth / 2;
  const playerCentroY = player.y + player.hitboxOffsetY + player.hitboxHeight / 2;

  const npcCentroX = this.x + this.largura / 2;
  const npcCentroY = this.y + this.altura / 2;

  const distancia = Math.hypot(
    playerCentroX - npcCentroX,
    playerCentroY - npcCentroY
  );

  this.mensagemVisivel = distancia < 150; // distância de interação ajustável
}

  interagir() {
    if (!this.interagindo) {
      this.interagindo = true;
      npcInteragindo = true; // 🔒 trava movimento do jogador
      this.indiceFala = 0;
    } else {
      this.indiceFala++;
      if (this.indiceFala >= this.falas.length) {
        this.interagindo = false;
        npcInteragindo = false; // 🔓 libera movimento quando termina
        this.indiceFala = 0;
      }
    }
  }


  desenhar(ctx, map) {
    const posX = Math.round((this.x - map.cameraX) * map.zoom);
    const posY = Math.round((this.y - map.cameraY) * map.zoom);
    const largura = Math.round(this.largura * map.zoom);
    const altura = Math.round(this.altura * map.zoom);

    //  Desenha a imagem do NPC se estiver carregada
    if (this.imagemPronta) {
      ctx.drawImage(this.imagem, posX, posY, largura, altura);
    } else {
      // fallback (caso a imagem ainda não tenha carregado)
      ctx.fillStyle = "#1E90FF";
      ctx.fillRect(posX, posY, largura, altura);
    }

    // Dica para interagir
    if (this.mensagemVisivel && !this.interagindo) {
      ctx.save();
      ctx.font = `${Math.max(12, 16 * map.zoom)}px monospace`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      const tx = posX + largura / 2;
      const ty = posY - 10;
      ctx.fillText("ESPAÇO para interagir", tx, ty);
      ctx.restore();
    }

    // Caixa de diálogo
    if (this.interagindo) {
      const larguraCaixa = Math.min(600, ctx.canvas.width - 40);
      const alturaCaixa = 110;
      const px = (ctx.canvas.width - larguraCaixa) / 2;
      const py = ctx.canvas.height - alturaCaixa - 30;

      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(px, py, larguraCaixa, alturaCaixa);

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, larguraCaixa, alturaCaixa);

      ctx.fillStyle = "white";
      ctx.font = "18px monospace";
      ctx.textAlign = "left";
      const padding = 16;
      const maxWidth = larguraCaixa - padding * 2;

      const falaAtual = this.falas[this.indiceFala];
      this._drawTextWrapped(ctx, falaAtual, px + padding, py + 28, maxWidth, 22);

      ctx.font = "14px monospace";
      ctx.fillText("ESPAÇO para continuar", px + padding, py + alturaCaixa - 12);
    }
  }

  _drawTextWrapped(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }
}
