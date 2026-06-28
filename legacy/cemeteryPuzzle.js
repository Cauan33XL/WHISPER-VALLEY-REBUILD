// cemeteryPuzzle.js
// Versão simples e independente - adiciona um puzzle no mapa, desenha orientação (quadrado vermelho),
// mostra "ESPAÇO para interagir" e abre modal com 3 inputs e botão verificar.
// Uso: CemeteryPuzzle.init({x, y, w, h}); e chamar CemeteryPuzzle.draw(ctx, map, player) no loop de desenhar.

window.CemeteryPuzzle = (function () {
  const STATE = {
    active: false,        // se o puzzle está ativo no mundo
    completed: false,     // se já foi resolvido
    rect: { x: 0, y: 0, w: 64, h: 64 }, // área do puzzle (em coords do mapa)
    showModal: false
  };

  // nomes corretos na ordem dos campos 1-2-3
  const CORRECT = ["sofia", "daniel", "jonas"];

  // distância de ativação em pixels (usada como "proximidade" alternativa)
  const PROX_DIST = 130; // você pode ajustar

  // cria o modal HTML (apenas uma vez)
  function createModal() {
    if (document.getElementById("cemetery-puzzle-modal")) return;

    const modal = document.createElement("div");
    modal.id = "cemetery-puzzle-modal";
    Object.assign(modal.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "rgba(0,0,0,0.6)",
      zIndex: 9999,
      visibility: "hidden"
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      width: "700px",
      maxWidth: "95%",
      background: "#111",
      border: "2px solid #444",
      padding: "20px",
      color: "#eee",
      fontFamily: "Arial, sans-serif",
      borderRadius: "8px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.7)"
    });

    const title = document.createElement("h2");
    title.innerText = "Escreva o nome daqueles que se foram.";
    Object.assign(title.style, { marginTop: "0", color: "#f3f3f3", fontSize: "18px" });

    const inputsWrap = document.createElement("div");
    Object.assign(inputsWrap.style, { display: "flex", gap: "10px", marginTop: "12px", marginBottom: "12px" });

    const inputs = [];
    for (let i = 0; i < 3; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `Nome`;
      Object.assign(input.style, {
        flex: "1",
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "1px solid #666",
        background: "#222",
        color: "#fff"
      });
      inputsWrap.appendChild(input);
      inputs.push(input);
    }

    const verificarBtn = document.createElement("button");
    verificarBtn.innerText = "Verificar";
    Object.assign(verificarBtn.style, {
      display: "inline-block",
      padding: "10px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      background: "#2563eb",
      color: "#fff",
      fontWeight: "600",
      marginRight: "10px"
    });

    const mensagem = document.createElement("div");
    mensagem.id = "cemetery-puzzle-msg";
    Object.assign(mensagem.style, {
      display: "inline-block",
      color: "#ffdede",
      marginLeft: "6px",
      verticalAlign: "middle",
      fontSize: "14px"
    });

    const footer = document.createElement("div");
    Object.assign(footer.style, { marginTop: "12px" });

    footer.appendChild(verificarBtn);
    footer.appendChild(mensagem);

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Fechar";
    Object.assign(closeBtn.style, {
      marginLeft: "8px",
      marginTop: "10px",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #444",
      background: "#222",
      color: "#fff",
      cursor: "pointer"
    });

    closeBtn.addEventListener("click", () => {
      hideModal();
    });

    box.appendChild(title);
    box.appendChild(inputsWrap);
    box.appendChild(footer);
    box.appendChild(closeBtn);
    modal.appendChild(box);
    document.body.appendChild(modal);

    // click verificar
    verificarBtn.addEventListener("click", () => {
      const vals = inputs.map(i => (i.value || "").trim().toLowerCase());
      const ok = vals.length === 3 &&
                vals[0] === CORRECT[0] &&
                vals[1] === CORRECT[1] &&
                vals[2] === CORRECT[2];

      const msgEl = mensagem;
      if (ok) {
        msgEl.style.color = "#32cd32"; // verde mais vibrante
        msgEl.textContent = "Correto! O silêncio agora repousa em paz...";
        STATE.completed = true;
        STATE.active = false;

        // aguarda 2 segundos antes de fechar o modal
        setTimeout(() => {
            hideModal();
        }, 2000);
        } else {
        msgEl.style.color = "#ff6b6b"; // vermelho mais visível
        msgEl.textContent = "Errado. Tente novamente.";
        }
    });

    // permitir Enter para submeter no último campo
    inputs[2].addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        inputs[2].blur();
        verificarBtn.click();
      }
    });
  }

  function showModal() {
    puzzleAtivo = true; // impede o jogador de se mover
    if (STATE.completed) return;
    createModal();
    const modal = document.getElementById("cemetery-puzzle-modal");
    modal.style.visibility = "visible";
    // foco no primeiro campo
    const first = modal.querySelector("input");
    if (first) {
      first.focus();
      first.select && first.select();
    }
    STATE.showModal = true;
    // pause jogo input? aqui não pausa motor, mas evita mover ao focar
  }

  function hideModal() {
    puzzleAtivo = false;
    const modal = document.getElementById("cemetery-puzzle-modal");
    if (modal) modal.style.visibility = "hidden";
    STATE.showModal = false;
  }

  // checa proximidade do player com a área do puzzle
  function playerInArea(player, map) {
    // player.x / y are world coords; puzzle rect is world coords
    const rect = STATE.rect;
    // area check: basic AABB with small margin OR center distance
    const px = player.x + (player.largura || 0) / 2;
    const py = player.y + (player.altura || 0) / 2;
    const insideX = px >= rect.x && px <= rect.x + rect.w;
    const insideY = py >= rect.y && py <= rect.y + rect.h;
    if (insideX && insideY) return true;

    // fallback: distance threshold center to center
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const dx = px - cx;
    const dy = py - cy;
    return Math.sqrt(dx*dx + dy*dy) <= PROX_DIST;
  }

  // desenha o quadrado vermelho de orientação e a dica "ESPAÇO para interagir"
  function draw(ctx, map, player) {
    if (!STATE.active) return;
    const rect = STATE.rect;

    // transforma coords do mapa -> screen (camera + zoom)
    const x = (rect.x - map.cameraX) * map.zoom;
    const y = (rect.y - map.cameraY) * map.zoom;
    const w = rect.w * map.zoom;
    const h = rect.h * map.zoom;

    ctx.save();

    // se o player está na área e puzzle não concluído, mostrar dica
    if (!STATE.completed && playerInArea(player, map)) {
      const text = "ESPAÇO para interagir";
      ctx.font = `${20 * (map.zoom || 1)}px monospace`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      // desenha texto acima do retângulo (ou na posição segura)
      const tx = x + w/2 - ctx.measureText(text).width/2;
      const ty = y - 8 * (map.zoom || 1);
      // background
      const pad = 6 * (map.zoom || 1);
      const tw = ctx.measureText(text).width;
      ctx.font = `${24 * (map.zoom || 1)}px monospace`;
        ctx.font = `${36 * (map.zoom || 1)}px monospace`; // aumentei o tamanho
        ctx.fillStyle = "#ffffffff"; 
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fillText("ESPAÇO para interagir", x + w / 2, y - 20 * (map.zoom || 1));
        ctx.shadowBlur = 0; // limpa sombra após desenhar
    }

    ctx.restore();
  }

  // toggle/init
  function init(opts) {
    opts = opts || {};
    STATE.rect.x = typeof opts.x === "number" ? opts.x : STATE.rect.x;
    STATE.rect.y = typeof opts.y === "number" ? opts.y : STATE.rect.y;
    STATE.rect.w = typeof opts.w === "number" ? opts.w : STATE.rect.w;
    STATE.rect.h = typeof opts.h === "number" ? opts.h : STATE.rect.h;
    STATE.active = true;
    STATE.completed = !!opts.completed;
    createModal();
  }

  // handle space press: se player dentro e não concluído -> abrir modal
  function handleSpaceIfNear(player, map) {
    if (!STATE.active || STATE.completed) return false;
    if (STATE.showModal) return true; // já aberto
    if (playerInArea(player, map)) {
      showModal();
      return true;
    }
    return false;
  }

  // ja-inicializa listener para tecla Space — não interfere com seu sistema existente.
  // Ele só abre modal se estiver na área.
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      // tentar abrir modal se próximo e não houve foco em input (para evitar capturar ENTER)
      // Se já estiver aberto, não faz nada
      try {
        if (!STATE.active || STATE.completed) return;
        // tenta obter global player/map (se existirem)
        const player = window.player || window.playerInstance || window._player;
        const map = window.mapa || window.map || window._map;
        if (player && map) {
          if (playerInArea(player, map)) {
            e.preventDefault();
            showModal();
          }
        }
      } catch (err) { /* ignore */ }
    }
  });

  // API pública
  return {
    init,
    draw,
    showModal,
    hideModal,
    isCompleted: () => STATE.completed,
    setRect: (r) => { STATE.rect = Object.assign(STATE.rect, r); },
    // utilidade para main: retorna true se jogador está perto
    playerInArea
  };
})();
