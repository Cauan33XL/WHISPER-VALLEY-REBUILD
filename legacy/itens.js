// itens.js
class Item {
  constructor(nome, x, y, imagemSrc) {
    this.nome = nome;
    this.x = x;
    this.y = y;
    this.largura = 80;
    this.altura = 80;
    this.coletado = false;
    this.imagem = new Image();
    this.imagem.src = imagemSrc;
    this.mensagemVisivel = false;
  }

  desenhar(ctx, map) {
    if (this.coletado) return;

    const posX = (this.x - map.cameraX) * map.zoom;
    const posY = (this.y - map.cameraY) * map.zoom;

    ctx.drawImage(this.imagem, posX, posY, this.largura * map.zoom, this.altura * map.zoom);

    if (this.mensagemVisivel) {
      ctx.font = `${Math.max(12, 16 * map.zoom)}px monospace`;
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("ESPAÇO para coletar", posX + this.largura / 2, posY - 10);
    }
  }

  checarInteracao(player) {
    const cx = player.x + player.largura / 2;
    const cy = player.y + player.altura / 2;
    const ix = this.x + this.largura / 2;
    const iy = this.y + this.altura / 2;
    const distancia = Math.sqrt((cx - ix) ** 2 + (cy - iy) ** 2);
    this.mensagemVisivel = distancia <= 120 && !this.coletado;
    return this.mensagemVisivel;
  }
}

class Inventario {
  constructor() {
    this.itens = [];
    this.visivel = false;
    this.botao = { x: 20, y: 20, largura: 60, altura: 60 };
    this.icone = new Image();
    this.icone.src = "assets/itens/mochila.png";
  }

  adicionarItem(nome) {
    this.itens.push(nome);
  }

  desenharBotao(ctx) {
    ctx.drawImage(this.icone, this.botao.x + 8, this.botao.y + 8, 44, 44);
  }

  checarClique(x, y) {
    if (
      x >= this.botao.x &&
      x <= this.botao.x + this.botao.largura &&
      y >= this.botao.y &&
      y <= this.botao.y + this.botao.altura
    ) {
      this.visivel = !this.visivel;
    }
  }

desenharInventario(ctx, canvas) {
  if (!this.visivel) return;

  const largura = 400;
  const altura = 250;
  const px = (canvas.width - largura) / 2;
  const py = (canvas.height - altura) / 2;

  // Fundo da mochila
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(px, py, largura, altura);
  ctx.strokeStyle = "white";
  ctx.strokeRect(px, py, largura, altura);

  // Título centralizado
  ctx.fillStyle = "white";
  ctx.font = "22px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Mochila", px + largura / 2, py + 35);

  // Itens alinhados à esquerda, com espaçamento interno
  ctx.textAlign = "left";
  ctx.font = "18px monospace";

  const inicioY = py + 70; // Posição inicial para os itens
  const paddingX = px + 30; // Margem lateral

  if (this.itens.length === 0) {
    ctx.fillText("Vazia", paddingX, inicioY);
  } else {
    this.itens.forEach((item, i) => {
      ctx.fillText(`• ${item}`, paddingX, inicioY + i * 28);
    });
  }
}

}

// ------------------- SISTEMA DE ITENS -------------------
const itens = [
  new Item("Pedra", 2500, 1250, "assets/itens/pedra.png"),
  new Item("Flor", 8500, 5400, "assets/itens/flor.png"),
  new Item("Cálice", 6030, 700, "assets/itens/calice.png"),
  new Item("Pena", 2300, 4400, "assets/itens/pena.png"),
  new Item("Relíquia", 8560, 170, "assets/itens/reliquia.png")
];

const inventario = new Inventario();
let itemColetado = null;
let tempoMensagem = 0;

function desenharItens(ctx, map) {
  itens.forEach(item => {
    item.checarInteracao(player);
    item.desenhar(ctx, map);
  });

  inventario.desenharBotao(ctx);
  inventario.desenharInventario(ctx, canvas);

  // Desenha a mensagem de item coletado por cima de tudo
  if (itemColetado && Date.now() - tempoMensagem < 2000) {
    ctx.save();
    ctx.globalAlpha = 1;
    desenharMensagemItem(ctx, canvas, `Você coletou: ${itemColetado}`);
    ctx.restore();
  }
}

function desenharMensagemItem(ctx, canvas, texto) {
  const largura = 500;
  const altura = 100;
  const px = (canvas.width - largura) / 2;
  const py = canvas.height - altura - 30;

  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(px, py, largura, altura);
  ctx.strokeStyle = "white";
  ctx.strokeRect(px, py, largura, altura);

  ctx.fillStyle = "white";
  ctx.font = "18px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, px + largura / 2, py + altura / 2);
}

function tentarColetarItem() {
  const item = itens.find(i => i.mensagemVisivel && !i.coletado);
  if (item) {
    item.coletado = true;
    inventario.adicionarItem(item.nome);
    itemColetado = item.nome;
    tempoMensagem = Date.now();
  }
}

// Clique na mochila
function desenharItens(ctx, map) {
  itens.forEach(item => {
    item.checarInteracao(player);
    item.desenhar(ctx, map);
  });

  inventario.desenharBotao(ctx);
  inventario.desenharInventario(ctx, canvas);

  // Desenha a mensagem de item coletado por cima de tudo
  if (itemColetado && Date.now() - tempoMensagem < 2000) {
    ctx.save();
    ctx.globalAlpha = 1;
    desenharMensagemItem(ctx, canvas, `Você coletou: ${itemColetado}`);
    ctx.restore();
  }
}

// Ativa o clique na mochila
setTimeout(() => {
  const canvas = document.getElementById("meu_canvas");
  canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * escalaX;
    const y = (e.clientY - rect.top) * escalaY;
    inventario.checarClique(x, y);
  });

    canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * escalaX;
    const y = (e.clientY - rect.top) * escalaY;

    inventario.hover =
      x >= inventario.botao.x &&
      x <= inventario.botao.x + inventario.botao.largura &&
      y >= inventario.botao.y &&
      y <= inventario.botao.y + inventario.botao.altura;

    canvas.style.cursor = inventario.hover ? "pointer" : "default";
  });

}, 100);

