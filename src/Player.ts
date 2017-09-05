import ctx from "./canvas";
import {easeOutCubic} from "./ease";
import {addListener, Events} from "./EventListener";
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
import {
  HarmonicMotionPlayerGunFormation as GunFormation ,
} from "./PlayerGunFormation";
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

  [index: number]: (any) => boolean | void;

  private rocketGroup: RocketGroup;
  private gunFormation: GunFormation;
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
    this.gunFormation = new GunFormation({
      hm: new HarmonicMotion(HALF_PI / 3, 2),
      mainGun: new Gun({
        bulletConfig: {
          color: "red",
          isPlayerBullet: true,
          radius: 5,
          speed: 1200,
        },
        image: images[ImagesId.gunlv3],
        reloadTime: .2,
      }),
      planetRadius: this.planet.radius * 1.1,
      sideGunList: [new Gun({
        bulletConfig: {
          color: "yellow",
          damage: 10,
          isPlayerBullet: true,
          radius: 3,
          speed: 1000,
        },
        image: images[ImagesId.gunlv2],
        reloadTime: .2,
        rotate: true,
      }), new Gun({
        bulletConfig: {
          color: "blue",
          isPlayerBullet: true,
          radius: 4,
          speed: 1100,
        },
        image: images[ImagesId.gunlv1],
        reloadTime: .2,
      })],
      // sideGunList: [],
      sideGunPhaseOffset: Math.PI / 5,
    });
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 3]);
  }

  public [Events.process]() {
    if (this.currentTime > 0) {
      this.currentTime -= dt;
    }
    if (this.currentTime > Player.relaxTime) {
      return ;
    }
    if (this.followMouse) {
      [this.x, this.y] = getMousePos();
    }
    this.collisionShape.x = this.gunFormation.x = this.planet.x = this.x;
    this.rocketGroup.x = this.x - this.planet.radius - 10;
    this.collisionShape.y = this.gunFormation.y = this.rocketGroup.y = this.planet.y = this.y;
    this.planet[Events.process]();
    this.rocketGroup[Events.process]();
    this.gunFormation[Events.process]();
    shm.insert(this);
  }

  public [Events.collisionCheck]() {
    for (const obj of shm.retrive(this)) {
      if (this.currentTime < 0) {
        if (obj.tag === Tag.enemy || obj.tag === Tag.enemy_bullet) {
          this.loseLive();
        }
        if (obj.tag === Tag.enemy_bullet) {
          obj.tag = Tag.no_tag;
        }
      }
    }
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
  }

  public isRelax() {
    return this.currentTime > 0 && this.currentTime < Player.relaxTime;
  }

  public loseLive() {
    if (this.currentTime < 0) {
      --this.live;
      Particle.createPartical(100, this.x, this.y, 6, "cyan");
      this.currentTime = Player.relaxTime + Player.respawnTime;
    }
  }
}
