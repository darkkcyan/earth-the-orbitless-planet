import {addListener, Events} from "./EventListener";
import Gun from "./Gun";
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
} from "./PlayerGunFormation";
import {
  PlayerRocket as Rocket,
  PlayerRocketGroup as RocketGroup,
} from "./PlayerRocket";
import {Circle} from "./shapes";
import {ICollidable} from "./SpatialHashMap";

export default class Player implements ICollidable {
  public followMouse = true;
  public collisionShape: Circle = new Circle(0, 0, 0);

  [index: number]: (any) => boolean | void;

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
    this.collisionShape.radius = planet.radius;
    for (let i = 0; i < 3; ++i) {
      rl.push(new Rocket(
        this.planet.radius / 2.5,
        this.planet.radius / 1.5,
        new HarmonicMotioin(10, 1, PI2 * Math.random()),
      ));
    }
    this.rocketGroup = new RocketGroup(rl, new HarmonicMotioin(this.planet.radius / 4, 2));
    this.gunFormation = new GunFormation({
      hm: new HarmonicMotioin(HALF_PI / 2.5, 3),
      mainGun: new Gun(images[3]),
      planetRadius: this.planet.radius * 1.1,
      sideGunList: [new Gun(images[1], true), new Gun(images[2], false)],
      sideGunPhaseOffset: Math.PI / 5,
    });
    addListener(this, [Events.process, Events.render]);
  }

  public [Events.process](dt: number) {
    if (this.followMouse) {
      [this.x, this.y] = getMousePos();
    }
    this.planet[Events.process](dt);
    this.rocketGroup[Events.process](dt);
    this.gunFormation[Events.process](dt);
  }

  public [Events.render](ctx: CanvasRenderingContext2D) {
    this.planet[Events.render](ctx);
    this.rocketGroup[Events.render](ctx);
    this.gunFormation[Events.render](ctx);
  }
}
