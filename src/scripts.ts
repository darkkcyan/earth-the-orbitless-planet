import Boss from "./Boss";
import {scrheight, scrwidth} from "./canvas";
import {addListener, emit, Events} from "./EventListener";
import {dt} from "./game";
import {images, ImagesId} from "./imageLoader";
import {planetSurfaceScale} from "./loadImages";
import {clamp} from "./math";
import Planet from "./Planet";

interface IScriptWave {
  callEnemyFormationManager();
  callBoss();
}

export const scripts: IScriptWave[] = [];

const scriptController = {
  currentWave: 0,
  startWave(wave: number) {
    Boss.activeBosses.length = 0;
    if (wave >= scripts.length) {
      emit(Events.victory);
      return;
    }
    emit(Events.startScroll);
    this.currentWave = wave;
    scripts[wave].callEnemyFormationManager();
  },
  [Events.enemyFormationManagerFinish]() {
    // tslint:disable no-unused-expression
    if (this.currentWave !== 5) {
      const imgId = ImagesId.first_planet_surface + this.currentWave + +(this.currentWave >= 4);
      new BackgroundPlanet(
        imgId,
        Math.PI * +(imgId === ImagesId.sunSurface),
        (imgId === ImagesId.jupiterSurface),
      );
    }
    setTimeout(() => {
      emit(Events.stopScroll);
      scripts[this.currentWave].callBoss();
    }, 5000);
  },
  [Events.bossDefeated]() {
    this.startWave(++this.currentWave);
  },
};

addListener(scriptController, [Events.enemyFormationManagerFinish, Events.bossDefeated]);

export default scriptController;

class BackgroundPlanet extends Planet {
  [index: number]: (any?) => boolean | void;
  public static scrollSpeed = 150;
  public speed = BackgroundPlanet.scrollSpeed;
  public accelerate = 0;
  constructor(
    surfaceMapId: number,
    lightSourceAngle: number = 0,
    hasRing: boolean,
  ) {
    super(
      images[surfaceMapId],
      lightSourceAngle,
      images[surfaceMapId].height / 2 * planetSurfaceScale[surfaceMapId],
      hasRing,
    );
    addListener(this, [Events.startScroll, Events.stopScroll, Events.process, Events.render]);
    this.x = scrwidth + this.radius * 2;
    this.y = scrheight / 2;
  }

  public [Events.stopScroll]() {
    this.accelerate = -BackgroundPlanet.scrollSpeed * .5;
    return this.x < -this.radius;
  }
  public [Events.startScroll]() {
    this.accelerate = BackgroundPlanet.scrollSpeed * .5;
    return this.x < -this.radius;
  }

  public [Events.process]() {
    super[Events.process]();
    this.speed = clamp(this.speed + this.accelerate * dt, 0, BackgroundPlanet.scrollSpeed);
    this.x -= this.speed * dt;
    return this.x < -this.radius;
  }

  public [Events.render]() {
    super[Events.render]();
    return this.x < -this.radius;
  }
}
