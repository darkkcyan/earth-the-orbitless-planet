import {scrheight, scrwidth} from "./canvas";
import {easeInOutQuad} from "./ease";
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

  private numUFO: number;

  constructor(
    UFOConfigList: IEnemyUFOConfig[],
    public selfPositionProcessor: IFormationSubProcessor,
    public UFOPositionProcess: IFormationSubProcessor,
  ) {
    this.UFOList = UFOConfigList.map((x) => EnemyUFO.Respawner.get().init(x));
    this.numUFO = UFOConfigList.length;
    addListener(this, [Events.process]);
  }

  public [Events.process]() {
    for (let i = this.UFOList.length; i--; ) {
      const u = this.UFOList[i];
      if (!u) {
        continue;
      }
      if (u.isdead()) {
        --this.numUFO;
        this.UFOList[i] = null;
      }
    }
    this.selfPositionProcessor.process(this);
    this.UFOPositionProcess.process(this);
    return this.numUFO === 0;
  }

  // return position corresponding to the formation position
  // but will make an object with size width and height fit the screen
  public getFitPossition(width: number, height: number) {
    return [
      (this.x / scrwidth) * (scrwidth - width) + width / 2,
      (this.y / scrheight) * (scrheight - height) + height / 2,
    ];
  }
}

// Every class name with postfix "SPP" is used as selfPositionProcessor in Formation.
// Every class name with postfix "UPP" is used as UFOPOsitionProcessor in Formation.

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
        f.y = 2 * scrheight - f.y;
      } else {
        f.y -= scrheight;
      }
    }
    if (f.y < 0) {
      if (this.bound) {
        this.angle = PI2 - this.angle;
        f.y *= -1;
      } else {
        f.y += scrheight;
      }
    }
  }
}

export class RandomPositionSPP implements IFormationSubProcessor {
  public currentX: number;
  public currentY: number;
  public dtx: number;
  public dty: number;
  public currentTime: number;

  constructor(
    public moveTime = 1.5,
    public towardPlayerProbability = .05,
  ) {
    this.currentTime = this.moveTime;
  }

  public process(f: Formation) {
    this.currentTime += dt;
    if (this.currentTime >= this.moveTime) {
      this.currentTime = 0;
      this.currentX = f.x;
      this.currentY = f.y;
      if (Math.random() <= this.towardPlayerProbability) {
        this.dtx = player.x;
        this.dty = player.y;
      } else {
        this.dtx = scrwidth * (Math.random() / 2 + .5);
        this.dty = scrheight * Math.random();
      }
      this.dtx -= f.x;
      this.dty -= f.y;
    }
    f.x = easeInOutQuad(this.currentTime, this.currentX, this.dtx, this.moveTime);
    f.y = easeInOutQuad(this.currentTime, this.currentY, this.dty, this.moveTime);
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
    const [x, y] = f.getFitPossition(2 * this.radius, 2 * this.radius);
    if (f.UFOList[0]) {
      f.UFOList[0].x = x;
      f.UFOList[0].y = y;
    }
    const timeoffset = this.hm.period / (f.UFOList.length - 1);
    for (let i = 1, t = 0; i < f.UFOList.length; ++i, t += timeoffset) {
      const u = f.UFOList[i];
      if (!u) {
        continue;
      }
      u.x = x + this.hm.getX(t);
      u.y = y + this.hm.getY(t);
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
      if (u) {
        u.x = x;
        u.y = y;
      }
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
    let [x, y] = f.getFitPossition(w, h);
    x -= w / 2;
    y -= h / 2;
    for (let i = numberOfLine; i--; ) {
      for (let j = this.UFOPerLine; j--; ) {
        const u = f.UFOList[i * this.UFOPerLine + j];
        if (u) {
          u.x = x + i * this.offset;
          u.y = y + j * this.offset;
        }
      }
    }
  }
}

export class PyramidUPP implements IFormationSubProcessor {
  constructor(public offset = 100) {}
  public process(f: Formation) {
    let maxLine = 0;
    while ((maxLine + 1) * maxLine / 2 < f.UFOList.length) {
      ++maxLine;
    }
    const s = (maxLine - 1) * this.offset;
    // tslint:disable prefer-const
    let [x, y] = f.getFitPossition(s, s);
    // tslint:enable prefer-const
    x -= s / 2;
    for (let i = -1; ++i < maxLine; ) {
      const rs = i * this.offset;
      for (let j = -1; ++j <= i; ) {
        const u = f.UFOList[i * (i + 1) / 2 + j];
        if (u) {
          u.x = x + rs;
          u.y = y - rs / 2 + j * this.offset;
        }
      }
    }
  }
}
