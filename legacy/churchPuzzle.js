// churchPuzzle.js
// Puzzle da igreja — separado em arquivo.
// Uso:
//  ChurchPuzzle.init({ x, y, w, h, symbols: [...paths], correctSequence: [0,1,2,3] })
//  No loop de desenho: ChurchPuzzle.draw(ctx, mapa, player)
//  Para checar proximidade no teclado: ChurchPuzzle.playerInArea(player, mapa)
//  Para abrir manualmente: ChurchPuzzle.showModal()

const ChurchPuzzle = (function () {
  // estado interno
  let area = { x: 0, y: 0, w: 200, h: 200 };
  let symbols = [
    "assets/simbolos/chave.jpg",
    "assets/simbolos/fragmento.jpg",
    "assets/simbolos/sol.jpg",
    "assets/simbolos/triangulo.jpg"
  ]; // paths padrão — troque pelos seus
  let correctSequence = [0, 1, 2, 3]; // padrão (índices dos símbolos na ordem correta)
  let selected = []; // índices selecionados na ordem
  let completed = false;
  let modalOpen = false;
  let orientationVisible = true; // quadrado vermelho orientador
  let modalEl = null;

  // init com opções
  function init(opts = {}) {
    if (!opts) opts = {};
    if (typeof opts.x === "number") area.x = opts.x;
    if (typeof opts.y === "number") area.y = opts.y;
    if (typeof opts.w === "number") area.w = opts.w;
    if (typeof opts.h === "number") area.h = opts.h;
    if (Array.isArray(opts.symbols) && opts.symbols.length >= 4) symbols = opts.symbols.slice(0, 4);
    if (Array.isArray(opts.correctSequence) && opts.correctSequence.length === 4) correctSequence = opts.correctSequence.slice();
    if (typeof opts.orientationVisible === "boolean") orientationVisible = opts.orientationVisible;
    // pre-carregar imagens (opcional)
    preloadSymbols();
    ensureModalExists();
  }

  // pre-carrega imagens dos símbolos
  const _imgCache = [];
  function preloadSymbols() {
    _imgCache.length = 0;
    for (let i = 0; i < symbols.length; i++) {
      const img = new Image();
      img.src = symbols[i];
      _imgCache.push(img);
    }
  }

  // transforma coordenada do mundo -> tela via mapa.cameraX/Y e mapa.zoom (se existir)
  function worldToScreen(x, y, mapa) {
    const zoom = mapa && typeof mapa.zoom === "number" ? mapa.zoom : 1;
    const camX = mapa && typeof mapa.cameraX === "number" ? mapa.cameraX : 0;
    const camY = mapa && typeof mapa.cameraY === "number" ? mapa.cameraY : 0;
    return {
      x: Math.round((x - camX) * zoom),
      y: Math.round((y - camY) * zoom),
      zoom
    };
  }

  // desenha quadrado vermelho orientador e mensagem "ESPAÇO para interagir" se o player estiver na área
  function draw(ctx, mapa, player) {
    if (!ctx || !mapa || !player) return;

    // quadrado vermelho de orientação (apenas se não concluído e visível)
    if (!completed && orientationVisible) {
      const topLeft = worldToScreen(area.x, area.y, mapa);
      const sizeW = Math.round(area.w * (mapa.zoom || 1));
      const sizeH = Math.round(area.h * (mapa.zoom || 1));
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(topLeft.x, topLeft.y, sizeW, sizeH);
      ctx.restore();
    }

    // Se jogador estiver na área e puzzle não concluído -> mostra "ESPAÇO para interagir"
    if (!completed && playerInArea(player, mapa)) {
      ctx.save();
      ctx.font = "18px monospace";
      ctx.fillStyle = "white";
      // posição acima do jogador
      const screenPos = worldToScreen(player.x, player.y - 40, mapa);
      ctx.fillText("ESPAÇO para interagir", screenPos.x - 40, screenPos.y);
      ctx.restore();
    }
  }

  // verifica se jogador está dentro da área (usamos o centro do player, ou retângulo se você tiver)
    function playerInArea(player, mapa) {
  if (!player || !mapa) return false;

  // Considera o tamanho real do player (largura e altura)
  const playerLeft = player.x;
  const playerRight = player.x + player.largura;
  const playerTop = player.y;
  const playerBottom = player.y + player.altura;

  // Área do puzzle
  const areaLeft = area.x;
  const areaRight = area.x + area.w;
  const areaTop = area.y;
  const areaBottom = area.y + area.h;

  // Verifica colisão simples entre player e área
  const colide =
    playerRight >= areaLeft &&
    playerLeft <= areaRight &&
    playerBottom >= areaTop &&
    playerTop <= areaBottom;

  return colide && !completed;
}

  // cria a modal HTML (apenas uma vez)
function ensureModalExists() {
  if (modalEl) return;

  // container
  modalEl = document.createElement("div");
  modalEl.id = "church-puzzle-modal";
  modalEl.style.position = "fixed";
  modalEl.style.left = "0";
  modalEl.style.top = "0";
  modalEl.style.width = "100%";
  modalEl.style.height = "100%";
  modalEl.style.display = "none";
  modalEl.style.justifyContent = "center";
  modalEl.style.alignItems = "center";
  modalEl.style.zIndex = "9999";

  // overlay
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.6)";
  modalEl.appendChild(overlay);

  // card
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.minWidth = "520px";
  card.style.maxWidth = "90%";
  card.style.padding = "20px";
  card.style.borderRadius = "12px";
  card.style.background = "#111";
  card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.6)";
  card.style.color = "white";
  card.style.fontFamily = "monospace";
  card.style.zIndex = "10000";
  modalEl.appendChild(card);

  // header / frase curta
  const header = document.createElement("div");
  header.style.marginBottom = "12px";
  header.innerHTML = `
     <div style="font-size:13px;opacity:0.8;">
      Coloque os símbolos na ordem certa de acordo com a frase:
    </div>
    <div style="font-size:16px;margin-bottom:6px; margin-top:4px;">
      Do quebrado, a chama ascende e o desvendar aguarda a aurora.
    </div>
   
  `;
  card.appendChild(header);

  // container dos 4 símbolos
  const symbolsRow = document.createElement("div");
  symbolsRow.style.display = "flex";
  symbolsRow.style.justifyContent = "space-between";
  symbolsRow.style.alignItems = "flex-start";
  symbolsRow.style.gap = "12px";
  symbolsRow.style.marginBottom = "16px";
  card.appendChild(symbolsRow);

  // cria 4 botões redondos
  for (let i = 0; i < 4; i++) {
    const btnWrap = document.createElement("div");
    btnWrap.style.width = "100px";
    btnWrap.style.textAlign = "center";

    const btn = document.createElement("button");
    btn.className = "church-symbol-btn";
    btn.dataset.index = i;
    btn.style.width = "100px";
    btn.style.height = "100px";
    btn.style.borderRadius = "50%";
    btn.style.border = "2px solid #444";
    btn.style.background = "#fff"; // fundo branco
    btn.style.border = "2px solid #444"; // mantém o contorno escuro
    btn.style.overflow = "hidden";
    btn.style.cursor = "pointer";
    btn.style.position = "relative";
    btn.style.padding = "0";
    btn.style.display = "inline-block";

    const img = document.createElement("img");
    img.style.width = "80%";
    img.style.height = "80%";
    img.style.objectFit = "contain";
    img.style.position = "absolute";
    img.style.left = "50%";
    img.style.top = "10%";
    img.style.transform = "translateX(-50%)";
    img.src = symbols[i] || "";
    img.alt = `símbolo ${i + 1}`;

    btn.appendChild(img);

    // legenda pequena com índice
    const idxLabel = document.createElement("div");
    idxLabel.style.marginTop = "8px";
    idxLabel.style.fontSize = "12px";
    idxLabel.style.opacity = "0.8";
    idxLabel.innerText = "";
    btnWrap.appendChild(btn);
    btnWrap.appendChild(idxLabel);

    symbolsRow.appendChild(btnWrap);

    btn.addEventListener("click", (e) => {
      if (modalOpen === false || completed) return;
      const index = parseInt(btn.dataset.index, 10);
      handleSymbolClick(btn, index, idxLabel);
    });
  }

  // área de status (mensagens coloridas)
  const status = document.createElement("div");
  status.id = "church-puzzle-status";
  status.style.height = "26px";
  status.style.marginBottom = "12px";
  status.style.fontSize = "14px";
  status.style.opacity = "0.95";
  status.style.transition = "color 0.3s ease";
  card.appendChild(status);

  // botões de ação
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "space-between";
  actions.style.alignItems = "center";
  actions.style.gap = "12px";

  const leftGroup = document.createElement("div");
  leftGroup.style.display = "flex";
  leftGroup.style.gap = "8px";

  const verificarBtn = document.createElement("button");
  verificarBtn.id = "church-puzzle-verificar";
  verificarBtn.innerText = "Verificar";
  verificarBtn.style.padding = "8px 14px";
  verificarBtn.style.borderRadius = "8px";
  verificarBtn.style.border = "none";
  verificarBtn.style.cursor = "pointer";
  verificarBtn.style.background = "#2b7";
  verificarBtn.style.color = "#000";
  verificarBtn.addEventListener("click", () => {
    if (!modalOpen) return;
    handleVerificar(status);
  });

  const fecharBtn = document.createElement("button");
  fecharBtn.id = "church-puzzle-fechar";
  fecharBtn.innerText = "Fechar";
  fecharBtn.style.padding = "8px 12px";
  fecharBtn.style.borderRadius = "8px";
  fecharBtn.style.border = "none";
  fecharBtn.style.cursor = "pointer";
  fecharBtn.style.background = "#444";
  fecharBtn.style.color = "#fff";
  fecharBtn.addEventListener("click", () => {
    closeModal();
  });

  leftGroup.appendChild(verificarBtn);
  actions.appendChild(leftGroup);
  actions.appendChild(fecharBtn);
  card.appendChild(actions);

  document.body.appendChild(modalEl);
}


  // quando um símbolo é clicado
function handleSymbolClick(btn, index, idxLabel) {
  const status = document.getElementById("church-puzzle-status");

  // caso o jogador queira "desclicar" um símbolo já selecionado
  if (selected.includes(index)) {
    // remove esse índice da seleção
    selected = selected.filter(i => i !== index);

    // reseta o visual do botão
    const img = btn.querySelector("img");
    if (img) {
      img.style.transition = "transform 140ms, opacity 140ms";
      img.style.transform = "translateX(-50%) scale(1)";
      img.style.opacity = "1";
    }

    // remove número do rótulo
    if (idxLabel) idxLabel.innerText = "";

    // reatualiza a numeração dos outros símbolos
    const allBtns = document.querySelectorAll(".church-symbol-btn");
    allBtns.forEach(b => {
      const i = parseInt(b.dataset.index, 10);
      const wrapLabel = b.parentElement.querySelector("div");
      if (wrapLabel) {
        const pos = selected.indexOf(i);
        wrapLabel.innerText = pos >= 0 ? `${pos + 1}` : "";
      }
    });

    // limpa status
    if (status) status.innerText = "";
    return;
  }

  // impede selecionar mais que 4
  if (selected.length >= 4) return;

  // adiciona novo símbolo
  selected.push(index);

  // efeito visual (leve zoom)
  const img = btn.querySelector("img");
  if (img) {
    img.style.transition = "transform 140ms, opacity 140ms";
    img.style.transform = "translateX(-50%) scale(0.95)";
    img.style.opacity = "0.9";
  }

  // mostra ordem escolhida (pequeno rótulo)
  if (idxLabel) idxLabel.innerText = `${selected.length}`;

  // se selecionou os 4, mostra dica para verificar
  if (selected.length === 4 && status) {
    status.style.transition = "none";
    status.style.color = "#ffffff";
    status.innerText = "Todos os símbolos selecionados. Clique em Verificar.";
    setTimeout(() => status.style.transition = "color 0.3s ease", 50);
  } else if (status) {
    status.innerText = "";
  }
}

  // verifica se a sequência está correta
  function handleVerificar(statusEl) {
  if (selected.length !== 4) {
    if (statusEl) {
      statusEl.style.color = "#ff5555"; // vermelho
      statusEl.innerText = "Selecione os 4 símbolos antes de verificar.";
      setTimeout(() => { if (statusEl) statusEl.innerText = ""; }, 1400);
    }
    return;
  }

  // compara arrays de índices
  let ok = true;
  for (let i = 0; i < 4; i++) {
    if (selected[i] !== correctSequence[i]) {
      ok = false;
      break;
    }
  }

  if (ok) {
    if (statusEl) {
      statusEl.style.color = "#00ff88"; // verde
      statusEl.innerText = "O segredo por trás do enigma foi revelado.";
    }
    completed = true;
    modalOpen = false;
    setTimeout(() => { closeModal(); }, 2000);
    const ev = new CustomEvent("churchPuzzleSolved", { detail: { area, correctSequence } });
    window.dispatchEvent(ev);
  } else {
    if (statusEl) {
      statusEl.style.color = "#ff5555"; // vermelho
      statusEl.innerText = "Errado — tente outra ordem.";
    }
    setTimeout(() => {
      resetSelectionsVisual();
      selected = [];
      if (statusEl) statusEl.innerText = "";
    }, 900);
  }
}


  // fecha o modal e reseta seleção (se não completado)
  function closeModal() {
    if (!modalEl) return;
    modalOpen = false;
    modalEl.style.display = "none";
    // se não foi concluído, resetar seleção
    if (!completed) {
      selected = [];
      resetSelectionsVisual();
    } else {
      // se concluído, deixar os botões desativados (já não reabrirá porque completed=true)
      disableAllButtons();
    }
  }

  // abre modal (só se ainda não foi completado)
  function showModal() {
    if (!modalEl) ensureModalExists();
    if (completed) {
      // opcional: indicar que já foi feito
      const prev = document.getElementById("church-puzzle-status");
      if (prev) prev.innerText = "Já resolvido.";
      setTimeout(() => { if (prev) prev.innerText = ""; }, 900);
      return;
    }
    modalOpen = true;
    selected = [];
    resetSelectionsVisual();
    // atualizar imagens (caso symbols tenha sido alterado)
    const imgs = modalEl.querySelectorAll(".church-symbol-btn img");
    imgs.forEach((img, i) => {
      if (symbols[i]) img.src = symbols[i];
      img.style.transform = "translateX(-50%) translateY(0%)";
      img.style.opacity = "1";
    });
    modalEl.style.display = "flex";
  }

  function resetSelectionsVisual() {
    if (!modalEl) return;
    const imgs = modalEl.querySelectorAll(".church-symbol-btn img");
    imgs.forEach((img) => {
      img.style.transition = "transform 140ms";
      img.style.transform = "translateX(-50%) translateY(0%) scale(1)";
      img.style.opacity = "1";
    });
    // limpar rótulos
    const labels = modalEl.querySelectorAll("div > div");
    // safer: limpar qualquer pequeno label criado:
    const idxs = modalEl.querySelectorAll(".church-symbol-btn + div");
    idxs.forEach(l => l.innerText = "");
  }

  function disableAllButtons() {
    if (!modalEl) return;
    const btns = modalEl.querySelectorAll(".church-symbol-btn");
    btns.forEach(b => b.disabled = true);
    const verificarBtn = document.getElementById("church-puzzle-verificar");
    if (verificarBtn) verificarBtn.disabled = true;
  }

  // expõe método para alterar área em tempo de execução
  function setArea(x, y, w, h) {
    if (typeof x === "number") area.x = x;
    if (typeof y === "number") area.y = y;
    if (typeof w === "number") area.w = w;
    if (typeof h === "number") area.h = h;
  }

  // expõe método para setar símbolos/ordem correta
  function setSymbols(symArray, correctSeq) {
    if (Array.isArray(symArray) && symArray.length >= 4) {
      symbols = symArray.slice(0, 4);
      preloadSymbols();
    }
    if (Array.isArray(correctSeq) && correctSeq.length === 4) {
      correctSequence = correctSeq.slice();
    }
  }
      function isCompleted() {
    return completed;
  }

    function isModalOpen() {
    return modalOpen;
  }

  return {
    init,
    draw,
    playerInArea,
    showModal,
    setArea,
    setSymbols,
    // flags e estado útil
    get completed() { return completed; },
    get area() { return area; },
    isCompleted,
    isModalOpen,
  };

})();
