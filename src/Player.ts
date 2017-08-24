import {images} from "./imageLoader";
import {
  HALF_PI,
  PI2,
  SimpleHarmonicMotion as HarmonicMotioin,
} from "./math";
import {getMousePos} from "./mouse";
import Planet from "./Planet";
import {
  HarmonicMotionPlayerGunFormation as GunFormation ,
  PlayerGun as Gun,
} from "./PlayerGun";
import {
  PlayerRocket as Rocket,
  PlayerRocketGroup as RocketGroup,
} from "./PlayerRocket";

export default class Player {
  public followMouse = true;

  private rocketGroup: RocketGroup;
  private _x: number = 0;
  private _y: number = 0;
  private gunFormation: GunFormation;

  set x(val: number) {
    this.gunFormation.x = this.planet.x = this._x = val;
    this.rocketGroup.x = val - this.planet.radius - 10;
  }
  get x() { return this._x; }

  set y(val: number) { this.gunFormation.y = this.rocketGroup.y = this.planet.y = this._y = val; }
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
    this.gunFormation = new GunFormation({
      hm: new HarmonicMotioin(HALF_PI / 2.5, 10),
      mainGun: new Gun(images[3]),
      planetRadius: this.planet.radius * 1.1,
      sideGunList: [new Gun(images[1], true), new Gun(images[2], false)],
      sideGunPhaseOffset: Math.PI / 5,
    });
  }

  public process(dt: number) {
    if (this.followMouse) {
      [this.x, this.y] = getMousePos();
    }
    this.planet.process(dt);
    this.rocketGroup.process(dt);
    this.gunFormation.process(dt);
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.planet.render(ctx);
    this.rocketGroup.render(ctx);
    this.gunFormation.render(ctx);
  }
}
