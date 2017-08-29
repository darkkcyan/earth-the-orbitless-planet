import ctx from "./canvas";
import {Events} from "./EventListener";
import {dt} from "./game";
import Gun from "./Gun";

export interface IEnemyUFOConfig {
  image: HTMLImageElement;
  gun: Gun;
}

export default class EnemyUFO {
  public static offsetAlpha = .03;
  public static maxNumberOfShadow = 5;
  public static captureTime = .2;

  public static fireTimeRange: [number, number] = [5, 10];

  public image: HTMLImageElement;
  public x: number = 0;
  public y: number = 0;

  private previousPos: number[][] = [];
  private captureTimeLeft: number;
  private gun: Gun;

  public init(config: IEnemyUFOConfig) {
    this.image = config.image;
    this.previousPos = [];
    this.gun = config.gun;
    this.captureTimeLeft = EnemyUFO.captureTime;
  }

  public process() {
    while (this.previousPos.length > EnemyUFO.maxNumberOfShadow) {
      this.previousPos.shift();
    }
    this.captureTimeLeft -= dt;
    if (this.captureTimeLeft <= 0) {
      this.captureTimeLeft += EnemyUFO.captureTime;
      this.previousPos.push([this.x, this.y]);
    }
    this.gun.x = this.x;
    this.gun.y = this.y;
  }

  public render() {
    for (
      let i = 0, alpha = EnemyUFO.offsetAlpha;
      i < this.previousPos.length - 1;
      ++i, alpha += EnemyUFO.offsetAlpha
    ) {
      ctx.globalAlpha = alpha;
      const [x, y] = this.previousPos[i];
      ctx.drawImage(this.image, x - this.image.width / 2, y - this.image.height / 2);
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(this.image, this.x - this.image.width / 2, this.y - this.image.height / 2);
    this.gun[Events.render]();
  }
}
