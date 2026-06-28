// ruinsPuzzle.js (corrigido)
const RuinsPuzzle = (function () {
  const state = {
    x: 0,
    y: 0,
    w: 200,
    h: 200,
    orientationVisible: true,
    completed: false, // true quando o puzzle for resolvido
    modalOpen: false,
    domElements: null
  };

  const pedestalImgs = [
    "assets/pedestal/eco.png",
    "assets/pedestal/terra.png",
    "assets/pedestal/vento.png",
    "assets/pedestal/vida.png"
  ];

  const expectedItems = ["calice", "pedra", "pena", "flor"];

  function normalizeText(str) {
    if (!str) return "";
    return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
  }

  function getGlobalInventario() {
    if (typeof window !== "undefined") {
      if (window.inventario && Array.isArray(window.inventario.itens)) return window.inventario;
    }
    try {
      if (typeof inventario !== "undefined" && inventario && Array.isArray(inventario.itens)) return inventario;
    } catch (e) {}
    return null;
  }

  function hasRequiredItems() {
    const invent = getGlobalInventario();
    if (!invent || !Array.isArray(invent.itens)) return false;
    const need = ["pedra", "flor", "calice", "pena"];
    const invNormalized = invent.itens.map(i => normalizeText(i));
    return need.every(n => invNormalized.includes(normalizeText(n)));
  }

  function createModal() {
    if (state.domElements) return state.domElements;

    const overlay = document.createElement("div");
    overlay.id = "ruinsPuzzleOverlay";
    Object.assign(overlay.style, { position: "fixed", left: 0, top: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999, visibility: "hidden" });

    const box = document.createElement("div");
    Object.assign(box.style, { width: "760px", maxWidth: "95%", background: "#111", border: "2px solid #ccc", padding: "18px", borderRadius: "8px", color: "white", fontFamily: "monospace", textAlign: "center" });

    const title = document.createElement("h2");
    title.innerText = "Coloque os itens coletados em seus devidos lugares.";
    title.style.margin = "0 0 10px 0";
    title.style.fontSize = "18px";

    const pedestaisWrap = document.createElement("div");
    Object.assign(pedestaisWrap.style, { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "12px", alignItems: "flex-start" });

    const inputFields = [];

    for (let i = 0; i < 4; i++) {
      const col = document.createElement("div");
      Object.assign(col.style, { display: "flex", flexDirection: "column", alignItems: "center", width: "22%" });

      const img = document.createElement("img");
      img.src = pedestalImgs[i];
      img.alt = `pedestal-${i}`;
      Object.assign(img.style, { width: "100%", maxWidth: "140px", height: "120px", objectFit: "contain", marginBottom: "8px" });

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "escreva o item";
      Object.assign(input.style, { width: "100%", padding: "8px", fontSize: "14px", borderRadius: "4px", border: "1px solid #333", textAlign: "center", background: "#222", color: "white" });

      col.appendChild(img);
      col.appendChild(input);
      pedestaisWrap.appendChild(col);
      inputFields.push(input);
    }

    const mensagem = document.createElement("div");
    mensagem.id = "ruinsPuzzleMensagem";
    mensagem.style.minHeight = "22px";
    mensagem.style.marginBottom = "12px";
    mensagem.style.fontSize = "14px";

    const buttonsRow = document.createElement("div");
    Object.assign(buttonsRow.style, { display: "flex", justifyContent: "center", gap: "12px", marginTop: "6px" });

    const verificarBtn = document.createElement("button");
    verificarBtn.innerText = "Verificar";
    Object.assign(verificarBtn.style, { padding: "8px 16px", fontSize: "14px", cursor: "pointer", borderRadius: "6px", border: "none", background: "#2d88ff", color: "white" });

    const fecharBtn = document.createElement("button");
    fecharBtn.innerText = "Fechar";
    Object.assign(fecharBtn.style, { padding: "8px 16px", fontSize: "14px", cursor: "pointer", borderRadius: "6px", border: "none", background: "#444", color: "white" });

    verificarBtn.addEventListener("click", () => {
      if (!hasRequiredItems()) {
        setMessage("Você ainda não possui todos os itens.", "orange");
        return;
      }

      const answers = inputFields.map(i => normalizeText(i.value));
      if (answers.some(a => a === "")) {
        setMessage("Preencha todos os campos.", "orange");
        return;
      }

      const correctAll = answers.every((a, idx) => a === expectedItems[idx]);
      if (correctAll) {
        setMessage("O ritual foi iniciado.", "green");
        state.completed = true; // aqui é a alteração importante
        setTimeout(hideModal, 2000);
      } else {
        setMessage("Errado!", "red");
      }
    });

    fecharBtn.addEventListener("click", hideModal);

    buttonsRow.appendChild(verificarBtn);
    buttonsRow.appendChild(fecharBtn);

    box.appendChild(title);
    box.appendChild(pedestaisWrap);
    box.appendChild(mensagem);
    box.appendChild(buttonsRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function setMessage(text, color) {
      mensagem.innerText = text;
      mensagem.style.color = color;
    }

    function enableInputs(enabled) {
      inputFields.forEach(i => { i.disabled = !enabled; i.style.opacity = enabled ? "1" : "0.6"; i.style.pointerEvents = enabled ? "auto" : "none"; });
      verificarBtn.disabled = !enabled;
      verificarBtn.style.opacity = enabled ? "1" : "0.6";
      verificarBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    state.domElements = { overlay, inputFields, setMessage, enableInputs, verificarBtn, fecharBtn };
    return state.domElements;
  }

  function showModal() {
    if (state.completed) return;
    const dom = createModal();
    dom.overlay.style.visibility = "visible";
    state.modalOpen = true;

    if (hasRequiredItems()) {
      dom.enableInputs(true);
      dom.setMessage("", "white");
    } else {
      dom.enableInputs(false);
      dom.setMessage("Pegue todos os itens espalhados pelo mapa", "orange");
    }
  }

  function hideModal() {
    if (!state.domElements) return;
    state.domElements.overlay.style.visibility = "hidden";
    state.modalOpen = false;
  }

  return {
    init(opts = {}) {
      state.x = opts.x || state.x;
      state.y = opts.y || state.y;
      state.w = opts.w || state.w;
      state.h = opts.h || state.h;
      state.orientationVisible = typeof opts.orientationVisible === "boolean" ? opts.orientationVisible : state.orientationVisible;
      state.completed = false;
      state.modalOpen = false;
      pedestalImgs.forEach(src => { const img = new Image(); img.src = src; });
    },

    draw(ctx, map, player) {
      if (state.orientationVisible && !state.completed) {
        const screenX = (state.x - map.cameraX) * map.zoom;
        const screenY = (state.y - map.cameraY) * map.zoom;
        const screenW = state.w * map.zoom;
        const screenH = state.h * map.zoom;

        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, screenW, screenH);
        ctx.fillStyle = "rgba(255,0,0,0.06)";
        ctx.fillRect(screenX, screenY, screenW, screenH);
        ctx.restore();
      }

      if (!state.completed && !state.modalOpen && this.playerInArea(player, map)) {
        const screenX = (state.x - map.cameraX) * map.zoom;
        const screenY = (state.y - map.cameraY) * map.zoom;
        const screenW = state.w * map.zoom;

        ctx.font = `${Math.max(12, 36 * map.zoom)}px monospace`;
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("ESPAÇO para interagir", screenX + screenW / 2, screenY - 6);
      }
    },

    playerInArea(player, map) {
      const px = player.x + player.largura / 2;
      const py = player.y + player.altura / 2;
      return px >= state.x && px <= state.x + state.w && py >= state.y && py <= state.y + state.h;
    },

    showModal,
    hideModal,

    isCompleted() {
      return state.completed; // agora disponível externamente
    },

    isModalOpen() {
      return state.modalOpen;
    },


    setOrientationVisible(v) {
      state.orientationVisible = !!v;
    }
  };
})();
