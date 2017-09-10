import ctx from "./canvas";
import {easeOutCubic} from "./ease";
import {addListener, Events} from "./EventListener";
import {dt} from "./game";
import {PI2, randNeg} from "./math";

const speed = 4;
export default class Partical {
  [index: number]: (any?) => boolean | void;

  public static createPartical(
    num: number,
    x: number,
    y: number,
    radius: number,
    color: string = "red",
    age: number = 60,
  ) {
    while (num --) {
      new Partical().init(
        x + randNeg(radius), y + randNeg(radius), radius + randNeg(radius - 3), color, age);
    }
  }

  public x: number;
  public y: number;
  public angle: number;
  public age: number;
  public radius: number;
  public currentTime;
  public color: string;

  public init(x: number, y: number, radius: number, color: string, age: number) {
    this.x = x;
    this.y = y;
    this.age = age;
    this.radius = radius;
    this.angle = PI2 * Math.random();
    this.color = color;
    this.currentTime = 0;
    addListener(this, [Events.process, Events.render]);
  }

  public [Events.process]() {
    this.x += speed * Math.cos(this.angle);
    this.y += speed * Math.sin(this.angle);
    ++this.currentTime;
    return this.currentTime >= this.age;
  }

  public [Events.render]() {
    ctx.globalAlpha = easeOutCubic(this.currentTime, 1, -1, this.age);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, PI2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
    return this.currentTime >= this.age;
  }
}
