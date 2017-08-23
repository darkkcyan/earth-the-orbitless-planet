import {HALF_PI, SimpleHarmonicMotion as HarmonicMotioin} from "./math";

export class PlayerRocket {
  public x: number = 0;
  public y: number = 0;

  private previousX: number = 0;
  private previousY: number = 0;
  private realFlameSize: number;

  constructor(public rocketSize: number, public flameSize: number, private hm: HarmonicMotioin) {
  }

  public process(dt: number) {
    this.hm.process(dt);
    const RANDOM_RANGE = this.flameSize / 5;
    this.realFlameSize = this.flameSize + (this.x - this.previousX) * 3;
    this.realFlameSize += RANDOM_RANGE * (Math.random() - 0.5);
    if (this.realFlameSize < this.flameSize / 10) {
      this.realFlameSize = this.flameSize / 10;
    }
    this.previousX = this.x;
    this.previousY = this.y;
  }

  public renderRocketPart(ctx: CanvasRenderingContext2D) {
    const x = this.x - this.hm.getX();
    const y = this.y;
    const halfrs = this.rocketSize / 2;
    const magic = 0.9;
    const d: Array<[number, number, string]> = [
      [x - halfrs * 2, y - halfrs, "#79E9DD"],
      [x - halfrs * 1.5, y - halfrs, "#36C3DE"],
    ];
    for (const [tx, ty, color] of d) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx, ty + halfrs * 2);
      ctx.lineTo(tx + halfrs / 2, ty + halfrs * 2 * magic);
      ctx.lineTo(tx + halfrs / 2, ty + halfrs * 2 * (1 - magic));
      ctx.fill();
    }
    ctx.fillStyle = "#2468B4";
    ctx.beginPath();
    ctx.arc(x - halfrs, y, halfrs, -HALF_PI, HALF_PI);
    ctx.fill();
  }

  public renderFlamePart(ctx: CanvasRenderingContext2D) {
    const halfrs = this.rocketSize / 2;
    const x = this.x - this.hm.getX() - halfrs * 2;
    const y = this.y;
    const magic = 0.618;  // the magic is golden ratio
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowBlur = 20;
    ctx.globalAlpha *= 0.5;
    ctx.beginPath();
    const d: Array<[number, string]> = [
      [1, "red"],
      [magic, "yellow"],
    ];
    for (const [factor, color] of d) {
      ctx.beginPath();
      ctx.moveTo(0, - halfrs * magic * factor);
      ctx.lineTo(-this.realFlameSize * magic * factor, -halfrs * factor);
      ctx.lineTo(-this.realFlameSize * factor, 0);
      ctx.lineTo(-this.realFlameSize * magic * factor, halfrs * factor);
      ctx.lineTo(0, halfrs * magic * factor);
      ctx.shadowColor = ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
  }

  public render(ctx: CanvasRenderingContext2D) {
    this.renderRocketPart(ctx);
    this.renderFlamePart(ctx);
  }
}

interface IPlayerRocketWithZOrder extends PlayerRocket {
  z: number;
}

export class PlayerRocketGroup {
  public x: number;
  public y: number;
  public rocketList: IPlayerRocketWithZOrder[] = [];

  constructor(rocketList: PlayerRocket[], public hm: HarmonicMotioin) {
    for (const rocket of (rocketList as IPlayerRocketWithZOrder[])) {
      this.rocketList.push(rocket);
      rocket.z = 0;
    }
  }

  public process(dt: number) {
    this.hm.process(dt);
    const timeOffset = this.hm.period / this.rocketList.length;
    let t = 0;
    for (const roc of this.rocketList) {
      roc.x = this.x;
      roc.y = this.y + this.hm.getY(t);
      roc.z = this.hm.getX(t);
      t += timeOffset;
      roc.process(dt);
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const rl = this.rocketList.slice();
    rl.sort((a, b) => a.z - b.z);
    for (const roc of rl) {
      ctx.globalAlpha = Math.min(0.5 + 0.5 * (roc.z / this.hm.amplitute + 1) / 2, 1);
      roc.render(ctx);
    }
    ctx.globalAlpha = 1;
  }
}
