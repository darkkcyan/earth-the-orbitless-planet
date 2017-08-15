import {PI2} from "./math";

export interface IPlanetConfig {
  radius: number;
}

export default class Planet implements IPlanetConfig {
  public radius: number;
  public x: number = 0;
  public y: number = 0;

  constructor(config: IPlanetConfig) {
    for (const i in config) {
      if (config.hasOwnProperty(i)) {
        this[i] = config[i];
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.arc(this.x, this.y, this.radius, 0, PI2);
  }
}
