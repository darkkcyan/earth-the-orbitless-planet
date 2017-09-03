import Boss, {IBossSkill, LineGuideDrawer, MoveToPosition} from "./Boss";
import ctx, {scrheight, scrwidth} from "./canvas";
import {IEnemyConfig} from "./Enemy";
import {addListener, Events} from "./EventListener";
import {dt, player} from "./game";
import {images, ImagesId} from "./imageLoader";
import Lazer from "./Lazer";
import {clamp, randRange} from "./math";
import Planet from "./Planet";
import {Circle} from "./shapes";

export default class FinalBoss extends Boss {
  protected planet: Planet;
  constructor(config: IEnemyConfig, skills: IBossSkill[], relaxTime = 1) {
    super(config, skills, relaxTime);
    this.planet = new Planet(config.image, Math.PI);
    this.collisionShape = new Circle(0, 0, this.planet.radius);
  }

  public [Events.process]() {
    const ret = super[Events.process]();
    this.planet[Events.process](dt);
    this.planet.x = this.x;
    this.planet.y = this.y;
    return ret;
  }

  public [Events.render + 2]() {
    this.planet[Events.render]();
  }

  protected updateCollisionShape() {
    this.collisionShape.x = this.x;
    this.collisionShape.y = this.y;
  }
}

export class LazerChase extends MoveToPosition {
  public static spreadRange = Math.PI / 3;
  public currentAngle: number;
  public laz: Lazer[] = [];
  public guide: LineGuideDrawer[] = [];
  constructor(
    public numLazer = 1,
    public chaseTime: number = 2,
    public angleSpeedRatio = 5,
    moveTime: number = 2,
  ) {
    super(moveTime);
  }

  public init(b: Boss) {
    super.init(b, randRange([scrwidth * 2 / 3, scrwidth]));
    this.laz = [];
    this.guide = [];
  }

  public process(b: Boss) {
    let rangeOffset = LazerChase.spreadRange / (this.numLazer - 1);
    if (this.numLazer === 1) {
      rangeOffset = 0;
    }

    if (this.currentTime < this.moveTime) {
      super.process(b);
      if (this.currentTime > this.moveTime) {
        this.currentAngle = Math.atan2(player.y - b.y, player.x - b.x);
        for (let i = this.numLazer; i--; ) {
          const ang = this.currentAngle - rangeOffset * ((this.numLazer - 1) / 2 - i);
          this.guide[i] = new LineGuideDrawer(b.x, b.y, ang);
        }
      }
    } else if (this.currentTime < this.moveTime + this.chaseTime) {
      this.currentTime += dt;
      let na = Math.atan2(player.y - b.y, player.x - b.x) - this.currentAngle;
      while (na > Math.PI) {
        na -= Math.PI * 2;
      }
      while (na < -Math.PI) {
        na += Math.PI * 2;
      }
      this.currentAngle += na * this.angleSpeedRatio * dt;
      for (let i = this.numLazer; i--; ) {
        const ang = this.currentAngle - rangeOffset * ((this.numLazer - 1) / 2 - i);
        this.guide[i].angle = ang;
        if (this.currentTime > this.moveTime + this.chaseTime) {
          this.laz[i] = Lazer.Respawner.get();
          this.laz[i].init({
            age: 3,
            radius: 20,
          }, b.x, b.y, ang);
          this.guide[i].remove = true;
        }
      }
    }
    if (this.laz.length && this.laz[0].isDead()) {
      return true;
    }
    return false;
  }
}
