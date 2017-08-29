import {scrheight, scrwidth} from "./canvas";
import {addListener, Events} from "./EventListener";
import ObjectRespawner from "./ObjectRespawner";
import {Circle} from "./shapes";
import {ICollidable} from "./SpatialHashMap";

export interface IBulletConfig {
  radius: number;
  color: string;
  speed: number;
}

export default class Bullet implements ICollidable {
  public static Respawner = new ObjectRespawner(Bullet);
  public static TAIL_LENGTH = 50;
  public collisionShape: Circle = new Circle(0, 0, 0);
  public speed: number;
  public angle: number;
  public color: string;
  public isDead: boolean;

  [index: number]: (any) => boolean | void;

  public init(config: IBulletConfig, x: number, y: number, angle: number) {
    this.collisionShape.radius = config.radius;
    this.collisionShape.x = x;
    this.collisionShape.y = y;
    this.speed = config.speed;
    this.angle = angle;
    this.color = config.color;
    this.isDead = false;
    addListener(this, [Events.process, Events.render]);
  }

  public [Events.process](dt: number) {
    const x = this.collisionShape.x += this.speed * Math.cos(this.angle) * dt;
    const y = this.collisionShape.y += this.speed * Math.sin(this.angle) * dt;
    if (
      x < -Bullet.TAIL_LENGTH || y < -Bullet.TAIL_LENGTH ||
      x > scrwidth + Bullet.TAIL_LENGTH || y > scrheight + Bullet.TAIL_LENGTH
    ) {
      this.isDead = true;
      Bullet.Respawner.free(this);
    }
    return this.isDead;
  }

  public [Events.render](ctx: CanvasRenderingContext2D) {
    const {x, y} = this.collisionShape;
    ctx.beginPath();
    ctx.lineWidth = 2 * this.collisionShape.radius;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = .3;
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(this.angle) * Bullet.TAIL_LENGTH, y - Math.sin(this.angle) * Bullet.TAIL_LENGTH);
    ctx.stroke();
    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    return this.isDead;
  }
}
