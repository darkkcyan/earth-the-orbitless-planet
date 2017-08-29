import {scrheight, scrwidth} from "./canvas";
import EnemyUFO, {IEnemyUFOConfig} from "./EnemyUFO";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";

export interface IUFOFormationConstructor {
  new (UFOList: IEnemyUFOConfig[]);
}

export const enum UFOFormation {
  single,
}

const formations: IUFOFormationConstructor[] = [];
export default formations;

formations[UFOFormation.single] = class SingleUFOFormation {
  public static towardPlayerProbability = .1;
  public static moveTime = .7;

  [index: number]: (any) => boolean | void;
  public UFO: EnemyUFO;

  private nextX = 0;
  private nextY = 0;
  private currentTime = SingleUFOFormation.moveTime * 2;
  constructor(UFOList: IEnemyUFOConfig[]) {
    this.UFO = new EnemyUFO();
    this.UFO.init(UFOList[0]);
    this.UFO.x = scrwidth + 100;  // magic number :D
    this.UFO.y = scrheight / 2;
    addListener(this, [Events.process]);
  }

  public [Events.process]() {
    if (this.currentTime >= 2 * SingleUFOFormation.moveTime) {
      this.currentTime -= 2 * SingleUFOFormation.moveTime;
      if (Math.random() <= SingleUFOFormation.towardPlayerProbability) {
        this.nextX = player.x;
        this.nextY = player.y;
      } else {
        this.nextX = scrwidth * (Math.random() / 2 + .5);
        this.nextY = scrheight * Math.random();
      }
    }
    this.currentTime += dt;
    const t = SingleUFOFormation.moveTime - this.currentTime;
    if (t <= 0) {
      return;
    }
    this.UFO.x += dt / t * (this.nextX - this.UFO.x);
    this.UFO.y += dt / t * (this.nextY - this.UFO.y);
  }
};
