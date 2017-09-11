import ctx, {scrheight, scrwidth} from "./canvas";
import {addListener, Events} from "./EventListener";
import {dt, shm} from "./game";
import {Circle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export interface IBulletConfig {
  damage?: number;
  radius: number;
  color: string;
  speed: number;
  isPlayerBullet?: boolean;
}

const TAIL_LENGTH = 20;
export default class Bullet implements ICollidable {
  // public static Respawner = new ObjectRespawner(Bullet);
  public collisionShape: Circle = new Circle(0, 0, 0);
  public speed: number;
  public angle: number;
  public color: string;
  public isDead: boolean;
  public tag: number;
  public damage: number;

  [index: number]: (any) => boolean | void;

  public init(config: IBulletConfig, x: number, y: number, angle: number) {
    this.collisionShape.radius = config.radius;
    this.collisionShape.x = x;
    this.collisionShape.y = y;
    this.speed = config.speed;
    this.angle = angle;
    this.color = config.color;
    this.isDead = false;
    this.damage = config.damage || 1;
    this.tag = config.isPlayerBullet ? Tag.player_bullet : Tag.enemy_bullet;
    addListener(this, [Events.process, Events.render + 1]);
  }

  public [Events.process]() {
    const x = this.collisionShape.x += this.speed * Math.cos(this.angle) * dt;
    const y = this.collisionShape.y += this.speed * Math.sin(this.angle) * dt;
    if (
      x < -TAIL_LENGTH || y < -TAIL_LENGTH ||
      x > scrwidth + TAIL_LENGTH || y > scrheight + TAIL_LENGTH
    ) {
      this.isDead = true;
    }

    if (this.tag === Tag.no_tag) {
      this.isDead = true;
    }

    if (!this.isDead) {
      shm.insert(this);
    }
    return this.isDead;
  }

  public [Events.render + 1]() {
    const {x, y} = this.collisionShape;
    ctx.beginPath();
    ctx.lineWidth = 2 * this.collisionShape.radius;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = .3;
    ctx.moveTo(x - Math.cos(this.angle) * TAIL_LENGTH, y - Math.sin(this.angle) * TAIL_LENGTH);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.globalAlpha = 1;
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    return this.isDead;
  }
}
