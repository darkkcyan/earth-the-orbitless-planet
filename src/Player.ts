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
  PlayerRocketGroup as RocketGroup,
} from "./PlayerRocket";
import {Circle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export default class Player implements ICollidable {
  public static respawnTime = 2;
  public static relaxTime = 3;
  public followMouse = true;
  public collisionShape: Circle = new Circle(0, 0, 0);
  public tag: number = Tag.player;
  public x: number = 0;
  public y: number = 0;
  public planet: Planet;

  public live: number = 3;
  public level: number = 0;

  [index: number]: (any) => boolean | void;

  private rocketGroup: RocketGroup;
  private gunFormation: HarmonicMotionPlayerGunFormation;
  private currentTime: number;

  constructor(radius?: number) {
    radius = radius || images[ImagesId.earthSurface].height / 2;
    const rl = [];
    this.planet = new Planet(images[ImagesId.earthSurface]);
    this.collisionShape.radius = radius;
    this.currentTime = Player.relaxTime;
    for (let i = 0; i < 3; ++i) {
      rl.push(new Rocket(
        this.planet.radius / 2.5,
        this.planet.radius / 1.5,
        new HarmonicMotion(5, 1, PI2 * Math.random()),
      ));
    }
    this.rocketGroup = new RocketGroup(rl, new HarmonicMotion(this.planet.radius / 4, 2));
    this.gunFormation = getPlayerGunFormation(this.level);
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 3]);
  }

  public [Events.process]() {
    if (this.isdead()) {
      emit(Events.playerdead);
      return true;
    }
    if (this.currentTime > 0) {
      this.currentTime -= dt;
    }
    if (this.currentTime > Player.relaxTime) {
      return false;
    }
    if (this.followMouse) {
      [this.x, this.y] = getMousePos();
    }
    this.gunFormation.planetRadius = this.planet.radius * 1.1;
    this.collisionShape.x = this.gunFormation.x = this.planet.x = this.x;
    this.rocketGroup.x = this.x - this.planet.radius - 10;
    this.collisionShape.y = this.gunFormation.y = this.rocketGroup.y = this.planet.y = this.y;
    this.planet[Events.process]();
    this.rocketGroup[Events.process]();
    this.gunFormation[Events.process]();
    shm.insert(this);
    return false;
  }

  public [Events.collisionCheck]() {
    if (this.currentTime > Player.relaxTime) {
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
    if (this.currentTime < Player.relaxTime) {
      this.planet[Events.render]();
      this.rocketGroup[Events.render]();
      this.gunFormation[Events.render]();
    }
    if (this.isRelax()) {
      const r = this.planet.radius * 1.4;
      ctx.save();
      ctx.lineWidth = 10;
      ctx.fillStyle = ctx.strokeStyle = "#00DCFF";
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, PI2);
      ctx.globalAlpha = easeOutCubic(this.currentTime, 0, .5, Player.relaxTime);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    return this.isdead();
  }

  public isRelax() {
    return this.currentTime > 0 && this.currentTime < Player.relaxTime;
  }

  public isdead() {
    return this.live < 1;
  }

  public justDead() {
    return this.currentTime > Player.relaxTime;
  }

  public loseLive() {
    if (this.currentTime < 0) {
      --this.live;
      if (this.level > 10) {
        this.level >>= 1;
      } else {
        this.level -= +(this.level > 0) + +(this.level > 2) + +(this.level > 5) + +(this.level > 8);
      }
      this.gunFormation = getPlayerGunFormation(this.level);
      Particle.createPartical(100, this.x, this.y, 6, "cyan");
      this.currentTime = Player.relaxTime + Player.respawnTime;
    }
  }
}
