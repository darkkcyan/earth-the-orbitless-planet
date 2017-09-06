import {scrheight, scrwidth} from "./canvas";
import {addListener, Events} from "./EventListener";
import {dt, player, shm} from "./game";
import {images, ImagesId} from "./imageLoader";
import Planet from "./Planet";
import {Circle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export const enum MoonState {
  noState,
  chasePlayer,
  aroundPlayer,
  moveAway,
}

export default class Moon implements ICollidable {
  [index: number]: (any?) => boolean | void;
  public state: number = MoonState.noState;

  public velX = 0;
  public velY = 0;
  public planet = new Planet(images[ImagesId.moonSurface]);
  public collisionShape: Circle;
  public tag: Tag;
  public damage = 1.5;

  constructor(public x: number, public y: number) {
    this.collisionShape = new Circle(x, y, this.planet.radius);
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 1]);
  }

  public isDead() {
    return this.state === MoonState.moveAway && (
      this.x < -this.planet.radius ||
      this.x > scrwidth + this.planet.radius ||
      this.y < -this.planet.radius ||
      this.y > scrheight + this.planet.radius
    );
  }

  public [Events.process]() {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    let accelerate: number;
    let maxSpeed: number;
    let minSpeed: number;
    switch (this.state) {
      case MoonState.chasePlayer:
        accelerate = 260;
        maxSpeed = 800;
        minSpeed = 0;
        this.tag = Tag.evil_moon;
        break;
      case MoonState.aroundPlayer:
        accelerate = 200;
        maxSpeed = 1500;
        minSpeed = 600;
        this.tag = Tag.good_moon;
        break;
      case MoonState.moveAway:
        accelerate = -50;
        maxSpeed = 600;
        minSpeed = 0;
        this.tag = Tag.evil_moon;
        break;
    }
    this.velX += Math.cos(angle) * accelerate * dt;
    this.velY += Math.sin(angle) * accelerate * dt;
    const speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
    const maxr = maxSpeed * dt / speed;
    const minr = minSpeed * dt / speed;
    if (maxr < 1) {
      this.velX *= maxr;
      this.velY *= maxr;
    }
    if (minr > 1) {
      this.velX *= minr;
      this.velY *= minr;
    }
    this.x += this.velX;
    this.y += this.velY;
    this.collisionShape.x = this.planet.x = this.x;
    this.collisionShape.y = this.planet.y = this.y;
    this.planet[Events.process]();
    if (!this.isDead()) {
      shm.insert(this);
      return false;
    }
    return true;
  }

  public [Events.collisionCheck]() {
    // TODO: add content
    return this.isDead();
  }

  public [Events.render + 1]() {
    this.planet[Events.render]();
    return this.isDead();
  }
}
