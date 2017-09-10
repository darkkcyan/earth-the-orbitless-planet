import {scrheight, scrwidth} from "./canvas";
import {easeInOutQuad} from "./ease";
import Enemy, {IEnemyConfig} from "./Enemy";
import {addListener, emit, Events} from "./EventListener";
import {dt, player} from "./game";
import {images} from "./imageLoader";
import {PI2, randRange, SimpleHarmonicMotion as HarmonicMotion} from "./math";

export interface IFormationSubProcessor {
  process(f: Formation);
}

export default class Formation {
  [index: number]: (any?) => boolean | void;
  public enemyList: Enemy[];

  // initialy it will start at the left side of the screen with random y
  public x: number = scrwidth + 500;
  public y: number = scrheight * Math.random();

  private numEnemy: number;

  constructor(
    enemyConfigList: IEnemyConfig[],
    public selfPositionProcessor: IFormationSubProcessor,
    public enemyPositionProcess: IFormationSubProcessor,
    public cost = 100,
  ) {
    this.enemyList = enemyConfigList.map((x) => new Enemy().init(x));
    this.numEnemy = enemyConfigList.length;
    addListener(this, [Events.process]);
  }

  public [Events.process]() {
    for (let i = this.enemyList.length; i--; ) {
      const u = this.enemyList[i];
      if (!u) {
        continue;
      }
      if (u.isdead()) {
        --this.numEnemy;
        this.enemyList[i] = null;
      }
    }
    this.selfPositionProcessor.process(this);
    this.enemyPositionProcess.process(this);
    if (!this.numEnemy) {
      emit(Events.enemyFormationDead, this);
    }
    return this.numEnemy === 0;
  }

  // return position corresponding to the formation position
  // but will make an object with size width and height fit the screen
  public getFitPossition(width: number, height: number) {
    return [
      (this.x / scrwidth) * (scrwidth - width) + width / 2,
      (this.y / scrheight) * (scrheight - height) + height / 2,
    ];
  }

  public isDead() {
    return this.numEnemy === 0;
  }

  public forceDead() {
    for (const u of this.enemyList) {
      if (u && u.x < -2 * images[u.config.imageId].width) {
        u.live = 0;
      }
    }
  }
}

// Every class name with postfix "SPP" is used as selfPositionProcessor in Formation.
// Every class name with postfix "EPP" is used as enemyPOsitionProcessor in Formation.

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
    f.forceDead();
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
    public tpp = .05, // toward player probability
  ) {
    this.currentTime = 2 * this.moveTime;
  }

  public process(f: Formation) {
    this.currentTime += dt;
    if (this.currentTime >= this.moveTime) {
      this.currentX = f.x;
      this.currentY = f.y;
      this.dty = scrheight * Math.random();
      if (Math.random() <= this.tpp && this.currentTime < 2 * this.moveTime) {
        this.dtx = player.x;
      } else {
        this.dtx = scrwidth * (Math.random() / 2 + .5);
      }
      this.dtx -= f.x;
      this.dty -= f.y;
      this.currentTime = 0;
    }
    f.x = easeInOutQuad(this.currentTime, this.currentX, this.dtx, this.moveTime);
    f.y = easeInOutQuad(this.currentTime, this.currentY, this.dty, this.moveTime);
  }
}

// export class TowardPlayerSPP implements IFormationSubProcessor {
//   constructor(public px: number = 300, public pyRatio = 1.2) {}
//   public process(f: Formation) {
//     f.x -= this.px * dt;
//     const d = player.y - f.y;
//     const s = d < 0 ? -1 : +(d > 0);
//     if (d * s > 200) {
//       f.y += d * dt * this.pyRatio;
//     } else if (d * s > 40) {
//       f.y += 200 * s * dt * this.pyRatio;
//     }
//     f.forceDead();
//   }
// }

export class PolygonEPP implements IFormationSubProcessor {
  private hm: HarmonicMotion;
  constructor(public radius = 100, public period = 3) {
    this.hm = new HarmonicMotion(radius, period);
  }
  public process(f: Formation) {
    this.hm.process(dt);
    const [x, y] = f.getFitPossition(2 * this.radius, 2 * this.radius);
    if (f.enemyList[0]) {
      f.enemyList[0].x = x;
      f.enemyList[0].y = y;
    }
    const timeoffset = this.hm.period / (f.enemyList.length - 1);
    for (let i = 1, t = 0; i < f.enemyList.length; ++i, t += timeoffset) {
      const u = f.enemyList[i];
      if (!u) {
        continue;
      }
      u.x = x + this.hm.getX(t);
      u.y = y + this.hm.getY(t);
    }
  }
}

export class StraightLineEPP implements IFormationSubProcessor {
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
    for (const u of f.enemyList) {
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

export class WallEPP implements IFormationSubProcessor {
  constructor(public enemyPerLine = 1, public offset = 100) {}
  public process(f: Formation) {
    const numberOfLine = Math.floor(f.enemyList.length / this.enemyPerLine);
    const w = (numberOfLine - 1) * this.offset;
    const h = (this.enemyPerLine - 1) * this.offset;
    let [x, y] = f.getFitPossition(w, h);
    x -= w / 2;
    y -= h / 2;
    for (let i = numberOfLine; i--; ) {
      for (let j = this.enemyPerLine; j--; ) {
        const u = f.enemyList[i * this.enemyPerLine + j];
        if (u) {
          u.x = x + i * this.offset;
          u.y = y + j * this.offset;
        }
      }
    }
  }
}

export class PyramidEPP implements IFormationSubProcessor {
  constructor(public offset = 100) {}
  public process(f: Formation) {
    let maxLine = 0;
    while ((maxLine + 1) * maxLine / 2 < f.enemyList.length) {
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
        const u = f.enemyList[i * (i + 1) / 2 + j];
        if (u) {
          u.x = x + rs;
          u.y = y - rs / 2 + j * this.offset;
        }
      }
    }
  }
}
