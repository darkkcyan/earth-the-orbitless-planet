import Bullet from "./Bullet";
import ctx, {scrheight, scrwidth} from "./canvas";
import {easeInCubic, easeInOutQuad} from "./ease";
import Enemy, {IEnemyConfig} from "./Enemy";
import EnemyFormation from "./EnemyFormation";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {randNeg, randRange} from "./math";

export interface IBossSkill {
  init(boss: Boss);
  process(boss: Boss): boolean;
}

export default class Boss extends Enemy {
  private currentSkill: IBossSkill = null;
  private relaxSkill: MoveToPosition;  // boss need to relax too :D
  constructor(config: IEnemyConfig, private skills: IBossSkill[], relaxTime = 2) {
    super();
    this.x = scrwidth + config.image.width;
    this.y = scrheight / 2;
    this.init(config);
    this.relaxSkill = new MoveToPosition(relaxTime);
  }

  public [Events.process]() {
    if (!this.currentSkill || this.currentSkill.process(this)) {
      if (this.currentSkill !== this.relaxSkill) {
        this.currentSkill = this.relaxSkill;  // boss need to relax
                                                   // and during the relax time it move to random position
      } else {
        this.currentSkill = this.skills[Math.floor(Math.random() * this.skills.length)];
      }
      this.currentSkill.init(this);
    }
    return super[Events.process]();
  }

  public fire(angle: number = Math.PI, offsetX = 0, offsetY = 0) {
    let numBullet = 5;
    if (!this.canFire) {
      return ;
    }
    const d = this.config.bulletConfig.radius * 3;
    const px = d * Math.sin(-angle);
    const py = d * Math.cos(-angle);
    offsetX -= px * (numBullet - 1) / 2;
    offsetY -= py * (numBullet - 1) / 2;
    while (numBullet --) {
      super.fire(angle, offsetX, offsetY);
      offsetX += px;
      offsetY += py;
    }
  }

  protected free() {
    // YES, do nothing, cuz only one boss
  }

  protected autoFire() {
    // No auto fire
  }

}

export class MoveToPosition implements IBossSkill {
  public currentTime: number;
  public dx: number;
  public dy: number;
  public prevX: number;
  public prevY: number;

  constructor(public moveTime = 2) {}

  public init(b: Boss, x = scrwidth * (Math.random() / 2 + .5), y = scrheight * Math.random()) {
    this.prevX = b.x;
    this.prevY = b.y;
    this.dx = x - b.x;
    this.dy = y - b.y;
    this.currentTime = 0;
  }

  public process(b: Boss) {
    this.currentTime += dt;
    b.x = easeInOutQuad(this.currentTime, this.prevX, this.dx, this.moveTime);
    b.y = easeInOutQuad(this.currentTime, this.prevY, this.dy, this.moveTime);
    return this.currentTime >= this.moveTime;
  }
}

export class RandomBulletDrop extends MoveToPosition {
  constructor(moveTime = .5, public shootTime = 2, public towardPlayerProbability = .5) {
    super(moveTime);
  }

  public init(b: Boss) {
    super.init(b);
    if (Math.random() < this.towardPlayerProbability) {
      this.dy = player.y - b.y;
    }
  }

  public process(b: Boss) {
    if (this.currentTime < this.moveTime) {
      console.log(this.currentTime, this.moveTime);
      super.process(b);
    } else {
      this.currentTime += dt;
      b.fire(Math.PI, 7);
    }
    return this.currentTime > this.moveTime + this.shootTime;
  }
}

export class AimPlayerBullerDrop implements IBossSkill {
  public currentTime: number;
  public dx: number;
  public prevX: number;
  constructor(public moveTime = 4, public speedRatio = 2.5) {}

  public init(b: Boss) {
    this.currentTime = 0;
    this.dx = scrwidth * (Math.random() / 2 + .5) - b.x;
    this.prevX = b.x;
  }

  public process(b: Boss) {
    this.currentTime += dt;
    b.x = easeInOutQuad(this.currentTime, this.prevX, this.dx, this.moveTime);
    const dy = (player.y - b.y) * this.speedRatio * dt;
    b.y += dy;
    if (this.currentTime > this.moveTime / 4) {
      b.fire();
    }
    return this.currentTime > this.moveTime;
  }
}

export class AimPlayerMultipleBullet extends MoveToPosition {
  constructor(moveTime = 1.5, public shootTime = 4) {
    super(moveTime);
  }

  public init(b: Boss) {
    // super.init(b, scrwidth / 2, scrheight / 2);
    super.init(b);
  }

  public process(b: Boss) {
    if (this.currentTime < this.moveTime) {
      super.process(b);
    } else {
      this.currentTime += dt;
      b.fire(Math.atan2(player.y - b.y, player.x - b.x));
    }
    return this.currentTime > this.moveTime + this.shootTime;
  }
}

export class RandomBulletSpread extends MoveToPosition {
  constructor(
    public numberOfRay = 3,
    moveTime = 1.5,
    public shootTime = 3,
    public spreadAngle = Math.PI / 2,
  ) {
    super(moveTime);
  }

  public init(b: Boss) {
    super.init(b, randRange([scrwidth * 2 / 3, scrwidth]));
  }

  public process(b: Boss) {
    if (this.currentTime < this.moveTime) {
      super.process(b);
    } else {
      this.currentTime += dt;
      for (let i = this.numberOfRay; i--; ) {
        b.fire(Math.PI - this.spreadAngle * (i / (this.numberOfRay - 1) - .5));
      }
    }
    return this.currentTime > this.moveTime + this.shootTime;
  }
}

export class SumonFormation extends MoveToPosition {
  public f: EnemyFormation[];
  constructor(
    public formationFactory: () => EnemyFormation[],
    public waitTime: number = Infinity,  // wait until the formation is dead
    moveTime?: number,
  ) {
    super(moveTime);
  }

  public init(b: Boss)  {
    super.init(b, scrwidth - b.config.image.width / 2, scrheight / 2);
    this.f = [];
  }

  public process(b: Boss) {
    let allDead = false;
    if (this.currentTime < this.moveTime) {
      super.process(b);
      if (this.currentTime >= this.moveTime) {
        this.f = this.formationFactory();
      }
    } else {
      this.currentTime += dt;
      allDead = true;
      for (const u of this.f) {
        if (!u.isDead()) {
          allDead = false;
        }
      }
    }
    return allDead || this.currentTime > this.moveTime + this.waitTime;
  }
}

export class LineGuideDrawer {
  [index: number]: (any?) => boolean | void;
  public offset: number = 0;
  public remove = false;
  constructor(public x: number, public y: number, public angle: number) {
    addListener(this, [Events.render + 1]);
  }

  public [Events.render + 1]() {
    const w = 10;
    ctx.save();
    ctx.setLineDash([w]);
    ctx.lineDashOffset = --this.offset;
    if (this.offset < -w * 2) {
      this.offset = 0;
    }
    ctx.lineWidth = w;
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    const len = scrwidth * Math.SQRT2;
    ctx.lineTo(this.x + len * Math.cos(this.angle), this.y + len * Math.sin(this.angle));
    ctx.stroke();
    ctx.restore();
    return this.remove;
  }
}
