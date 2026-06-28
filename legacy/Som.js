
(function () {
  function Som(caminho) {
    this.audio = new Audio(caminho);
    this.audio.loop = true;
    this.audio.volume = 0.4;
  }

  Som.prototype.tocar = function () {
    this.audio.play().catch(function () {
      console.warn("Esperando interação do usuário para tocar o som...");
    });
  };

  Som.prototype.pausar = function () {
    this.audio.pause();
  };

  Som.prototype.parar = function () {
    this.audio.pause();
    this.audio.currentTime = 0;
  };

  // expõe globalmente
  window.Som = Som;
})();
