// falaInicial.js
let falaInicialAtiva = true;
let textoFala = "Ethan: Meu chefe mandou eu ir direto para a pousada ao chegar.";
let textoFalaAtual = "";
let indiceFala = 0;
let falaTerminou = false;
let intervaloFala;

// Inicia o efeito de digitação da fala
function iniciarFalaInicial() {
  falaInicialAtiva = true;
  textoFalaAtual = "";
  indiceFala = 0;
  falaTerminou = false;

  intervaloFala = setInterval(() => {
    if (indiceFala < textoFala.length) {
      textoFalaAtual += textoFala[indiceFala];
      indiceFala++;
    } else {
      falaTerminou = true;
      clearInterval(intervaloFala);
    }
  }, 40);
}

// Desenha a caixa de fala na tela
function desenharFalaInicial(ctx, canvas) {
  const larguraCaixa = canvas.width * 0.8;
  const alturaCaixa = 120;
  const x = (canvas.width - larguraCaixa) / 2;
  const y = canvas.height - alturaCaixa - 20;

  // Fundo da caixa
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(x, y, larguraCaixa, alturaCaixa);

  // Contorno branco
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, larguraCaixa, alturaCaixa);

  // Texto
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText(textoFalaAtual, x + 20, y + 50);

  // Dica
  if (falaTerminou) {
    ctx.font = "16px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("Pressione ESPAÇO para continuar", x + larguraCaixa - 310, y + alturaCaixa - 10);
  }
}
