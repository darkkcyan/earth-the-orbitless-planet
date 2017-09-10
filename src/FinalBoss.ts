import Boss, {IBossSkill, MoveToPosition} from "./Boss";
import ctx, {scrheight, scrwidth} from "./canvas";
import {easeInOutQuint} from "./ease";
import {IEnemyConfig} from "./Enemy";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {images, ImagesId} from "./imageLoader";
import Lazer from "./Lazer";
import {clamp, cross, PI2, randRange} from "./math";
import Planet from "./Planet";
import {Circle} from "./shapes";

export default class FinalBoss extends Boss {
  public planet: Planet;
  constructor(config: IEnemyConfig, skills: IBossSkill[], relaxTime = 1) {
    super(config, skills, relaxTime);
    this.planet = new Planet(images[config.imageId], Math.PI);
    this.collisionShape = new Circle(0, 0, this.planet.radius);
  }

  public [Events.process]() {
    const ret = super[Events.process]();
    this.planet[Events.process](dt);
    this.planet.x = this.x;
    this.planet.y = this.y;
    return ret;
  }

  public [Events.render + 2]() {
    if (this.hitCooltime) {
      ctx.beginPath();
      ctx.fillStyle = "#DCDCDC";
      ctx.arc(this.x, this.y, this.planet.radius, 0, PI2);
      ctx.fill();
    } else {
      this.planet[Events.render]();
    }
    return this.isdead();
  }

  protected updateCollisionShape() {
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
  }
}

export class LazerChase implements IBossSkill {
  public static spreadRange = Math.PI / 3;
  public currentAngle: number;
  public laz: Lazer[] = [];
  public mover: MoveToPosition;
  public currentTime: number;
  constructor(
    public numLazer = 1,
    public chaseTime: number = 2,
    public angleSpeedRatio = 5,
    moveTime: number = 2,
  ) {
    this.mover = new MoveToPosition(moveTime);
  }

  public i(b: Boss) {
    this.mover.i(b, randRange([scrwidth * 2 / 3, scrwidth]));
    this.currentTime = this.currentAngle = 0;
    this.laz = [];
  }

  public p(b: Boss) {
    if (this.mover.p(b)) {
      this.currentTime += dt;
      let na = Math.atan2(player.y - b.y, player.x - b.x) - this.currentAngle;
      while (na > Math.PI) {
        na -= Math.PI * 2;
      }
      while (na < -Math.PI) {
        na += Math.PI * 2;
      }
      this.currentAngle += na * this.angleSpeedRatio * dt;
      for (let i = this.numLazer; i--; ) {
        if (!this.laz[i]) {
          this.laz[i] = new Lazer();
          this.laz[i].init({
            age: 3,
            aimTime: this.chaseTime,
          }, b.x, b.y);
        }
        if (this.currentTime < this.chaseTime) {
          this.laz[i].angle = this.getAngle(i);
        }
      }
    }
    return this.laz.length && this.laz[0].isDead();
  }

  private getAngle(i: number) {
    const rangeOffset = this.numLazer > 1 ? LazerChase.spreadRange / (this.numLazer - 1) : 0;
    return this.currentAngle - rangeOffset * ((this.numLazer - 1) / 2 - i);
  }
}

const lazerOffset = 210;
export class LazerScan implements IBossSkill {
  public mover: MoveToPosition;
  public currentTime: number;
  public laz: Lazer[];
  constructor(public numLazer = 1, public scanTime = 1, public moveTime = 1) {
    this.mover = new MoveToPosition(moveTime);
  }

  public i(b: Boss) {
    let y: number;
    if (player.y < scrheight / 2) {
      y = 130;
    } else {
      y = scrheight - 130;
    }
    this.mover.moveTime = this.moveTime;
    this.mover.i(b, randRange([scrwidth * 3 / 4, scrwidth]), y);
    this.currentTime = 0;
    this.laz = [];
    for (let i = this.numLazer; i--; ) {
      this.laz[i] = new Lazer();
      this.laz[i].init({
        age: this.scanTime + .5,
        aimTime: this.moveTime,
      }, b.x, b.y + this.getPos(i), Math.PI);
    }
  }

  public p(b: Boss) {
    this.currentTime += dt;
    if (this.mover.p(b) && this.currentTime < this.moveTime + this.scanTime) {
      const y = scrheight - b.y;
      this.mover.i(b, b.x, y);
      this.mover.moveTime = this.scanTime;
    }
    for (let i = this.numLazer; i--; ) {
      this.laz[i].x = b.x;
      this.laz[i].y = b.y + this.getPos(i);
    }
    return this.laz[0].isDead();
  }

  private getPos(i: number) {
    return - ((this.numLazer - 1) / 2 - i) * lazerOffset;
  }
}

export class RadialLazerScan implements IBossSkill {
  public mover: MoveToPosition = new MoveToPosition();
  public currentTime: number;
  public currentScan: number;
  public currentAngle: number;
  public startAngle: number;
  public changeAngle: number;
  public laz: Lazer;

  constructor(public numberOfScan = 1, public scanTime = 1.5, public waitTime = .5) {}

  public i(b: Boss) {
    this.mover.i(b, scrwidth / 2, scrheight / 2);
    this.currentScan = -1;
    this.currentTime = this.scanTime + this.waitTime;
  }

  public p(b: Boss) {
    if (this.mover.p(b)) {
      this.currentTime += dt;
      if (this.currentTime > this.scanTime + this.waitTime) {
        this.currentTime = 0;
        ++this.currentScan;
        if (this.currentScan >= this.numberOfScan) {
          return true;
        }
        this.startAngle = this.currentAngle = randRange([0, PI2]);
        this.laz = new Lazer();
        this.laz.init({
          age: this.scanTime + .3,
          aimTime: this.waitTime,
        }, b.x, b.y, this.startAngle);
      }
      if (this.currentTime >= this.waitTime) {
        if (this.currentTime - dt <= this.waitTime) {
          let t = cross(
            Math.cos(this.startAngle), Math.sin(this.startAngle),
            player.x - b.x, player.y - b.y,
          );
          t = (t < 0) ? -1 : +(t > 0);
          this.changeAngle = Math.PI * t;
        }
        this.currentAngle = easeInOutQuint(
          this.currentTime - this.waitTime,
          this.startAngle,
          this.changeAngle,
          this.scanTime,
        );
      }
      this.laz.angle = this.currentAngle;
    }
    return this.currentScan >= this.numberOfScan;
  }
}

// export class SumonMoon implements IBossSkill {
//   public moon: Moon;
//   private mover: MoveToPosition = new MoveToPosition(1.5);
//   private currentTime: number;

//   constructor(public waitTime) {}

//   public i(b: Boss) {
//     this.moon = new Moon(b.x, b.y);
//     this.moon.state = MoonState.chasePlayer;
//     this.mover.i(b);
//     this.currentTime = 0;
//   }

//   public p(b: Boss) {
//     this.currentTime += dt;
//     if (this.mover.p(b) && this.mover.moveTime + this.currentTime < this.waitTime) {
//       this.mover.i(b);
//     }
//     if (this.currentTime > this.waitTime) {
//       this.moon.state = MoonState.moveAway;
//       return true;
//     }
//     return false;
//   }
// }
