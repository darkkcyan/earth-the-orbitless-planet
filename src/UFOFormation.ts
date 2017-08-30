import {scrheight, scrwidth} from "./canvas";
import EnemyUFO, {IEnemyUFOConfig} from "./EnemyUFO";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {PI2, randRange, SimpleHarmonicMotion as HarmonicMotion} from "./math";

export interface IUFOFormationConstructor {
  new (UFOList: Array<IEnemyUFOConfig | number>);
}

interface IFormationSubProcessor {
  process(f: Formation);
}

export default class Formation {
  [index: number]: (any?) => boolean | void;
  public UFOList: EnemyUFO[];

  // initialy it will start at the left side of the screen with random y
  public x: number = scrwidth + 100;
  public y: number = scrheight * Math.random();

  constructor(
    UFOConfigList: IEnemyUFOConfig[],
    public selfPositionProcessor: IFormationSubProcessor,
    public UFOPositionProcess: IFormationSubProcessor,
  ) {
    this.UFOList = UFOConfigList.map((x) => EnemyUFO.Respawner.get().init(x));
    addListener(this, [Events.process]);
  }

  public [Events.process]() {
    this.selfPositionProcessor.process(this);
    this.UFOPositionProcess.process(this);
  }
}

export class StraightForwardSPP implements IFormationSubProcessor {
  constructor(
    public speed: number = 400,
    public angle: number = randRange([Math.PI / 8, Math.PI / 6]) + Math.PI / 2,
    public bound: boolean = true,
  ) {}
  public process(f: Formation) {
    f.x += this.speed * Math.cos(this.angle) * dt;
    f.y += this.speed * Math.sin(this.angle) * dt;
    if (f.y > scrheight) {
      if (this.bound) {
        this.angle = PI2 - this.angle;
      } else {
        f.y -= scrheight;
      }
    }
    if (f.y < 0) {
      if (this.bound) {
        this.angle = PI2 - this.angle;
      } else {
        f.y += scrheight;
      }
    }
  }
}

export class RandomPositionSPP implements IFormationSubProcessor {
  public hm: HarmonicMotion;
  public nextX: number;
  public nextY: number;
  public dtx: number;
  public dty: number;

  constructor(
    public moveTime = 1.5,
    public towardPlayerProbability = .05,
  ) {
    this.hm = new HarmonicMotion(.5, 2 * this.moveTime);
  }

  public process(f: Formation) {
    this.hm.process(dt);
    if (this.hm.getPhase() < Math.PI) {
      this.hm.t = this.hm.period / 2;
      if (Math.random() <= this.towardPlayerProbability) {
        this.nextX = player.x;
        this.nextY = player.y;
      } else {
        this.nextX = scrwidth * (Math.random() / 2 + .5);
        this.nextY = scrheight * Math.random();
      }
      this.dtx = this.nextX - f.x;
      this.dty = this.nextY - f.y;
    }
    f.x = this.nextX + (this.hm.getX() - .5) * this.dtx;
    f.y = this.nextY + (this.hm.getX() - .5) * this.dty;
  }
}

export class TowardPlayerSPP implements IFormationSubProcessor {
  constructor(public px: number = 300, public pyRatio = 1.2) {}
  public process(f: Formation) {
    f.x -= this.px * dt;
    const d = player.y - f.y;
    const s = d < 0 ? -1 : +(d > 0);
    if (d * s > 200) {
      f.y += d * dt * this.pyRatio;
    } else if (d * s > 40) {
      f.y += 200 * s * dt * this.pyRatio;
    }
  }
}

export class PolygonUPP implements IFormationSubProcessor {
  private hm: HarmonicMotion;
  constructor(public radius = 100, public period = 3) {
    this.hm = new HarmonicMotion(radius, period);
  }
  public process(f: Formation) {
    this.hm.process(dt);
    f.UFOList[0].x = f.x;
    f.UFOList[0].y = f.y;
    const timeoffset = this.hm.period / (f.UFOList.length - 1);
    for (let i = 1, t = 0; i < f.UFOList.length; ++i, t += timeoffset) {
      const u = f.UFOList[i];
      u.x = f.x + this.hm.getX(t);
      u.y = f.y + this.hm.getY(t);
    }
  }
}

export class StraightLineUPP implements IFormationSubProcessor {
  constructor(public offset = 100) {
  }
  public process(f: Formation) {
    let angle = Math.PI;
    let bound = true;
    if (f.selfPositionProcessor instanceof StraightForwardSPP) {
      angle = f.selfPositionProcessor.angle;
      bound = f.selfPositionProcessor.bound;
    }
    const px = -this.offset * Math.cos(angle);
    let py = -this.offset * Math.sin(angle);
    let x = f.x;
    let y = f.y;
    for (const u of f.UFOList) {
      u.x = x;
      u.y = y;
      x += px;
      y += py;
      if (y > scrheight) {
        if (bound) {
          py = -py;
          y = 2 * scrheight - y;
        } else {
          y -= scrheight;
        }
      }
      if (y < 0) {
        if (bound) {
          py = -py;
          y = -y;
        } else {
          y += scrheight;
        }
      }
    }
  }
}

export class WallUPP implements IFormationSubProcessor {
  constructor(public UFOPerLine = 5, public offset = 100) {}
  public process(f: Formation) {
    const numberOfLine = ~~(f.UFOList.length / this.UFOPerLine);
    const w = (numberOfLine - 1) * this.offset;
    const h = (this.UFOPerLine - 1) * this.offset;
    const x = f.x - w / 2;
    const y = scrheight / 2 + (f.y / scrheight - .5) * (scrheight - h) - h / 2;
    for (let i = numberOfLine; i--; ) {
      for (let j = this.UFOPerLine; j--; ) {
        const u = f.UFOList[i * this.UFOPerLine + j];
        u.x = x + i * this.offset;
        u.y = y + j * this.offset;
      }
    }
  }
}
