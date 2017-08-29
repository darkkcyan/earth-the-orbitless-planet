import {scrheight, scrwidth} from "./canvas";
import EnemyUFO, {IEnemyUFOConfig} from "./EnemyUFO";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {SimpleHarmonicMotion as HarmonicMotion} from "./math";

export interface IUFOFormationConstructor {
  new (UFOList: IEnemyUFOConfig[]);
}

export const enum UFOFormation {
  single,
}

const formations: IUFOFormationConstructor[] = [];
export default formations;

formations[UFOFormation.single] = class SingleUFOFormation {
  public static towardPlayerProbability = .05;
  public static moveTime = 1.5;

  [index: number]: (any) => boolean | void;
  public UFO: EnemyUFO;

  private dtx = 0;
  private dty = 0;
  private nextX = 0;
  private nextY = 0;
  private currentTime = SingleUFOFormation.moveTime * 2;
  private hm = new HarmonicMotion(.5, 2 * SingleUFOFormation.moveTime);
  constructor(UFOList: IEnemyUFOConfig[]) {
    this.UFO = new EnemyUFO();
    this.UFO.init(UFOList[0]);
    this.UFO.x = scrwidth + 100;  // magic number :D
    this.UFO.y = scrheight / 2;
    addListener(this, [Events.process]);
  }

  public [Events.process]() {
    this.hm.process(dt);
    if (this.hm.getPhase() < Math.PI) {
      this.hm.t = this.hm.period / 2;
      if (Math.random() <= SingleUFOFormation.towardPlayerProbability) {
        this.nextX = player.x;
        this.nextY = player.y;
      } else {
        this.nextX = scrwidth * (Math.random() / 2 + .5);
        this.nextY = scrheight * Math.random();
      }
      this.dtx = this.nextX - this.UFO.x;
      this.dty = this.nextY - this.UFO.y;
    }
    this.UFO.x = this.nextX + (this.hm.getX() - .5) * this.dtx;
    this.UFO.y = this.nextY + (this.hm.getX() - .5) * this.dty;
  }
};
