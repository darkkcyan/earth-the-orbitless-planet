import ctx, {scrheight, scrwidth} from "./canvas";
import {addListener, Events} from "./EventListener";
import {dt} from "./game";
import {clamp, PI2} from "./math";

export default class StarField {
  [index: number]: (any?) => boolean | void;
  public stars: Array<[number, number]> = [];
  private speed: number = 0;
  private accelerate: number;

  constructor(numberOfStar: number, public scrollSpeed: number) {
    while (numberOfStar--) {
      this.stars.push([scrwidth * Math.random(), scrheight * Math.random()]);
    }
    this[Events.startScroll]();
    addListener(this, [Events.render, Events.startScroll, Events.stopScroll]);
  }

  public [Events.render]() {
    ctx.save();
    ctx.shadowColor = ctx.fillStyle = "white";
    ctx.shadowBlur = 4;
    this.speed = clamp(this.speed + this.accelerate * dt, 0, this.scrollSpeed);
    for (let i = this.stars.length; i--; ) {
      const s = this.stars[i];
      s[0] -= this.speed * dt;
      if (s[0] < 0) {
        s[1] = Math.random() * scrheight;
        s[0] = scrwidth + 100 * Math.random();
      }
      ctx.beginPath();
      ctx.arc(s[0], s[1], 1, 0, PI2);
      ctx.fill();
    }
    ctx.restore();
  }

  public [Events.startScroll]() {
    this.accelerate = this.scrollSpeed * .5;
  }

  public [Events.stopScroll]() {
    this.accelerate = -this.scrollSpeed * .5;
  }
}
