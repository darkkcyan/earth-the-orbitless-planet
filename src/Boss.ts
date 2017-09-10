import Bullet from "./Bullet";
import ctx, {scrheight, scrwidth} from "./canvas";
import {easeInCubic, easeInOutQuad} from "./ease";
import Enemy, {IEnemyConfig} from "./Enemy";
import EnemyFormation from "./EnemyFormation";
import {addListener, emit, Events} from "./EventListener";
import {dt, player} from "./game";
import {images} from "./imageLoader";
import {randNeg, randRange} from "./math";
import Particle from "./Particle";

export interface IBossSkill {
  i(boss: Boss);            // init
  p(boss: Boss): boolean;   // process
}

export default class Boss extends Enemy {
  public static activeBosses: Boss[] = [];

  private csk: IBossSkill = null;  // current skill
  private rsk: MoveToPosition;     // relax skill, boss need relax too
  constructor(config: IEnemyConfig, private skills: IBossSkill[], relaxTime = 2) {
    super();
    this.x = scrwidth + images[config.imageId].width;
    this.y = scrheight / 2;
    this.init(config);
    this.csk = this.rsk = new MoveToPosition(relaxTime);
    this.csk.i(this);
    Boss.activeBosses.push(this);
  }

  public [Events.process]() {
    if (this.csk.p(this)) {
      if (this.csk !== this.rsk) {
        this.csk = this.rsk;  // boss need to relax
                                                   // and during the relax time it move to random position
      } else {
        this.csk = this.skills[Math.floor(Math.random() * this.skills.length)];
      }
      this.csk.i(this);
    }
    const ret = super[Events.process]();
    if (this.isdead()) {
      if (Boss.activeBosses.every((b) => b.isdead())) {
        emit(Events.bossDefeated, this);
      }
    }
    return ret;
  }

  public fire(angle: number = Math.PI, offsetX = 0, offsetY = 0) {
    let numBullet = 5;
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

  public createParticle() {
    Particle.createPartical(50, this.x, this.y, 20, "#FF4500", 70);
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

  public i(b: Boss, x = scrwidth * (Math.random() / 2 + .5), y = scrheight * Math.random()) {
    this.prevX = b.x;
    this.prevY = b.y;
    this.dx = x - b.x;
    this.dy = y - b.y;
    this.currentTime = 0;
  }

  public p(b: Boss) {
    if (this.currentTime >= this.moveTime) {
      return true;
    }
    this.currentTime += dt;
    b.x = easeInOutQuad(this.currentTime, this.prevX, this.dx, this.moveTime);
    b.y = easeInOutQuad(this.currentTime, this.prevY, this.dy, this.moveTime);
    return this.currentTime >= this.moveTime;
  }
}

export class AimPlayerBullerDrop implements IBossSkill {
  public currentTime: number;
  public dx: number;
  public prevX: number;
  constructor(public moveTime = 4, public speedRatio = 2.5) {}

  public i(b: Boss) {
    this.currentTime = 0;
    this.dx = scrwidth * (Math.random() / 2 + .5) - b.x;
    this.prevX = b.x;
  }

  public p(b: Boss) {
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

export class AimPlayerMultipleBullet implements IBossSkill {
  public mover: MoveToPosition;
  public currentTime: number;
  constructor(moveTime = 1.5, public shootTime = 4) {
    this.mover = new MoveToPosition(moveTime);
  }

  public i(b: Boss) {
    // super.init(b, scrwidth / 2, scrheight / 2);
    this.mover.i(b);
    this.currentTime = 0;
  }

  public p(b: Boss) {
    if (this.mover.p(b)) {
      this.currentTime += dt;
      b.fire(Math.atan2(player.y - b.y, player.x - b.x));
    }
    return this.currentTime > this.shootTime;
  }
}

export class RandomBulletSpread implements IBossSkill {
  public mover: MoveToPosition;
  public currentTime: number;
  constructor(
    public numberOfRay = 3,
    moveTime = 1.5,
    public shootTime = 3,
    public spreadAngle = Math.PI / 2,
  ) {
    this.mover = new MoveToPosition(moveTime);
  }

  public i(b: Boss) {
    this.mover.i(b, randRange([scrwidth * 2 / 3, scrwidth]));
    this.currentTime = 0;
  }

  public p(b: Boss) {
    if (this.mover.p(b)) {
      this.currentTime += dt;
      for (let i = this.numberOfRay; i--; ) {
        b.fire(Math.PI - (this.numberOfRay > 1
          ? this.spreadAngle * (i / (this.numberOfRay - 1) - .5)
          : 0
        ));
      }
    }
    return this.currentTime > this.shootTime;
  }
}

export class SumonFormation implements IBossSkill {
  public mover: MoveToPosition;
  public f: EnemyFormation[];
  public currentTime: number;
  constructor(
    public formationFactory: () => EnemyFormation[],
    public waitTime: number = Infinity,  // wait until the formation is dead
    moveTime?: number,
  ) {
    this.mover = new MoveToPosition(moveTime);
  }

  public i(b: Boss)  {
    this.mover.i(b, scrwidth - images[b.config.imageId].width / 2, scrheight / 2);
    this.f = [];
    this.currentTime = 0;
  }

  public p(b: Boss) {
    let allDead = false;
    if (this.mover.p(b)) {
      if (this.currentTime === 0) {
        this.f = this.formationFactory();
      }
      this.currentTime += dt;
      allDead = true;
      for (const u of this.f) {
        if (!u.isDead()) {
          allDead = false;
        }
      }
    }
    return allDead || this.currentTime > this.waitTime;
  }
}
