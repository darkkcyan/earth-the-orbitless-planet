import {scrheight, scrwidth} from "./canvas";
import EnemyUFO, {IEnemyUFOConfig} from "./EnemyUFO";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {PI2, randRange, SimpleHarmonicMotion as HarmonicMotion} from "./math";

export interface IUFOFormationConstructor {
  new (UFOList: Array<IEnemyUFOConfig | number>);
}

export const enum UFOFormation {
  zigzag,
  polygon,
  towardPlayer,
}

const formations: IUFOFormationConstructor[] = [];
export default formations;

class PolygonFormation {
  public static towardPlayerProbability = .05;
  public static moveTime = 1.5;
  public static radius = 100;

  [index: number]: (any?) => boolean | void;
  public mainUFO: EnemyUFO;

  private dtx = 0;
  private dty = 0;
  private nextX = 0;
  private nextY = 0;
  private currentTime = PolygonFormation.moveTime * 2;
  private hm = new HarmonicMotion(.5, 2 * PolygonFormation.moveTime);
  private sideUFO: EnemyUFO[] = [];
  private rotatehm = new HarmonicMotion(PolygonFormation.radius, 3);

  constructor(UFOConfigList: IEnemyUFOConfig[]) {
    this.mainUFO = EnemyUFO.Respawner.get().init(UFOConfigList.shift());
    this.mainUFO.x = scrwidth + 100;  // magic number :D
    this.mainUFO.y = scrheight / 2;
    for (const config of UFOConfigList) {
      this.sideUFO.push(EnemyUFO.Respawner.get().init(config));
    }
    addListener(this, [Events.process]);
  }

  public [Events.process]() {
    this.hm.process(dt);
    if (this.hm.getPhase() < Math.PI) {
      this.hm.t = this.hm.period / 2;
      if (Math.random() <= PolygonFormation.towardPlayerProbability) {
        this.nextX = player.x;
        this.nextY = player.y;
      } else {
        this.nextX = scrwidth * (Math.random() / 2 + .5);
        this.nextY = scrheight * Math.random();
      }
      this.dtx = this.nextX - this.mainUFO.x;
      this.dty = this.nextY - this.mainUFO.y;
    }
    this.mainUFO.x = this.nextX + (this.hm.getX() - .5) * this.dtx;
    this.mainUFO.y = this.nextY + (this.hm.getX() - .5) * this.dty;

    this.rotatehm.process(dt);
    const timeoffset = this.rotatehm.period / this.sideUFO.length;
    let t = 0;
    for (const UFO of this.sideUFO) {
      UFO.x = this.mainUFO.x + this.rotatehm.getX(t);
      UFO.y = this.mainUFO.y + this.rotatehm.getY(t);
      t += timeoffset;
    }
  }
}

formations[UFOFormation.polygon] = PolygonFormation;

class ZigzagFormation {
  [index: number]: (any?) => boolean | void;
  public static speed = 400;
  public static posOffset = 100;

  private angle: number;
  private UFOList: EnemyUFO[] = [];
  private velocityYSign: number[] = [];

  constructor(arg: Array<IEnemyUFOConfig | number>) {
    if (typeof arg[0] === "number") {
      this.angle = arg.shift() as number;
    } else {
      this.angle = randRange([Math.PI / 8, Math.PI / 6]) + Math.PI / 2;
    }
    const px = ZigzagFormation.posOffset * Math.cos(this.angle);
    const py = ZigzagFormation.posOffset * Math.sin(this.angle);
    const sign = Math.random() < .5 ? 1 : -1;
    let x = scrwidth + 100;
    let y = Math.random() * scrheight;
    for (const config of (arg as IEnemyUFOConfig[])) {
      const u = EnemyUFO.Respawner.get().init(config);
      u.x = x;
      u.y = y;
      this.UFOList.push(u);
      this.velocityYSign.push(sign);
      x -= px;
      y -= py * sign;
    }
    addListener(this, [Events.process]);
  }

  public [Events.process]() {
    const px = ZigzagFormation.speed * Math.cos(this.angle) * dt;
    const py = ZigzagFormation.speed * Math.sin(this.angle) * dt;
    for (let i = this.UFOList.length; i--; ) {
      const UFO = this.UFOList[i];
      UFO.x += px;
      UFO.y += py * this.velocityYSign[i];
      if (UFO.y > scrheight) {
        this.velocityYSign[i] = -1;
      }
      if (UFO.y < 0) {
        this.velocityYSign[i] = 1;
      }
    }
  }
}

formations[UFOFormation.zigzag] = ZigzagFormation;
