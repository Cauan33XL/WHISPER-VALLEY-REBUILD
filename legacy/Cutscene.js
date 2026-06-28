class Cutscene {
  constructor(imagemSrc, falas) {
    this.imagem = new Image();
    this.imagem.src = imagemSrc;
    this.falas = falas;
    this.index = 0;
    this.finalizada = false;

    // controla o efeito de piscar do texto
    this.alpha = 1;
    this.fadeSpeed = 0.02;
    this.fadingOut = true;
  }

  desenhar(ctx, canvas) {
    ctx.drawImage(this.imagem, 0, 0, canvas.width, canvas.height);

    //  desenha a caixa de diálogo SOMENTE se houver falas
    if (this.falas.length > 0) {
      const caixaAltura = 120;
      const margem = 30;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(
        margem,
        canvas.height - caixaAltura - margem,
        canvas.width - margem * 2,
        caixaAltura
      );

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        margem,
        canvas.height - caixaAltura - margem,
        canvas.width - margem * 2,
        caixaAltura
      );

      ctx.fillStyle = "white";
      ctx.font = "20px monospace";
      const texto = this.falas[this.index];
      const linhas = this.quebrarTexto(ctx, texto, canvas.width - margem * 4);
      let y = canvas.height - caixaAltura - margem + 40;
      for (const linha of linhas) {
        ctx.fillText(linha, margem + 20, y);
        y += 28;
      }
    }

    // Texto "ESPAÇO para avançar" com efeito de piscar
    this.atualizarPiscar();
    ctx.font = "18px monospace";
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.textAlign = "right";
    ctx.fillText("ESPAÇO para avançar", canvas.width - 35, canvas.height - 40);
    ctx.textAlign = "left"; // reseta alinhamento
  }

  atualizarPiscar() {
    if (this.fadingOut) {
      this.alpha -= this.fadeSpeed;
      if (this.alpha <= 0.3) {
        this.alpha = 0.3;
        this.fadingOut = false;
      }
    } else {
      this.alpha += this.fadeSpeed;
      if (this.alpha >= 1) {
        this.alpha = 1;
        this.fadingOut = true;
      }
    }
  }

  quebrarTexto(ctx, texto, larguraMax) {
    if (!texto) return [];
    const palavras = texto.split(" ");
    const linhas = [];
    let linhaAtual = "";
    for (const palavra of palavras) {
      const teste = linhaAtual + palavra + " ";
      const largura = ctx.measureText(teste).width;
      if (largura > larguraMax && linhaAtual !== "") {
        linhas.push(linhaAtual);
        linhaAtual = palavra + " ";
      } else {
        linhaAtual = teste;
      }
    }
    linhas.push(linhaAtual);
    return linhas;
  }

  avancarFala() {
    if (this.index < this.falas.length - 1) {
      this.index++;
    } else {
      this.finalizada = true;
    }
  }
}
