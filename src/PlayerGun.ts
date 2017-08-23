import {PI2, SimpleHarmonicMotion as HarMonicmotion} from "./math";
// TODO: make the gun fire.

export class PlayerGun {
  public x: number = 0;
  public y: number = 0;

  constructor(private image: HTMLImageElement) {
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.image, this.x, this.y - this.image.height / 2);
  }

  public clone(): PlayerGun {
    return new PlayerGun(this.image);
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
    }
    for (let i = 0, t = 0; i < this.leftSideGunList.length; ++i, t += sideGunTimeOffset) {
      const leftGun = this.leftSideGunList[i];
      const rightGun = this.rightSideGunList[i];
      const leftAngle = this.hm.getX(t);
      const rightAngle = this.hm.getX(t + this.hm.period / 2);
      leftGun.x = this.x + this.planetRadius * Math.cos(leftAngle);
      leftGun.y = this.y + this.planetRadius * Math.sin(leftAngle);
      rightGun.x = this.x + this.planetRadius * Math.cos(rightAngle);
      rightGun.y = this.y + this.planetRadius * Math.sin(rightAngle);
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
