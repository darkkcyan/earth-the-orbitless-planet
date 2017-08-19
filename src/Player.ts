import {getMousePos} from "./mouse";
import Planet from "./Planet";

export default class Player {
  public followMouse = true;
  private _x: number = 0;
  private _y: number = 0;

  set x(val: number) { this.planet.x = this._x = val; }
  get x() { return this._x; }

  set y(val: number) { this.planet.y = this._y = val; }
  get y() { return this._y; }

  constructor(private planet: Planet) {
  }

  public process(dt: number) {
    if (this.followMouse) {
      [this.x, this.y] = getMousePos();
    }
    this.planet.process(dt);
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.planet.render(ctx);
  }
}
