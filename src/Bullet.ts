import ctx, {scrheight, scrwidth} from "./canvas";
import {addListener, Events} from "./EventListener";
import {dt, shm} from "./game";
import ObjectRespawner from "./ObjectRespawner";
import {Circle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export interface IBulletConfig {
  radius: number;
  color: string;
  speed: number;
  isPlayerBullet?: boolean;
}

export default class Bullet implements ICollidable {
  public static Respawner = new ObjectRespawner(Bullet);
  public static TAIL_LENGTH = 50;
  public collisionShape: Circle = new Circle(0, 0, 0);
  public speed: number;
  public angle: number;
  public color: string;
  public isDead: boolean;
  public tag: number;

  [index: number]: (any) => boolean | void;

  public init(config: IBulletConfig, x: number, y: number, angle: number) {
    this.collisionShape.radius = config.radius;
    this.collisionShape.x = x;
    this.collisionShape.y = y;
    this.speed = config.speed;
    this.angle = angle;
    this.color = config.color;
    this.isDead = false;
    this.tag = config.isPlayerBullet ? Tag.enemy_bullet : Tag.enemy_bullet;
    addListener(this, [Events.process, Events.collisionCheck, Events.render]);
  }

  public [Events.process]() {
    const x = this.collisionShape.x += this.speed * Math.cos(this.angle) * dt;
    const y = this.collisionShape.y += this.speed * Math.sin(this.angle) * dt;
    if (
      x < -Bullet.TAIL_LENGTH || y < -Bullet.TAIL_LENGTH ||
      x > scrwidth + Bullet.TAIL_LENGTH || y > scrheight + Bullet.TAIL_LENGTH
    ) {
      this.isDead = true;
      Bullet.Respawner.free(this);
    }
    shm.insert(this);
    return this.isDead;
  }

  public [Events.collisionCheck]() {
    for (const obj of shm.retrive(this)) {
      if (
        (obj.tag === Tag.player && this.tag === Tag.enemy_bullet) ||
        (obj.tag === Tag.enemy && this.tag === Tag.player_bullet)
      ) {
        this.isDead = true;
        this.tag = Tag.no_tag;
        // TODO: sumon partical :D
        break;
      }
    }
    return this.isDead;
  }

  public [Events.render]() {
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
