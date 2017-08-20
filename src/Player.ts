import {HALF_PI, PI2, SimpleHarmonicMotion as HarmonicMotioin} from "./math";
import {getMousePos} from "./mouse";
import Planet from "./Planet";

export class Rocket {
  public x: number = 0;
  public y: number = 0;

  private previousX: number = 0;
  private previousY: number = 0;
  private realFlameSize: number;

  constructor(public rocketSize: number, public flameSize: number, private hm: HarmonicMotioin) {
  }

  public process(dt: number) {
    this.hm.process(dt);
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
    const x = this.x - this.hm.getX();
    const y = this.y;
    const halfrs = this.rocketSize / 2;
    const magic = 0.9;
    for (const [tx, ty, color] of [
      [x - halfrs * 2, y - halfrs, "#79E9DD"],
      [x - halfrs * 1.5, y - halfrs, "#36C3DE"],
    ] as Array<[number, number, string]>) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty + halfrs * 2);
      ctx.lineTo(tx + halfrs / 2, ty + halfrs * 2 * magic);
      ctx.lineTo(tx + halfrs / 2, ty + halfrs * 2 * (1 - magic));
      ctx.fill();
    }
    ctx.fillStyle = "#2468B4";
    ctx.beginPath();
    ctx.arc(x - halfrs, y, halfrs, -HALF_PI, HALF_PI);
    ctx.fill();
  }

  public renderFlamePart(ctx: CanvasRenderingContext2D) {
    const halfrs = this.rocketSize / 2;
    const x = this.x - this.hm.getX() - halfrs * 2;
    const y = this.y;
    const magic = 0.618;  // the magic is golden ratio
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.globalAlpha *= 0.5;
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
}

interface IRocketWithZOrder extends Rocket {
  z: number;
}

export class RocketGroup {
  public x: number;
  public y: number;
  public rocketList: IRocketWithZOrder[] = [];

  constructor(rocketList: Rocket[], public hm: HarmonicMotioin) {
    for (const rocket of (rocketList as IRocketWithZOrder[])) {
      this.rocketList.push(rocket);
      rocket.z = 0;
    }
  }

  public process(dt: number) {
    this.hm.process(dt);
    const timeOffset = this.hm.period / this.rocketList.length;
    let t = 0;
    for (const roc of this.rocketList) {
      roc.x = this.x;
      roc.y = this.y + this.hm.getY(t);
      roc.z = this.hm.getX(t);
      t += timeOffset;
      roc.process(dt);
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const rl = this.rocketList.slice();
    rl.sort((a, b) => a.z - b.z);
    for (const roc of rl) {
      ctx.globalAlpha = Math.min(0.5 + 0.5 * (roc.z / this.hm.amplitute + 1) / 2, 1);
      roc.render(ctx);
    }
    ctx.globalAlpha = 1;
  }
}

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
