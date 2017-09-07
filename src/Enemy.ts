import Bullet, {IBulletConfig} from "./Bullet";
import ctx, {scrwidth} from "./canvas";
import {addListener, emit, Events} from "./EventListener";
import {dt, increaseScore, player, shm} from "./game";
import {images, ImagesId} from "./imageLoader";
import {randRange} from "./math";
import ObjectRespawner from "./ObjectRespawner";
import Particle from "./Particle";
import {AllKindOfShapes, Rectangle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export interface IEnemyConfig {
  rewardScore: number;
  image: HTMLImageElement;
  hitImage?: HTMLImageElement;
  bulletConfig: IBulletConfig;
  live: number;
  fireTimeRange?: [number, number];
}

export default class Enemy implements ICollidable {
  public static Respawner = new ObjectRespawner(Enemy);
  [index: number]: (any?) => boolean | void;
  public static offsetAlpha = .05;
  public static maxNumberOfShadow = 5;
  public static captureTime = .075;

  public static fireTimeRange: [number, number] = [4, 8];
  public static fireTowardPlayerProbability = .3;

  public collisionShape: AllKindOfShapes;
  public tag: number = Tag.enemy;

  public x: number = 0;
  public y: number = 0;

  public config: IEnemyConfig;
  public live: number;

  protected canFire: boolean;
  protected hitCooltime: number = 0;

  private previousPos: number[][] = [];
  private captureTimeLeft: number;
  private fireTime: number;

  public init(config: IEnemyConfig) {
    this.x = this.y = scrwidth;  // avoid hitting player when just respawn
    this.config = config;
    this.previousPos = [];
    this.captureTimeLeft = 0;
    this.fireTime = randRange(Enemy.fireTimeRange);
    this.collisionShape = new Rectangle(
      0, 0,
      this.config.image.width * .9, this.config.image.height * .9,
    );
    this.live = config.live;
    this.hitCooltime = 0;
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 2]);
    return this;
  }

  public isdead() {
    return this.live <= 0;
  }

  public [Events.process]() {
    while (this.previousPos.length > Enemy.maxNumberOfShadow) {
      this.previousPos.shift();
    }
    this.captureTimeLeft -= dt;
    if (this.captureTimeLeft <= 0) {
      this.captureTimeLeft += Enemy.captureTime;
      this.previousPos.push([this.x, this.y]);
    }

    this.canFire = false;
    this.fireTime -= dt;
    if (this.fireTime <= 0) {
      this.fireTime += randRange(this.config.fireTimeRange || Enemy.fireTimeRange);
      this.canFire = true;
    }
    this.autoFire();

    this.updateCollisionShape();
    shm.insert(this);

    if (this.hitCooltime > 0) {
      --this.hitCooltime;
    }
    if (this.isdead()) {
      this.createParticle();
      this.free();

      increaseScore(this.config.rewardScore);
      emit(Events.enemyDead, this);
      return true;
    }
    return false;
  }

  public [Events.collisionCheck]() {
    for (const obj of shm.retrive(this)) {
      if (obj.tag === Tag.player_bullet || obj.tag === Tag.good_moon) {
        this.live -= (obj as Bullet).damage;
        obj.tag = Tag.no_tag;  // cannot do this from Bullet because if the bullet
                               // was proccesed first, then Enemy couldnot "see" the bullet.
        this.hitCooltime = 3;
      }
    }
    return this.isdead();
  }

  public [Events.render + 2]() {
    const w = this.config.image.width;
    const h = this.config.image.height;
    for (
      let i = 0, alpha = Enemy.offsetAlpha;
      i < this.previousPos.length - 1;
      ++i, alpha += Enemy.offsetAlpha
    ) {
      ctx.globalAlpha = alpha;
      const [x, y] = this.previousPos[i];
      ctx.drawImage(this.config.image, x - w / 2, y - h / 2);
    }
    ctx.globalAlpha = 1;
    const img = this.hitCooltime
      ? this.config.hitImage
        ? this.config.hitImage
        : images[ImagesId.UFOHit]
      : this.config.image
    ;
    ctx.drawImage(img, this.x - w / 2, this.y - h / 2);
    return this.isdead();
  }

  public fire(angle: number = Math.PI, offsetX = 0, offsetY = 0) {
    if (!this.canFire) {
      return ;
    }
    Bullet.Respawner.get().init(
      this.config.bulletConfig,
      this.x + offsetX, this.y + offsetY,
      angle,
    );
  }

  public createParticle() {
    Particle.createPartical(20, this.x, this.y, 3, "rgb(255, 27, 242)", 100);
  }

  protected free() {
    Enemy.Respawner.free(this);
  }

  protected autoFire() {
    const towardPlayer = Math.random() < Enemy.fireTowardPlayerProbability;
    let angle: number = Math.PI;
    if (towardPlayer)  {
      angle = Math.atan2(player.y - this.y, player.x - this.x);
    } else if (player.x > this.x) {
      angle = 0;
    }
    this.fire(angle);
  }

  protected updateCollisionShape() {
    this.collisionShape.x = this.x - (this.collisionShape as Rectangle).width / 2;
    this.collisionShape.y = this.y - (this.collisionShape as Rectangle).height / 2;
  }
}
