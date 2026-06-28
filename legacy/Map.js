class Map {
  constructor(src, canvas, ctx) {
    this.imagem = new Image();
    this.imagem.src = src;
    this.canvas = canvas;
    this.ctx = ctx;
    this.zoom = 0.5;
    this.cameraX = 0;
    this.cameraY = 0;
    this.loaded = false;
    this.onReady = null;

    this.imagem.onload = () => {
      this.loaded = true;
      if (typeof this.onReady === "function") this.onReady();
    };
  }

  atualizarCamera(player) {
    const camWidth = this.canvas.width / this.zoom;
    const camHeight = this.canvas.height / this.zoom;

    let camX = player.x + player.largura / 2 - camWidth / 2;
    let camY = player.y + player.altura / 2 - camHeight / 2;

    camX = Math.max(0, Math.min(camX, this.imagem.width - camWidth));
    camY = Math.max(0, Math.min(camY, this.imagem.height - camHeight));

    this.cameraX = camX;
    this.cameraY = camY;
  }

  desenhar(player) {
    if (!this.loaded) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.imagem,
      this.cameraX,
      this.cameraY,
      this.canvas.width / this.zoom,
      this.canvas.height / this.zoom,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (player) player.desenhar(this.ctx, this);
  }
}
