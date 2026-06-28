// ------------------ CUTSCENE 5 - A POUSADA ------------------

const pontoCutscene5 = {
  x: 6150,
  y: 2470,
  largura: 200,
  altura: 200,
  ativa: false,
  jaAtivada: false
};

let mostrarAreaCutscene = false; // coloque false quando quiser esconder o quadrado

function verificarCutscene5(player) {
  if (pontoCutscene5.jaAtivada) return;

  const dentro =
    player.x + player.largura > pontoCutscene5.x &&
    player.x < pontoCutscene5.x + pontoCutscene5.largura &&
    player.y + player.altura > pontoCutscene5.y &&
    player.y < pontoCutscene5.y + pontoCutscene5.altura;

  if (dentro) {
    pontoCutscene5.ativa = true;
    pontoCutscene5.jaAtivada = true;

    // salva posição atual do jogador antes da cutscene
    pontoCutscene5.posicaoJogador = { x: player.x, y: player.y };

    jogoAtivo = false;
    currentCutscene = new Cutscene('assets/cena-5.png', [
      "Ethan: Estranho... não há ninguém aqui dentro.",
      "Ethan: É melhor eu me aproximar do balcão."
    ]);

    // marca como cutscene ativa
    currentCutscene.cutsceneEspecial = "cutscene5";
    currentCutscene.proximaCutscene = "cutscene6";
  }
}

function iniciarCutscene6() {
  currentCutscene = new Cutscene('assets/cena-6.png', [
    "Ethan: Um bilhete...? O que é isso?",
    "Ethan: 'Bem-vindo à Whisper Valley, Ethan... estávamos te esperando'.",
    "Ethan: Quem escreveu isso... e como sabia que eu viria?"
  ]);
  currentCutscene.cutsceneEspecial = "cutscene6";
}


function desenharPontoCutscene(ctx, map) {
  if (!mostrarAreaCutscene) return;
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    (pontoCutscene5.x - map.cameraX) * map.zoom,
    (pontoCutscene5.y - map.cameraY) * map.zoom,
    pontoCutscene5.largura * map.zoom,
    pontoCutscene5.altura * map.zoom
  );
}

// ------------------ CUTSCENE 7 - A Igreja ------------------

const pontoCutscene7 = {
  x: 5450, // posição X no mapa (ajuste conforme o local desejado)
  y: 900, // posição Y no mapa (ajuste conforme o local desejado)
  largura: 200,
  altura: 200,
  ativa: false,
  jaAtivada: false
};

function verificarCutscene7(player) {
  if (pontoCutscene7.jaAtivada) return;

  const dentro =
    player.x + player.largura > pontoCutscene7.x &&
    player.x < pontoCutscene7.x + pontoCutscene7.largura &&
    player.y + player.altura > pontoCutscene7.y &&
    player.y < pontoCutscene7.y + pontoCutscene7.altura;

  if (dentro) {
    pontoCutscene7.ativa = true;
    pontoCutscene7.jaAtivada = true;

    // salva posição atual do jogador
    pontoCutscene7.posicaoJogador = { x: player.x, y: player.y };

    jogoAtivo = false;
    currentCutscene = new Cutscene('assets/cena-7.png', [
      "Ethan: Que lugar é esse...? Uma igreja...",
      "Ethan: Estranho... não parece uma igreja comum.",
      "Ethan: Esses símbolos... nunca vi nada assim. Tem algo de errado aqui.",
      "Ethan: Hmm... o que é isso? Há uma frase na frente...",
      "Ethan: Parece algum tipo de enigma..."
      
    ]);

    currentCutscene.cutsceneEspecial = "cutscene7";
  }
}



function desenharPontoCutscene7(ctx, map) {
  if (!mostrarAreaCutscene) return;
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    (pontoCutscene7.x - map.cameraX) * map.zoom,
    (pontoCutscene7.y - map.cameraY) * map.zoom,
    pontoCutscene7.largura * map.zoom,
    pontoCutscene7.altura * map.zoom
  );
}

// ------------------ CUTSCENE 8 - O Cemitério ------------------

const pontoCutscene8 = {
  x: 2900, // posição X no mapa (ajuste conforme o local desejado)
  y: 200, // posição Y no mapa (ajuste conforme o local desejado)
  largura: 1100,
  altura: 550,
  ativa: false,
  jaAtivada: false
};

function verificarCutscene8(player) {
  if (pontoCutscene8.jaAtivada) return;

  const dentro =
    player.x + player.largura > pontoCutscene8.x &&
    player.x < pontoCutscene8.x + pontoCutscene8.largura &&
    player.y + player.altura > pontoCutscene8.y &&
    player.y < pontoCutscene8.y + pontoCutscene8.altura;

  if (dentro) {
    pontoCutscene8.ativa = true;
    pontoCutscene8.jaAtivada = true;

    // salva posição atual do jogador antes da cutscene
    pontoCutscene8.posicaoJogador = { x: player.x, y: player.y };

    jogoAtivo = false;
    currentCutscene = new Cutscene('assets/cena-8.png', [
      "Ethan: Não gosto do aspecto disto.",
      "(Observando o cemitério e a torre ao longe.)",
      "Ethan: Tem sete lápides. Quatro com nomes ilegíveis, e três...",
      "Ethan: ...estas estão completamente em branco.",
      "Ethan: Isto não foi um acidente."
    ]);

    currentCutscene.cutsceneEspecial = "cutscene8";
  }
}

function desenharPontoCutscene8(ctx, map) {
  if (!mostrarAreaCutscene) return;
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    (pontoCutscene8.x - map.cameraX) * map.zoom,
    (pontoCutscene8.y - map.cameraY) * map.zoom,
    pontoCutscene8.largura * map.zoom,
    pontoCutscene8.altura * map.zoom
  );
}

// ------------------ CUTSCENE 9 - O Lago ------------------

const pontoCutscene9 = {
  x: 5400, // posição X no mapa (ajuste conforme o local desejado)
  y: 5500, // posição Y no mapa (ajuste conforme o local desejado)
  largura: 400,
  altura: 200,
  ativa: false,
  jaAtivada: false
};

function verificarCutscene9(player) {
  if (pontoCutscene9.jaAtivada) return;

  const dentro =
    player.x + player.largura > pontoCutscene9.x &&
    player.x < pontoCutscene9.x + pontoCutscene9.largura &&
    player.y + player.altura > pontoCutscene9.y &&
    player.y < pontoCutscene9.y + pontoCutscene9.altura;

  if (dentro) {
    pontoCutscene9.ativa = true;
    pontoCutscene9.jaAtivada = true;

    // salva posição atual do jogador antes da cutscene
    pontoCutscene9.posicaoJogador = { x: player.x, y: player.y };

    jogoAtivo = false;
    currentCutscene = new Cutscene('assets/cena-9.png', [
      "Ethan: A névoa está densa aqui.",
      "Ethan: Silêncio absoluto... não ouço nada.",
      "Ethan: O lago... parece um espelho negro, refletindo nada além da escuridão."
      
    ]);

    currentCutscene.cutsceneEspecial = "cutscene9";
  }
}

function desenharPontoCutscene9(ctx, map) {
  if (!mostrarAreaCutscene) return;
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    (pontoCutscene9.x - map.cameraX) * map.zoom,
    (pontoCutscene9.y - map.cameraY) * map.zoom,
    pontoCutscene9.largura * map.zoom,
    pontoCutscene9.altura * map.zoom
  );
}

// ------------------ CUTSCENE 10 - Ruínas ------------------

const pontoCutscene10 = {
  x: 10250, // posição X no mapa (ajuste conforme necessário)
  y: 3400, // posição Y no mapa
  largura: 600,
  altura: 600,
  ativa: false,
  jaAtivada: false
};

function verificarCutscene10(player) {
  if (pontoCutscene10.jaAtivada) return;

  const dentro =
    player.x + player.largura > pontoCutscene10.x &&
    player.x < pontoCutscene10.x + pontoCutscene10.largura &&
    player.y + player.altura > pontoCutscene10.y &&
    player.y < pontoCutscene10.y + pontoCutscene10.altura;

  if (dentro) {
    pontoCutscene10.ativa = true;
    pontoCutscene10.jaAtivada = true;

    // salva posição atual do jogador
    pontoCutscene10.posicaoJogador = { x: player.x, y: player.y };

    jogoAtivo = false;
    currentCutscene = new Cutscene('assets/cena-10.png', [
      "Ethan: Mas o que é isso...? Ruínas em meio a este lugar... É de dar calafrios.",
      "Ethan: Essas estátuas... e os pedestais. Eles não parecem estar aqui por acaso.",
      "Ethan: Símbolos em cada um... Um de água, outro de folha ou broto, terra... e um tipo de espiral?",
      "Ethan: Devem ser indicações. Cada pedestal pede por um item específico que corresponda ao seu símbolo.",
      "Ethan: A chave para o que for que esteja aqui deve ser colocar os itens corretos em cada um deles. É o que eu tenho que fazer."
    ]);

    currentCutscene.cutsceneEspecial = "cutscene10";
  }
}

function desenharPontoCutscene10(ctx, map) {
  if (!mostrarAreaCutscene) return;
  ctx.strokeStyle = "purple";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    (pontoCutscene10.x - map.cameraX) * map.zoom,
    (pontoCutscene10.y - map.cameraY) * map.zoom,
    pontoCutscene10.largura * map.zoom,
    pontoCutscene10.altura * map.zoom
  );
}


