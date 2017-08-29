import Bullet, {IBulletConfig} from "./Bullet";
import ctx from "./canvas";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {randRange} from "./math";

export interface IEnemyUFOConfig {
  image: HTMLImageElement;
  bulletConfig: IBulletConfig;
}

export default class EnemyUFO {
  [index: number]: (any) => boolean | void;
  public static offsetAlpha = .03;
  public static maxNumberOfShadow = 5;
  public static captureTime = .2;

  public static fireTimeRange: [number, number] = [1, 2];
  public static fireTowardPlayerProbability = .3;

  public x: number = 0;
  public y: number = 0;

  private config: IEnemyUFOConfig;
  private previousPos: number[][] = [];
  private captureTimeLeft: number;
  private fireTime: number;

  public init(config: IEnemyUFOConfig) {
    this.config = config;
    this.previousPos = [];
    this.captureTimeLeft = 0;
    this.fireTime = randRange(EnemyUFO.fireTimeRange);
    addListener(this, [Events.process, Events.render]);
  }

  public [Events.process]() {
    while (this.previousPos.length > EnemyUFO.maxNumberOfShadow) {
      this.previousPos.shift();
    }
    this.captureTimeLeft -= dt;
    if (this.captureTimeLeft <= 0) {
      this.captureTimeLeft += EnemyUFO.captureTime;
      this.previousPos.push([this.x, this.y]);
    }

    this.fireTime -= dt;
    if (this.fireTime <= 0) {
      this.fireTime += randRange(EnemyUFO.fireTimeRange);
      const towardPlayer = Math.random() < EnemyUFO.fireTowardPlayerProbability;
      let angle: number = Math.PI;
      if (towardPlayer)  {
        angle = Math.atan2(player.y - this.y, player.x - this.x);
      } else if (player.x > this.x) {
        angle = 0;
      }
      Bullet.Respawner.get().init(
        this.config.bulletConfig,
        this.x, this.y,
        angle,
      );
    }
  }

  public [Events.render]() {
    const w = this.config.image.width;
    const h = this.config.image.height;
    for (
      let i = 0, alpha = EnemyUFO.offsetAlpha;
      i < this.previousPos.length - 1;
      ++i, alpha += EnemyUFO.offsetAlpha
    ) {
      ctx.globalAlpha = alpha;
      const [x, y] = this.previousPos[i];
      ctx.drawImage(this.config.image, x - w / 2, y - h / 2);
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(this.config.image, this.x - w / 2, this.y - h / 2);
  }
}
