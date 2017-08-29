import Bullet, {IBulletConfig} from "./Bullet";
import ctx from "./canvas";
import {Events} from "./EventListener";
import {dt} from "./game";

export interface IGunConfig {
  image: HTMLImageElement;
  rotate?: boolean;
  bulletConfig: IBulletConfig;
  reloadTime: number;
}

export default class Gun {
  public x: number = 0;
  public y: number = 0;
  public angle: number = 0;
  public isFiring: boolean = false;

  private currentTime: number = 0;

  constructor(private config: IGunConfig) {
  }

  public fire() {
    const w = this.config.image.width;
    const angle = this.config.rotate ? this.angle : 0;
    Bullet.Respawner.get().init(
      this.config.bulletConfig,
      this.x + w * Math.cos(angle),
      this.y + w * Math.sin(angle),
      angle,
    );
  }

  public [Events.process]() {
    this.currentTime -= dt;
    if (this.currentTime <= 0) {
      this.currentTime += this.config.reloadTime;
      if (this.isFiring) {
        this.fire();
      }
    }
    if (!this.config.rotate) {
      this.angle = 0;
    }
  }

  public [Events.render]() {
    ctx.save();
    ctx.shadowBlur = this.config.image.height / 10;
    ctx.shadowColor = "black";
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.config.image, 0, - this.config.image.height / 2);
    ctx.restore();
  }

  public clone(): Gun {
    return new Gun(this.config);
  }
}
