export interface IEnemyUFOConfig {
  image: HTMLImageElement;
}

export default class EnemyUFO {
  public static offsetAlpha = .03;
  public static maxNumberOfShadow = 5;
  public static captureTime = .2;

  public image: HTMLImageElement;
  public x: number = 0;
  public y: number = 0;

  private previousPos: number[][] = [];
  private captureTimeLeft: number;

  constructor(config: IEnemyUFOConfig) {
    this.init(config);
  }

  public init(config: IEnemyUFOConfig) {
    this.image = config.image;
    this.previousPos = [];
    this.captureTimeLeft = EnemyUFO.captureTime;
  }

  public process(dt: number) {
    while (this.previousPos.length > EnemyUFO.maxNumberOfShadow) {
      this.previousPos.shift();
    }
    this.captureTimeLeft -= dt;
    if (this.captureTimeLeft <= 0) {
      this.captureTimeLeft += EnemyUFO.captureTime;
      this.previousPos.push([this.x, this.y]);
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
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
  }
}
