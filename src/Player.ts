import {HALF_PI, PI2} from "./math";
import {getMousePos} from "./mouse";
import Planet from "./Planet";

export class Rocket {
  public x: number = 0;
  public y: number = 0;
  public movingDuration = 10;

  private movingTime = 0;

  constructor(public rocketSize: number, public movingRange: number) {
  }

  public process(dt: number) {
    this.movingTime += dt;
    if (this.movingTime > this.movingDuration) {
      this.movingTime -= this.movingDuration;
    }
  }

  public renderRocketPart(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    const x = this.x - this.movingRange * Math.cos(PI2 * this.movingTime / this.movingDuration);
    const y = this.y;
    const rs = this.rocketSize;
    ctx.fillRect(x - rs, y - rs / 2, rs / 4, rs);
    ctx.fillStyle = "black";
    ctx.fillRect(x - rs * 3 / 4, y - rs / 2, rs / 4, rs);
    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.arc(x - rs / 2, y, rs / 2, -HALF_PI, HALF_PI);
    ctx.fill();
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.renderRocketPart(ctx);
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
    this.roc = new Rocket(this.planet.radius / 2.5, 10);
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
