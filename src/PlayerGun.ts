import {PI2, SimpleHarmonicMotion as HarMonicmotion} from "./math";
// TODO: make the gun fire.

export class PlayerGun {
  public x: number = 0;
  public y: number = 0;
  public angle: number = 0;

  constructor(private image: HTMLImageElement, public rotate: boolean = false) {
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = this.image.height / 10;
    ctx.shadowColor = "black";
    ctx.translate(this.x, this.y);
    if (this.rotate) {
      ctx.rotate(this.angle);
    }
    ctx.drawImage(this.image, 0, - this.image.height / 2);
    ctx.restore();
  }

  public clone(): PlayerGun {
    return new PlayerGun(this.image, this.rotate);
  }
}

export interface IPlayerGunFormationConfig {
  planetRadius: number;
  mainGun?: PlayerGun;
  sideGunList: PlayerGun[];
  sideGunPhaseOffset: number;
  hm: HarMonicmotion;
}

export class HarmonicMotionPlayerGunFormation {
  public x: number = 0;
  public y: number = 0;

  private planetRadius: number;
  private mainGun: PlayerGun = null;
  private leftSideGunList: PlayerGun[];
  private rightSideGunList: PlayerGun[];
  private sideGunPhaseOffset: number;
  private hm: HarMonicmotion;

  constructor(config: IPlayerGunFormationConfig) {
    this.planetRadius = config.planetRadius;
    if (config.mainGun) {
      this.mainGun = config.mainGun;
    }
    this.leftSideGunList = config.sideGunList;
    this.rightSideGunList = config.sideGunList.map((gun) => gun.clone());
    this.sideGunPhaseOffset = config.sideGunPhaseOffset;
    this.hm = config.hm;
  }

  public process(dt: number) {
    this.hm.process(dt);
    const sideGunTimeOffset = this.sideGunPhaseOffset / PI2 * this.hm.period;
    if (this.mainGun) {
      this.mainGun.x = this.x + this.planetRadius;
      this.mainGun.y = this.y;
      this.mainGun.angle = 0;
    }
    for (let i = 0, t = 0; i < this.leftSideGunList.length; ++i, t += sideGunTimeOffset) {
      const leftGun = this.leftSideGunList[i];
      const rightGun = this.rightSideGunList[i];
      leftGun.angle = this.hm.getX(t);
      rightGun.angle = this.hm.getX(t + this.hm.period / 2);
      leftGun.x = this.x + this.planetRadius * Math.cos(leftGun.angle);
      leftGun.y = this.y + this.planetRadius * Math.sin(leftGun.angle);
      rightGun.x = this.x + this.planetRadius * Math.cos(rightGun.angle);
      rightGun.y = this.y + this.planetRadius * Math.sin(rightGun.angle);
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const gun of this.leftSideGunList) {
      gun.render(ctx);
    }
    for (const gun of this.rightSideGunList) {
      gun.render(ctx);
    }
    if (this.mainGun) {
      this.mainGun.render(ctx);
    }
  }
}
