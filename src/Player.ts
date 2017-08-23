import {
  HALF_PI,
  PI2,
  SimpleHarmonicMotion as HarmonicMotioin,
} from "./math";
import {getMousePos} from "./mouse";
import Planet from "./Planet";
import {
  PlayerRocket as Rocket,
  PlayerRocketGroup as RocketGroup,
} from "./PlayerRocket";

export default class Player {
  public followMouse = true;
  public rocketGroup: RocketGroup;

  private _x: number = 0;
  private _y: number = 0;

  set x(val: number) {
    this.planet.x = this._x = val;
    this.rocketGroup.x = val - this.planet.radius - 10;
  }
  get x() { return this._x; }

  set y(val: number) { this.rocketGroup.y = this.planet.y = this._y = val; }
  get y() { return this._y; }

  constructor(private planet: Planet) {
    const rl = [];
    for (let i = 0; i < 3; ++i) {
      rl.push(new Rocket(
        this.planet.radius / 2.5,
        this.planet.radius / 1.5,
        new HarmonicMotioin(10, 10, PI2 * Math.random()),
      ));
    }
    this.rocketGroup = new RocketGroup(rl, new HarmonicMotioin(this.planet.radius / 4, 5));
  }

  public process(dt: number) {
    if (this.followMouse) {
      [this.x, this.y] = getMousePos();
    }
    this.planet.process(dt);
    this.rocketGroup.process(dt);
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.planet.render(ctx);
    this.rocketGroup.render(ctx);
  }
}
