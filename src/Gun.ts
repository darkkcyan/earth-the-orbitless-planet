export default class PlayerGun {
  public x: number = 0;
  public y: number = 0;
  public angle: number = 0;

  constructor(private image: HTMLImageElement, public rotate: boolean = false) {
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = this.image.height / 10;
    ctx.shadowColor = "black";
    ctx.translate(this.x, this.y);
    if (this.rotate) {
      ctx.rotate(this.angle);
    }
    ctx.drawImage(this.image, 0, - this.image.height / 2);
    ctx.restore();
  }

  public clone(): PlayerGun {
    return new PlayerGun(this.image, this.rotate);
  }
}
