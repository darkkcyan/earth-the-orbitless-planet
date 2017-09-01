import Bullet from "./Bullet";
import {scrheight, scrwidth} from "./canvas";
import {easeInCubic, easeInOutQuad} from "./ease";
import Enemy, {IEnemyConfig} from "./Enemy";
import {Events} from "./EventListener";
import {dt, player} from "./game";
import {randNeg, randRange} from "./math";

interface IBossSkill {
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

  public fire(angle: number = Math.PI, offsetX = randNeg(25), offsetY = randNeg(50)) {
    super.fire(angle, offsetX, offsetY);
  }

  protected free() {
    // YES, do nothing, cuz only one boss
  }

  protected processFire() {
    // Still do nothing, the skill will handle this
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
  public currentTime: number;
  constructor(moveTime = 2, public towardPlayerProbability = .5) {
    super(moveTime);
  }

  public init(b: Boss) {
    if (Math.random() < this.towardPlayerProbability) {
      super.init(b, undefined, player.y);
    } else {
      super.init(b);
      if (Math.abs(this.dy) < scrheight / 3) {
        this.dy = (b.y < scrheight / 2 ? scrheight : -scrheight) / 3;
      }
    }
  }

  public process(b: Boss) {
    const shootProbability = easeInCubic(this.currentTime, 0, 1, this.moveTime);
    if (Math.random() < shootProbability) {
      b.fire();
    }
    return super.process(b);
  }
}

export class AimPlayerBullerDrop implements IBossSkill {
  public currentTime: number;
  public dx: number;
  public prevX: number;
  constructor(public moveTime = 4, public speedRatio = 2.5, public bulletDropProbability = .15) {}

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
    if (Math.random() < this.bulletDropProbability && this.currentTime > .7) {
      b.fire();
    }
    return this.currentTime > this.moveTime;
  }
}

export class AimPlayerMultipleBullet extends MoveToPosition {
  public currentReloadTime: number;
  constructor(moveTime = 1.5, public shootTime = 4, public reloadTime = .1) {
    super(moveTime);
  }

  public init(b: Boss) {
    super.init(b, scrwidth / 2, scrheight / 2);
    this.currentReloadTime = 0;
  }

  public process(b: Boss) {
    if (this.currentTime < this.moveTime) {
      super.process(b);
    } else {
      this.currentTime += dt;
      this.currentReloadTime += dt;
      if (this.currentReloadTime > this.reloadTime) {
        this.currentReloadTime -= this.reloadTime;
        for (let i = 3; i--; ) {
          b.fire(Math.atan2(player.y - b.y, player.x - b.x));
        }
      }
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
      const rayNum = Math.floor(Math.random() * this.numberOfRay);
      b.fire(Math.PI - this.spreadAngle * (rayNum / (this.numberOfRay - 1) - .5));
    }
    return this.currentTime > this.moveTime + this.shootTime;
  }
}
