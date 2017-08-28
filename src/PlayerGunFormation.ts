import {Events} from "./EventListener";
import Gun from "./Gun";
import {PI2, SimpleHarmonicMotion as HarMonicmotion} from "./math";
import {getMouseStatus, MouseStatus} from "./mouse";

export interface IPlayerGunFormationConfig {
  planetRadius: number;
  mainGun?: Gun;
  sideGunList: Gun[];
  sideGunPhaseOffset: number;
  hm: HarMonicmotion;
}

export class HarmonicMotionPlayerGunFormation {
  public x: number = 0;
  public y: number = 0;

  private planetRadius: number;
  private mainGun: Gun= null;
  private leftSideGunList: Gun[];
  private rightSideGunList: Gun[];
  private sideGunPhaseOffset: number;
  private hm: HarMonicmotion;

  constructor(config: IPlayerGunFormationConfig) {
    this.planetRadius = config.planetRadius;
    if (config.mainGun) {
      this.mainGun = config.mainGun;
    }
    this.leftSideGunList = config.sideGunList.map((gun) => gun.clone());
    this.rightSideGunList = config.sideGunList.map((gun) => gun.clone());
    this.sideGunPhaseOffset = config.sideGunPhaseOffset;
    this.hm = config.hm;
  }

  public [Events.process](dt: number) {
    this.hm.process(dt);
    const sideGunTimeOffset = this.sideGunPhaseOffset / PI2 * this.hm.period;
    const fire = getMouseStatus() === MouseStatus.DOWN;
    if (this.mainGun) {
      this.mainGun.x = this.x + this.planetRadius;
      this.mainGun.y = this.y;
      this.mainGun.angle = 0;
      this.mainGun.isFiring = fire;
      this.mainGun[Events.process](dt);
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
      leftGun.isFiring = rightGun.isFiring = fire;
      leftGun[Events.process](dt);
      rightGun[Events.process](dt);
    }
  }

  public [Events.render](ctx: CanvasRenderingContext2D) {
    for (const gun of this.leftSideGunList) {
      gun[Events.render](ctx);
    }
    for (const gun of this.rightSideGunList) {
      gun[Events.render](ctx);
    }
    if (this.mainGun) {
      this.mainGun[Events.render](ctx);
    }
  }
}
