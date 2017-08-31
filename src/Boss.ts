import Bullet from "./Bullet";
import {scrheight, scrwidth} from "./canvas";
import {easeInCubic, easeInOutQuad} from "./ease";
import Enemy, {IEnemyConfig} from "./Enemy";
import {Events} from "./EventListener";
import {dt, player} from "./game";

interface IBossSkill {
  init(boss: Boss);
  process(boss: Boss): boolean;
}

export default class Boss extends Enemy {
  private currentSkill: IBossSkill = null;
  constructor(config: IEnemyConfig, private skills: IBossSkill[]) {
    super();
    this.x = scrwidth + config.image.width;
    this.y = scrheight / 2;
    this.init(config);
  }

  public [Events.process]() {
    if (!this.currentSkill || this.currentSkill.process(this)) {
      this.currentSkill = this.skills[Math.floor(Math.random() * this.skills.length)];
      this.currentSkill.init(this);
    }
    return super[Events.process]();
  }

  protected free() {
    // YES, do nothing, cuz only one boss
  }

  protected processFire() {
    // Still do nothing, the skill will handle this
  }
}

export class BulletDrop implements IBossSkill {
  public x: number[];
  public y: number[];

  public currentTime: number;
  constructor(public moveTime = 2, public towardPlayerProbability = .5) {
  }

  public init(b: Boss) {
    this.x = [b.x, scrwidth * (Math.random() / 2 + .5), scrwidth * (Math.random() / 2 + .5)];
    this.y = [b.y, scrheight * Math.random(), scrheight * Math.random()];
    if (Math.random() < this.towardPlayerProbability) {
      this.y[1] = player.y;
    } else {
      if (Math.abs(this.y[1] - b.y) < scrheight / 3) {
        this.y[1] = this.y[0] + scrheight / 3 * (b.y < scrheight / 2 ? 1 : -1);
      }
    }
    this.currentTime = 0;
    console.log(this.x, this.y);
  }

  public process(b: Boss) {
    this.currentTime += dt;
    const t = + (this.currentTime > this.moveTime);
    let ct = this.currentTime;
    if (ct > this.moveTime) {
      ct -= this.moveTime;
    }
    b.x = easeInOutQuad(ct, this.x[t], this.x[t + 1] - this.x[t], this.moveTime);
    b.y = easeInOutQuad(ct, this.y[t], this.y[t + 1] - this.y[t], this.moveTime);
    if (!t) {
      const shootProbability = easeInCubic(ct, 0, 1, this.moveTime);
      if (Math.random() < shootProbability) {
        Bullet.Respawner.get().init(
          b.config.bulletConfig,
          b.x + (Math.random() - .5) * 50,
          b.y + (Math.random() - .5) * 100,
          Math.PI,
        );
      }
    }
    return this.currentTime > this.moveTime * 2;
  }
}
