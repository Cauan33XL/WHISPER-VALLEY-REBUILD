class Final {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;

    this.cenasRuim = [
      { imagem: "assets/cena-11.png", falas: ["Ethan: Mas o quê?! Sumiram!", 
        ".",
        "Ethan: Onde estão...? Os pedestais? As estátuas?", 
        ".",
        "Ethan: Isto não está certo. De jeito nenhum."] },

      { imagem: "assets/cena-12.png", falas: [".",
        "Líder da Seita: Você chegou, Ethan. No momento certo.", 
        ".",
        "Ethan: Quem... quem são vocês?! Fiquem longe!", 
        ".",
        "Membro da Seita: O Abraxas espera. Sua chegada é um sinal.", 
        ".",
        "Ethan: Sinal de quê?! Não! Eu não tenho nada a ver com isso!", 
        ".",
        "Ethan: Deixem-me ir!", 
        ".",
        "Líder da Seita: O sacrifício é necessário. Uma honra.", 
        ".",
        "Ethan: Sacrifício?! Não! Eu me recuso!", 
        ".",
        "(Os membros da seita avançam rapidamente sobre Ethan.)", 
        ".",
        "Ethan: Não! Soltem-me! Eu não quero! NÃO!"] },
      { imagem: "assets/cena-13.png", falas: [".",
        "(Gritos de Ethan são abafados enquanto ele é levado para o fogo.)",
        
        "Líder da Seita: A oferenda foi aceita. Glória a Abraxas."] }
    ];

    this.cenasBom = [
      { imagem: "assets/cena-14.png", falas: ["Ethan: Mas o quê?! Sumiram!", 
        ".",
        "Ethan: Onde estão...? Os pedestais? As estátuas?", 
        ".",
        "Ethan: Isto não está certo. De jeito nenhum."] },
      { imagem: "assets/cena-15.png", falas: [
        ".",
        "Líder da Seita: Você chegou, viajante. O momento da oferenda se aproxima.", 
        ".",
        "Ethan: O quê...? Quem são vocês?! Fiquem longe de mim!", 
        ".",
        "Membro da Seita: O Abraxas aguarda. Sua alma será uma dádiva.", 
        ".",
        "Ethan: Dádiva? Não! Eu não serei sacrifício para ninguém!", 
        ".",
        "Líder da Seita: Tola resistência.", 
        ".",
        "(Ethan, desesperado, saca o talismã que havia pego.)", 
        ".",
        "(Ele o ergue, e uma luz surge dele)", 
        ".",
        "(desorientando os membros da seita por um breve momento.)",
        ".",
        "Membro da Seita: O que é isso?!", 
        ".",
        "Líder da Seita: Peguem-no! Não o deixem escapar!"] },
      { imagem: "assets/cena-16.png", falas: [".",
        "(Aproveitando a confusão)",
        ".",
        "( Ethan se vira e corre, desaparecendo rapidamente entre as árvores da floresta.)", 
        ".",
        "(enquanto os gritos da seita ficam para trás.)"] }
    ];

    this.cenas = [];
    this.indiceCena = 0;
    this.indiceFala = 0;
    this.imagem = new Image();
    this.ativa = false;
    this.fimTelaFinal = false;
    this.fimMensagem = null;

    this.podeAvancar = true; // só precisa de uma flag

    window.addEventListener("keydown", (e) => {
      if (!this.ativa) return;

      if (!this.fimTelaFinal && e.code === "Space" && this.podeAvancar) {
        this.podeAvancar = false; // trava até soltar
        this.avancarFala();
      }

      if (this.fimTelaFinal && e.code === "KeyR") {
        this.reiniciar();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        this.podeAvancar = true; // libera próximo avanço
      }
    });
  }

  todosPuzzlesCompletos() {
    return CemeteryPuzzle.isCompleted() &&
           ChurchPuzzle.isCompleted() &&
           RuinsPuzzle.isCompleted() &&
           LakePuzzle.isCompleted();
  }

  temRelic() {
    return inventario?.itens?.includes("Relíquia");
  }

  iniciar() {
    if (!this.todosPuzzlesCompletos()) return;

    this.ativa = true;
    this.indiceCena = 0;
    this.indiceFala = 0;
    this.cenas = this.temRelic() ? this.cenasBom : this.cenasRuim;
    this.fimMensagem = this.temRelic() ? "bom" : "ruim";
    this.carregarCena();
  }

        avancarFala() {
      const cena = this.cenas[this.indiceCena];
      if (!cena) return;

      this.indiceFala++;

      if (this.indiceFala >= cena.falas.length) {
        this.indiceFala = 0;
        this.indiceCena++;

        if (this.indiceCena >= this.cenas.length) {
          this.exibirTelaFinal();
          this.desenhar();
          return;
        } else {
          this.carregarCena();
          return;
        }
      }

      this.desenhar();
    }


    carregarCena() {
      const cena = this.cenas[this.indiceCena];
      if (!cena) return;

      this.imagem = new Image();
      this.imagem.src = cena.imagem;
      this.imagem.onload = () => {
        this.desenhar();
      };
    }





  desenhar() {
    if (!this.ativa) return;

    // Fundo preto
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.fimTelaFinal) {
      if (this.imagem.complete) {
        this.ctx.drawImage(this.imagem, 0, 0, this.canvas.width, this.canvas.height);
      }

      const cena = this.cenas[this.indiceCena];
      const falaAtual = cena?.falas[this.indiceFala] || "";
      const caixaAltura = 100;
      const caixaX = 30;
      const caixaY = this.canvas.height - caixaAltura - 30;
      const caixaLargura = this.canvas.width - 60;

      this.ctx.fillStyle = "rgba(0,0,0,0.7)";
      this.ctx.fillRect(caixaX, caixaY, caixaLargura, caixaAltura);
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(caixaX, caixaY, caixaLargura, caixaAltura);

      this.ctx.fillStyle = "white";
      this.ctx.font = "20px monospace";
      this.ctx.textAlign = "left";
      const padding = 20;
      falaAtual.split("\n").forEach((linha, i) => {
        this.ctx.fillText(linha, caixaX + padding, caixaY + 30 + i * 25);
      });

      this.ctx.font = "16px monospace";
      this.ctx.textAlign = "right";
      this.ctx.fillText("ESPAÇO para avançar", caixaX + caixaLargura - padding, caixaY + caixaAltura - 10);

      // Agora que desenhou, permite avançar
      this.podeAvancar = true;
    } else {
      // Tela final...
      this.podeAvancar = false;
      this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "white";
    this.ctx.font = "28px monospace";
    this.ctx.textAlign = "center";

    if (this.fimMensagem === "ruim") {
        this.ctx.fillText("Fim!", this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = "20px monospace";
        this.ctx.fillText("Você fez o final ruim!", this.canvas.width / 2, this.canvas.height / 2 + 20);
    } else {
        const mensagem = "Depois de retornar, Ethan publica sua matéria, mas ninguém acredita em sua história.\nO mundo a trata como uma obra de ficção.\n Por causa do fracasso da publicação, ele é demitido do jornal e\n permanece como o único vivo que conhece a verdade sobre Whisper Valley.";
        this.ctx.font = "20px monospace";
        const linhas = mensagem.split("\n");
        linhas.forEach((linha, i) => {
            this.ctx.fillText(linha, this.canvas.width / 2, this.canvas.height / 2 - 100 + i * 28);
        });
        this.ctx.font = "28px monospace"; 
        this.ctx.fillText("Fim! Você fez o final bom?!", this.canvas.width / 2, this.canvas.height / 2 + 80);
    }

    this.ctx.font = "16px monospace";
    this.ctx.fillText('Pressione "ESPAÇO" para jogar de novo', this.canvas.width / 2, this.canvas.height - 40);
    }
  }

  exibirTelaFinal() {
    this.fimTelaFinal = true;
  }

  reiniciar() {
    window.location.reload();
  }
}
