import ctx, {scrheight, scrwidth} from "./canvas";
import {easeInCubic, easeOutCubic} from "./ease";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import ObjectRespawner from "./ObjectRespawner";

export interface ILazerConfig {
  color?: string;
  radius?: number;
  age: number;
}

export default class Lazer {
  public static sumonTime = .3;
  [index: number]: (any?) => boolean | void;
  public static Respawner = new ObjectRespawner(Lazer);
  public config: ILazerConfig;
  public x: number;
  public y: number;
  public angle: number;
  public currentTime: number;

  public init(config: ILazerConfig, x: number, y: number, angle: number) {
    this.config = config;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.currentTime = 0;
    addListener(this, [Events.process, Events.render + 1]);
  }

  public isDead() {
    return this.currentTime > Lazer.sumonTime + this.config.age;
  }

  public [Events.process]() {
    this.currentTime += dt;
    if (this.currentTime - dt <= Lazer.sumonTime && this.currentTime >= Lazer.sumonTime) {
      addListener(this, [Events.collisionCheck]);
    }
    if (this.isDead()) {
      Lazer.Respawner.free(this);
      return true;
    }
    return false;
  }

  public [Events.collisionCheck]() {

    return this.isDead();
  }

  public [Events.render + 1]() {
    const r = this.getRadius();
    ctx.save();
    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2 * r;
    ctx.shadowBlur = 30;
    const a = this.config.age;
    if (this.currentTime > a - Lazer.sumonTime * 2) {
      ctx.globalAlpha = Math.max(0, easeInCubic(
        this.currentTime - a + Lazer.sumonTime * 2,
        1,
        -1,
        Lazer.sumonTime * 2,
      ));
    } else if (this.currentTime < Lazer.sumonTime) {
      ctx.lineWidth = easeInCubic(this.currentTime, 0, 2 * r, Lazer.sumonTime);
      ctx.globalAlpha = Math.min(1, easeInCubic(this.currentTime, 0, 1, Lazer.sumonTime));
    }
    ctx.lineCap = "round";
    ctx.shadowColor = ctx.strokeStyle = this.config.color || "#7CFC00";
    ctx.moveTo(this.x, this.y);
    const len = scrwidth * Math.SQRT2;
    ctx.lineTo(this.x + len * Math.cos(this.angle), this.y + len * Math.sin(this.angle));
    ctx.stroke();
    ctx.restore();
    return this.isDead();
  }

  private getRadius() {
    return this.config.radius || 20;
  }
}
