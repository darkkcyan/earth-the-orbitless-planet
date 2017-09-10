import ctx, {scrheight, scrwidth} from "./canvas";
import {easeInCubic, easeOutCubic} from "./ease";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {dot} from "./math";

export interface ILazerConfig {
  color?: string;
  radius?: number;
  aimTime: number;
  age: number;
}

const sumonTime = .3;
export default class Lazer {
  [index: number]: (any?) => boolean | void;
  public config: ILazerConfig;
  public x: number;
  public y: number;
  public angle: number;
  public currentTime: number;

  public init(config: ILazerConfig, x: number, y: number, angle: number = Math.PI) {
    this.config = config;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.currentTime = -config.aimTime;
    addListener(this, [Events.process, Events.render + 1]);
  }

  public isDead() {
    return this.currentTime > sumonTime + this.config.age;
  }

  public [Events.process]() {
    this.currentTime += dt;
    if (this.currentTime - dt <= sumonTime && this.currentTime >= sumonTime) {
      addListener(this, [Events.collisionCheck]);
    }
    return this.isDead();
  }

  public [Events.collisionCheck]() {
    const ax = player.x - this.x;
    const ay = player.y - this.y;
    const bx = Math.cos(this.angle);
    const by = Math.sin(this.angle);
    if (dot(ax, ay, bx, by) > 0) {
      const d = Math.abs(dot(ax, ay, -by, bx));
      if (d < player.radius + this.getRadius()) {
        player.loseLive();
      }
    }

    return this.currentTime > this.config.age - sumonTime;
  }

  public [Events.render + 1]() {
    const r = this.getRadius();
    ctx.save();
    ctx.beginPath();
    ctx.globalAlpha = 1;
    const a = this.config.age;
    if (this.currentTime > 0) {
      ctx.lineWidth = 2 * r;
      ctx.shadowBlur = 30;
      ctx.lineCap = "round";
      ctx.shadowColor = ctx.strokeStyle = this.config.color || "#7CFC00";
      if (this.currentTime > a - sumonTime * 2) {
        ctx.globalAlpha = Math.max(0, easeInCubic(
          this.currentTime - a + sumonTime * 2,
          1, -1,
          sumonTime * 2,
        ));
      } else if (this.currentTime < sumonTime) {
        ctx.lineWidth = easeInCubic(this.currentTime, 0, 2 * r, sumonTime);
        ctx.globalAlpha = Math.min(1, easeInCubic(this.currentTime, 0, 1, sumonTime));
      }
    } else {
      ctx.lineCap = "butt";
      ctx.setLineDash([ctx.lineWidth = 10]);
      ctx.strokeStyle = "rgba(255,255,255,.5)";
    }
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
