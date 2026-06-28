function inicializarTeclado(callbacks) {
  const teclas = {
    cima: false,
    baixo: false,
    esquerda: false,
    direita: false
  };

  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "KeyW":
        teclas.cima = true;
        break;
      case "KeyS":
        teclas.baixo = true;
        break;
      case "KeyA":
        teclas.esquerda = true;
        break;
      case "KeyD":
        teclas.direita = true;
        break;
      case "Space":
        callbacks.onEspaco && callbacks.onEspaco();
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "KeyW":
        teclas.cima = false;
        break;
      case "KeyS":
        teclas.baixo = false;
        break;
      case "KeyA":
        teclas.esquerda = false;
        break;
      case "KeyD":
        teclas.direita = false;
        break;
    }
  });

  // envia o objeto de teclas continuamente
  function atualizarTeclas() {
    callbacks.onMover && callbacks.onMover(teclas);
    requestAnimationFrame(atualizarTeclas);
  }

  atualizarTeclas(); // inicia o loop
}
