import ctx from "./canvas";
import {easeOutCubic} from "./ease";
import {addListener, Events} from "./EventListener";
import {dt} from "./game";
import {PI2} from "./math";
import ObjectRespawner from "./ObjectRespawner";

export default class Partical {
  [index: number]: (any?) => boolean | void;

  public static Respawner = new ObjectRespawner(Partical);
  public static speed = 4;
  public static createPartical(
    num: number,
    x: number,
    y: number,
    radius: number,
    color: string = "red",
    age: number = 60,
  ) {
    while (num --) {
      Partical.Respawner.get().init(x, y, radius, color, age);
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
    this.x += Partical.speed * Math.cos(this.angle);
    this.y += Partical.speed * Math.sin(this.angle);
    ++this.currentTime;
    if (this.currentTime >= this.age) {
      Partical.Respawner.free(this);
      return true;
    }
    return false;
  }

  public [Events.render]() {
    ctx.globalAlpha = easeOutCubic(this.currentTime, 1, -1, this.age);
    console.log(ctx.globalAlpha);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, PI2);
    ctx.fillStyle = this.color;
    ctx.fill();
    // ctx.beginPath();
    // ctx.moveTo(this.x - this.radius * Math.cos(this.angle), this.y - this.radius * Math.sin(this.angle));
    // ctx.lineTo(this.x, this.y);
    // ctx.globalAlpha *= .3;
    // ctx.lineCap = "round";
    // ctx.strokeStyle = this.color;
    // ctx.lineWidth = this.radius * 2;
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.lineTo(this.x, this.y);
    // ctx.globalAlpha /= .3;
    // ctx.stroke();
    ctx.globalAlpha = 1;
    return this.currentTime >= this.age;
  }
}
