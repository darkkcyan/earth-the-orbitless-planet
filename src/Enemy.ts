import Bullet, {IBulletConfig} from "./Bullet";
import ctx, {scrwidth} from "./canvas";
import {addListener, emit, Events} from "./EventListener";
import {dt, increaseScore, player, shm} from "./game";
import {images, ImagesId} from "./imageLoader";
import {randRange} from "./math";
// import ObjectRespawner from "./ObjectRespawner";
import Particle from "./Particle";
import {AllKindOfShapes, Rectangle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export interface IEnemyConfig {
  rewardScore: number;
  imageId: number;
  hitImageId?: number;
  bulletConfig: IBulletConfig;
  live: number;
  fireTimeRange?: [number, number];
}

const offsetAlpha = .05;
const maxNumberOfShadow = 5;
const captureTime = .075;
const fireTimeRange: [number, number] = [4, 8];
export default class Enemy implements ICollidable {
  [index: number]: (any?) => boolean | void;
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
    this.fireTime = randRange([0, (this.config.fireTimeRange || fireTimeRange)[1]]);
    const i = images[config.imageId];
    this.collisionShape = new Rectangle(0, 0, i.width * .9, i.height * .9);
    this.live = config.live;
    this.hitCooltime = 0;
    addListener(this, [Events.process, Events.collisionCheck, Events.render + 2]);
    return this;
  }

  public isdead() {
    return this.live <= 0;
  }

  public [Events.process]() {
    while (this.previousPos.length > maxNumberOfShadow) {
      this.previousPos.shift();
    }
    this.captureTimeLeft -= dt;
    if (this.captureTimeLeft <= 0) {
      this.captureTimeLeft += captureTime;
      this.previousPos.push([this.x, this.y]);
    }

    this.canFire = false;
    this.fireTime -= dt;
    if (this.fireTime <= 0) {
      this.fireTime += randRange(this.config.fireTimeRange || fireTimeRange);
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
        if (this.isdead()) {
          increaseScore(this.config.rewardScore);
        }
        this.hitCooltime = 3;
      }
    }
    return this.isdead();
  }

  public [Events.render + 2]() {
    const img = images[this.config.imageId];
    const w = img.width;
    const h = img.height;
    for (
      let i = 0, alpha = offsetAlpha;
      i < this.previousPos.length - 1;
      ++i, alpha += offsetAlpha
    ) {
      ctx.globalAlpha = alpha;
      const [x, y] = this.previousPos[i];
      ctx.drawImage(img, x - w / 2, y - h / 2);
    }
    ctx.globalAlpha = 1;
    const hitimg = images[this.hitCooltime
      ? this.config.hitImageId ? this.config.hitImageId : ImagesId.UFOHit
      : this.config.imageId
    ];
    ctx.drawImage(hitimg, this.x - w / 2, this.y - h / 2);
    return this.isdead();
  }

  public fire(angle: number = Math.PI, offsetX = 0, offsetY = 0) {
    if (this.canFire) {
      new Bullet().init(
        this.config.bulletConfig,
        this.x + offsetX, this.y + offsetY,
        angle,
      );
    }
  }

  public createParticle() {
    Particle.createPartical(20, this.x, this.y, 3, "fuchsia", 100);
  }

  protected autoFire() {
    const towardPlayer = Math.random() < Enemy.fireTowardPlayerProbability;
    let angle: number = Math.PI;
    if (towardPlayer && player.x < this.x) {
      angle = Math.atan2(player.y - this.y, player.x - this.x);
    }
    this.fire(angle);
  }

  protected updateCollisionShape() {
    this.collisionShape.x = this.x - (this.collisionShape as Rectangle).width / 2;
    this.collisionShape.y = this.y - (this.collisionShape as Rectangle).height / 2;
  }
}
