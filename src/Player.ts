import ctx from "./canvas";
import {easeOutCubic} from "./ease";
import {addListener, emit, Events} from "./EventListener";
import {dt, shm} from "./game";
import Gun from "./Gun";
import {images, ImagesId} from "./imageLoader";
import {
  HALF_PI,
  PI2,
  SimpleHarmonicMotion as HarmonicMotion,
} from "./math";
import {getMousePos} from "./mouse";
import Particle from "./Particle";
import Planet from "./Planet";
import getPlayerGunFormation, {HarmonicMotionPlayerGunFormation} from "./PlayerGunFormation";
import {
  PlayerRocket as Rocket,
} from "./PlayerRocket";
import {Circle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

const respawnTime = 2;
const relaxTime = 3;
export default class Player extends Planet implements ICollidable {
  public collisionShape: Circle = new Circle(0, 0, 0);
  public tag: number = Tag.player;

  public live: number = 3;
  public level: number = 0;

  [index: number]: (any) => boolean | void;

  private rocket: Rocket;
  private gunFormation: HarmonicMotionPlayerGunFormation;
  private currentTime: number;

  constructor() {
    super(images[ImagesId.earthSurface]);
    this.collisionShape.radius = this.radius;
    this.currentTime = relaxTime;
    this.rocket = new Rocket(
      this.radius / 1.5,
      this.radius * 1.25,
      new HarmonicMotion(5, 1, PI2 * Math.random()),
    );
    this.gunFormation = getPlayerGunFormation(this.level);
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 3]);
  }

  public [Events.process]() {
    if (this.isdead()) {
      setTimeout(() => emit(Events.playerdead), 2000);
      return true;
    }
    if (this.currentTime > 0) {
      this.currentTime -= dt;
    }
    if (this.currentTime > relaxTime) {
      return false;
    }
    [this.x, this.y] = getMousePos();
    this.gunFormation.planetRadius = this.radius * 1.1;
    this.collisionShape.x = this.gunFormation.x = this.x;
    this.collisionShape.y = this.gunFormation.y = this.y;
    this.rocket[Events.process]();
    this.rocket.x = this.x - this.radius - 10;
    this.rocket.y = this.y;
    super[Events.process]();
    this.gunFormation[Events.process]();
    shm.insert(this);
    return false;
  }

  public [Events.collisionCheck]() {
    if (this.currentTime > relaxTime) {
      return false;
    }
    for (const obj of shm.retrive(this)) {
      const t = obj.tag;
      if (this.currentTime < 0) {
        if (t === Tag.enemy_bullet) {
          obj.tag = Tag.no_tag;
        }
        if ([Tag.enemy, Tag.enemy_bullet, Tag.evil_moon].indexOf(t) > -1) {
          this.loseLive();
          return false;
        }
      }
      if (t === Tag.powerup) {
        this.gunFormation = getPlayerGunFormation(++this.level);
      }
    }
    return this.isdead();
  }

  public [Events.render + 3]() {
    if (this.currentTime < relaxTime) {
      super[Events.render]();
      this.rocket[Events.render]();
      this.gunFormation[Events.render]();
    }
    if (this.isRelax()) {
      const r = this.radius * 1.4;
      ctx.save();
      ctx.lineWidth = 10;
      ctx.fillStyle = ctx.strokeStyle = "#00DCFF";
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, PI2);
      ctx.globalAlpha = easeOutCubic(this.currentTime, 0, .5, relaxTime);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    return this.isdead();
  }

  public isRelax() {
    return this.currentTime > 0 && this.currentTime < relaxTime;
  }

  public isdead() {
    return this.live < 1;
  }

  public justDead() {
    return this.currentTime > relaxTime;
  }

  public loseLive() {
    if (this.currentTime < 0) {
      --this.live;
      if (this.level > 10) {
        this.level >>= 1;
      } else {
        this.level -= +(this.level > 0) + +(this.level > 2) + +(this.level > 5) + +(this.level > 8);
      }
      this.setGunLv(this.level);
      Particle.createPartical(100, this.x, this.y, 6, "cyan");
      this.currentTime = relaxTime + respawnTime;
    }
  }

  public setGunLv(lv: number) {
    this.level = lv;
    this.gunFormation = getPlayerGunFormation(this.level);
  }
}
