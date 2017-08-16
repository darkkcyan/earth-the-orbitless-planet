import {HALF_PI, PI2} from "./math";

export interface IPlanetConfig {
  radius: number;
  surfaceMap: HTMLImageElement;
  spinSpeed: number;  // its actually the surfaceMap scroll speed
  tiltAngle: number;
  lightSourceAngle?: number;
}

export default class Planet {
  public x: number = 0;
  public y: number = 0;

  public radius: number;
  public surfaceMap: HTMLImageElement;
  public spinSpeed: number;
  public tiltAngle: number;
  public lightSourceAngle: number = 0;

  private mapWidth: number;
  private mapPosition: number = 0;

  constructor(config: IPlanetConfig, ctx: CanvasRenderingContext2D) {
    this.radius = config.radius;
    this.spinSpeed = config.spinSpeed;
    this.mapWidth = config.surfaceMap.width;
    this.surfaceMap = config.surfaceMap;
    this.tiltAngle = config.tiltAngle;
    if (config.lightSourceAngle) {
      this.lightSourceAngle = config.lightSourceAngle;
    }
  }

  public process(dt: number): void {
    this.mapPosition += dt * this.spinSpeed;
    if (this.mapPosition > this.mapWidth) {
      this.mapPosition -= this.mapWidth;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // draw surface map
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, PI2);
    ctx.clip();
    ctx.rotate(this.tiltAngle);
    const px = -this.radius + this.mapPosition;
    const py = -this.radius;
    const magic = 3;  // this number is added
                      // to the previous image's position
                      // inorder to hide a little line between 2 images.

    ctx.drawImage(this.surfaceMap, px, py);
    ctx.drawImage(this.surfaceMap, px - this.mapWidth + magic, py);
    ctx.restore();

    // draw shadow, instead of draw light
    ctx.rotate(this.lightSourceAngle);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, HALF_PI, - HALF_PI);
    ctx.arc(-this.radius, 0, this.radius * Math.SQRT2, -HALF_PI / 2, HALF_PI / 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";  // gray color with half alpha, make it feels like shadow
    ctx.fill();
    ctx.restore();
  }
}
