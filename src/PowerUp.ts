import ctx from "./canvas";
import Enemy from "./Enemy";
import {addListener, Events} from "./EventListener";
import {dt, player, shm} from "./game";
import {images, ImagesId} from "./imageLoader";
import {PI2} from "./math";
import {Circle, isCollision} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export default class PowerUp implements ICollidable {
  [index: number]: (any?) => boolean | void;
  public static radius = 35;
  public static speed = 200;
  public collisionShape = new Circle(0, 0, PowerUp.radius);
  public isDead = false;
  public tag = Tag.powerup;
  constructor(public x: number, public y: number) {
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 3]);
  }

  public [Events.process]() {
    this.x -= PowerUp.speed * dt;
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
    if (this.x < -PowerUp.radius) {
      this.isDead = true;
    }
    if (!this.isDead) {
      shm.insert(this);
    }
    return this.isDead;
  }

  public [Events.collisionCheck]() {
    // no need to check in shm
    if (!player.justDead() && isCollision(player.collisionShape, this.collisionShape)) {
      this.isDead = true;
    }
    return this.isDead;
  }

  public [Events.render + 3]() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const i = images[ImagesId.gunlv1];
    ctx.drawImage(i, -i.width / 2, -i.height / 2);
    ctx.beginPath();
    ctx.arc(0, 0, PowerUp.radius, 0, PI2);
    ctx.strokeStyle = "violet";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
    return this.isDead;
  }
}

addListener({
  [Events.enemyDead](e: Enemy) {
    // tslint:disable no-unused-expression
    new PowerUp(e.x, e.y);
  },
}, [Events.enemyDead]);
