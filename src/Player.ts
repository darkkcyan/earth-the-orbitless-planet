import {HALF_PI, PI2} from "./math";
import {getMousePos} from "./mouse";
import Planet from "./Planet";

export class Rocket {
  public x: number = 0;
  public y: number = 0;
  public movingDuration = 10;

  private movingTime = 0;
  private previousX: number = 0;
  private previousY: number = 0;
  private realFlameSize: number;

  constructor(public rocketSize: number, public flameSize: number, public movingRange: number) {
  }

  public process(dt: number) {
    this.movingTime += dt;
    if (this.movingTime > this.movingDuration) {
      this.movingTime -= this.movingDuration;
    }
    const RANDOM_RANGE = this.flameSize / 7;
    this.realFlameSize = this.flameSize + (this.x - this.previousX) * 3;
    this.realFlameSize += RANDOM_RANGE * (Math.random() - 0.5);
    if (this.realFlameSize < this.flameSize / 10) {
      this.realFlameSize = this.flameSize / 10;
    }
    this.previousX = this.x;
    this.previousY = this.y;
  }

  public renderRocketPart(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    const x = this.x - this.getMovingOffset();
    const y = this.y;
    const halfrs = this.rocketSize / 2;
    ctx.fillRect(x - halfrs * 2, y - halfrs, halfrs / 2, halfrs * 2);
    ctx.fillStyle = "black";
    ctx.fillRect(x - halfrs * 1.5, y - halfrs, halfrs / 2, halfrs * 2);
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.arc(x - halfrs, y, halfrs, -HALF_PI, HALF_PI);
    ctx.fill();
  }

  public renderFlamePart(ctx: CanvasRenderingContext2D) {
    const halfrs = this.rocketSize / 2;
    const x = this.x - this.getMovingOffset() - halfrs * 2;
    const y = this.y;
    const magic = 0.618;  // the magic is golden ratio
    const magic2 = magic * magic;
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    const coordinates = [
      [0, -halfrs * magic],
      [-this.realFlameSize * magic, -halfrs],
      [-this.realFlameSize, 0],
      [-this.realFlameSize * magic, halfrs],
      [0, halfrs * magic],
    ];
    const color = ["red", "yellow"];
    for (let i = 0; i < 2; ++i) {
      ctx.beginPath();
      ctx.moveTo(x + coordinates[0][0], y + coordinates[0][1]);
      for (const offset of coordinates) {
        ctx.lineTo(x + offset[0], y + offset[1]);
        offset[0] *= magic;
        offset[1] *= magic;
      }
      ctx.shadowColor = ctx.fillStyle = color[i];
      ctx.fill();
    }
    ctx.restore();
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.renderRocketPart(ctx);
    this.renderFlamePart(ctx);
  }

  private getMovingOffset() {
    return this.movingRange * Math.cos(PI2 * this.movingTime / this.movingDuration);
  }

}

export default class Player {
  public followMouse = true;
  public roc: Rocket;

  private _x: number = 0;
  private _y: number = 0;

  set x(val: number) {
    this.planet.x = this._x = val;
    this.roc.x = val - this.planet.radius - 10;
  }
  get x() { return this._x; }

  set y(val: number) { this.roc.y = this.planet.y = this._y = val; }
  get y() { return this._y; }

  constructor(private planet: Planet) {
    this.roc = new Rocket(this.planet.radius / 2.5, this.planet.radius / 1.5, 10);
  }

  public process(dt: number) {
    if (this.followMouse) {
      [this.x, this.y] = getMousePos();
    }
    this.planet.process(dt);
    this.roc.process(dt);
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.planet.render(ctx);
    this.roc.render(ctx);
  }
}
