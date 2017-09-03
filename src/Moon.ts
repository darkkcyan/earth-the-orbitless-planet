import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {images, ImagesId} from "./imageLoader";
import Planet from "./Planet";

export const enum MoonState {
  noState,
  chasePlayer,
  aroundPlayer,
  moveAway,
}

export default class Moon {
  [index: number]: (any?) => boolean | void;
  public state: number = MoonState.noState;

  public velX = 0;
  public velY = 0;
  public planet = new Planet(images[ImagesId.moonSurface]);

  constructor(public x: number, public y: number) {
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 1]);
  }

  public [Events.process]() {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    let accelerate: number;
    let maxSpeed: number;
    let minSpeed: number;
    switch (this.state) {
      case MoonState.chasePlayer:
        accelerate = 260;
        maxSpeed = 600;
        minSpeed = 0;
        break;
      case MoonState.aroundPlayer:
        accelerate = 200;
        maxSpeed = 1500;
        minSpeed = 600;
        break;
      case MoonState.moveAway:
        accelerate = -50;
        maxSpeed = 600;
        minSpeed = 0;
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
    this.planet.x = this.x;
    this.planet.y = this.y;
    this.planet[Events.process]();
  }

  public [Events.collisionCheck]() {
    // TODO: add content
  }

  public [Events.render + 1]() {
    this.planet[Events.render]();
  }
}
