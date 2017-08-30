import Bullet, {IBulletConfig} from "./Bullet";
import ctx from "./canvas";
import {addListener, Events} from "./EventListener";
import {dt, player, shm} from "./game";
import {images} from "./imageLoader";
import {randRange} from "./math";
import ObjectRespawner from "./ObjectRespawner";
import {Rectangle} from "./shapes";
import {ICollidable, Tag} from "./SpatialHashMap";

export interface IEnemyUFOConfig {
  image: HTMLImageElement;
  bulletConfig: IBulletConfig;
}

export default class EnemyUFO implements ICollidable {
  public static Respawner = new ObjectRespawner(EnemyUFO);
  [index: number]: (any) => boolean | void;
  public static offsetAlpha = .05;
  public static maxNumberOfShadow = 5;
  public static captureTime = .075;

  public static fireTimeRange: [number, number] = [1, 2];
  public static fireTowardPlayerProbability = .3;

  public collisionShape: Rectangle;
  public tag: number = Tag.enemy;

  public x: number = 0;
  public y: number = 0;

  private config: IEnemyUFOConfig;
  private previousPos: number[][] = [];
  private captureTimeLeft: number;
  private fireTime: number;
  private gotHit: boolean;

  public init(config: IEnemyUFOConfig) {
    this.config = config;
    this.previousPos = [];
    this.captureTimeLeft = 0;
    this.fireTime = randRange(EnemyUFO.fireTimeRange);
    this.collisionShape = new Rectangle(
      0, 0,
      this.config.image.width * .9, this.config.image.height * .9,
    );
    addListener(this, [Events.process, Events.collisionCheck, Events.render]);
    return this;
  }

  public [Events.process]() {
    while (this.previousPos.length > EnemyUFO.maxNumberOfShadow) {
      this.previousPos.shift();
    }
    this.captureTimeLeft -= dt;
    if (this.captureTimeLeft <= 0) {
      this.captureTimeLeft += EnemyUFO.captureTime;
      this.previousPos.push([this.x, this.y]);
    }

    this.fireTime -= dt;
    if (this.fireTime <= 0) {
      this.fireTime += randRange(EnemyUFO.fireTimeRange);
      const towardPlayer = Math.random() < EnemyUFO.fireTowardPlayerProbability;
      let angle: number = Math.PI;
      if (towardPlayer)  {
        angle = Math.atan2(player.y - this.y, player.x - this.x);
      } else if (player.x > this.x) {
        angle = 0;
      }
      Bullet.Respawner.get().init(
        this.config.bulletConfig,
        this.x, this.y,
        angle,
      );
    }

    this.collisionShape.x = this.x - this.collisionShape.width / 2;
    this.collisionShape.y = this.y - this.collisionShape.height / 2;
    shm.insert(this);

    this.gotHit = false;
  }

  public [Events.collisionCheck]() {
    for (const obj of shm.retrive(this)) {
      if (obj.tag === Tag.player_bullet) {
        // TODO: decrease health
        this.gotHit = true;
      }
    }
  }

  public [Events.render]() {
    const w = this.config.image.width;
    const h = this.config.image.height;
    for (
      let i = 0, alpha = EnemyUFO.offsetAlpha;
      i < this.previousPos.length - 1;
      ++i, alpha += EnemyUFO.offsetAlpha
    ) {
      ctx.globalAlpha = alpha;
      const [x, y] = this.previousPos[i];
      ctx.drawImage(this.config.image, x - w / 2, y - h / 2);
    }
    ctx.globalAlpha = 1;
    const img = this.gotHit ? images[6] : this.config.image;
    ctx.drawImage(img, this.x - w / 2, this.y - h / 2);
  }
}
