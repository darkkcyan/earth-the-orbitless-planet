import Boss from "./Boss";
import {IBulletConfig} from "./Bullet";
import {scrheight, scrwidth} from "./canvas";
import {IEnemyConfig} from "./Enemy";
import {
  // tslint:disable ordered-imports
  RandomPositionSPP,
  StraightForwardSPP,
  TowardPlayerSPP,

  PolygonEPP,
  PyramidEPP,
  StraightLineEPP,
  WallEPP,
  // tslint:enable ordered-imports
} from "./EnemyFormation";
import {IEnemyFormationConfig} from "./EnemyFormationManager";
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

const totalWaves = 9;
const UFOConfig: IEnemyConfig[] = [];
const UFOBulletConfig: IBulletConfig = {
  color: "#4B0082",
  radius: 6,
  speed: 500,
};
for (let i = -1; ++i < totalWaves; ) {
  UFOConfig[i] = {
    bulletConfig: UFOBulletConfig,
    fireTimeRange: [3, 8],
    image: images[ImagesId.UFO + i],
    live: i + 1,
    rewardScore: i * 100,
  };
}

function repFn<T>(n: number, fn: () => T) {
  const ans: T[] = [];
  while (n--) {
    ans.push(fn());
  }
  return ans;
}

function repVal<T>(n: number, v: T) {
  const ans: T[] = [];
  while (n--) {
    ans.push(v);
  }
  return ans;
}

function getSimilarUFOFormations(waveNum: number) {
  const t = [1, 1, 3, 3, 6, 6, 10, 10, 15];
  return ([] as IEnemyFormationConfig[]).concat(
    // appetizer
    repFn<IEnemyFormationConfig>(5 * (waveNum + 1), () => ({
      cost: ~~(100 / (waveNum + 1)),
      enemyConfigList: [UFOConfig[waveNum]],
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new RandomPositionSPP(),
    })),
    // big wall
    repFn<IEnemyFormationConfig>(3, () => ({
      enemyConfigList: repVal(7 * Math.min(waveNum + 1, 5), UFOConfig[waveNum]),
      enemyPositionProcess: new WallEPP(7),
      selfPositionProcessor: new RandomPositionSPP(),
    })),
    // random wheel
    repFn<IEnemyFormationConfig>(10, () => ({
      cost: 33,
      enemyConfigList: repVal(2 + waveNum, UFOConfig[waveNum]),
      enemyPositionProcess: new PolygonEPP(),
      selfPositionProcessor: new RandomPositionSPP(),
    })),
    // straight pyramid
    repFn<IEnemyFormationConfig>(10, () => ({
      cost: 50,
      enemyConfigList: repVal(t[waveNum], UFOConfig[waveNum]),
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new StraightForwardSPP(undefined, Math.PI),
    })),
    // zigzag
    repFn<IEnemyFormationConfig>(waveNum < 6 ? 1 : 3, () => ({
      enemyConfigList: repVal(10 + 5 * waveNum, UFOConfig[waveNum]),
      enemyPositionProcess: new StraightLineEPP(),
      selfPositionProcessor: new StraightForwardSPP(),
    })),
    // speed driller
    repFn<IEnemyFormationConfig>(waveNum * 2 + 2, () => ({
      cost: ~~(100 / (waveNum + 1)),
      enemyConfigList: [UFOConfig[waveNum]],
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new StraightForwardSPP(1000, undefined, false),
    })),
    // random
    repFn<IEnemyFormationConfig>(10 + 5 * waveNum, () => {
      let numUFO = 0;
      let epp;
      switch (Math.floor(Math.random() * 5)) {
        case 0:
          numUFO = 2;
          epp = new WallEPP(Math.floor(Math.random() * 2) * 3);
          break;
        case 1:
          numUFO = 4;
          epp = new WallEPP(2);
          break;
        case 2:
          numUFO = 3;
          epp = new PyramidEPP();
          break;
        case 3:
          numUFO = 3;
          epp = new WallEPP(Math.floor(Math.random() * 2) * 3);
          break;
        case 4:
          numUFO = 2;
          epp = new PolygonEPP();
          break;
      }
      return {
        cost: 20,
        enemyConfigList: repVal(numUFO, UFOConfig[waveNum]),
        enemyPositionProcess: epp,
        selfPositionProcessor: new RandomPositionSPP(),
      };
    }),
  );
}
