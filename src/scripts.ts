import Boss, {
  AimPlayerBullerDrop,
  AimPlayerMultipleBullet,
  RandomBulletDrop,
  RandomBulletSpread,
  SumonFormation,
} from "./Boss";
import {IBulletConfig} from "./Bullet";
import {scrheight, scrwidth} from "./canvas";
import {IEnemyConfig} from "./Enemy";
import EnemyFormation, {
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
import EnemyFormationManager, {IEnemyFormationConfig} from "./EnemyFormationManager";
import {addListener, emit, Events} from "./EventListener";
import FinalBoss, {LazerChase, LazerScan, RadialLazerScan, SumonMoon} from "./FinalBoss";
import {dt} from "./game";
import {images, ImagesId} from "./imageLoader";
import {planetSurfaceScale} from "./loadImages";
import {clamp} from "./math";
import Planet from "./Planet";

const totalStages = 9;

const scriptController = {
  currentStage: 0,
  startStage(stage: number) {
    Boss.activeBosses.length = 0;
    if (stage >= totalStages) {
      emit(Events.victory);
      return;
    }
    emit(Events.startScroll);
    this.currentStage = stage;
    // tslint:disable no-unused-expression
    new EnemyFormationManager(getUFOFormationConfig(this.currentStage), 1000);
  },
  [Events.enemyFormationManagerFinish]() {
    // tslint:disable no-unused-expression
    if (this.currentStage !== 5) {
      const imgId = ImagesId.first_planet_surface + this.currentStage + +(this.currentStage >= 4);
      new BackgroundPlanet(
        imgId,
        Math.PI * +(imgId === ImagesId.sunSurface),
        (imgId === ImagesId.jupiterSurface),
      );
    }
    setTimeout(() => {
      emit(Events.stopScroll);
      callBoss[this.currentStage]();
    }, 5000);
  },
  [Events.bossDefeated]() {
    this.startStage(++this.currentStage);
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

const UFOConfig: IEnemyConfig[] = [];
const UFOBulletConfig: IBulletConfig = {
  color: "fuchsia",
  radius: 6,
  speed: 500,
};

for (let i = -1; ++i < totalStages; ) {
  UFOConfig[i] = {
    bulletConfig: UFOBulletConfig,
    fireTimeRange: [3, 8],
    imageId: ImagesId.UFO + i,
    live: i + 1,
    rewardScore: (i + 1) * 100,
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

function getUFOFormationConfig(stageNum: number) {
  const t = [1, 1, 3, 3, 6, 6, 10, 10, 15];
  const UFOCon = UFOConfig[stageNum];
  return ([] as IEnemyFormationConfig[]).concat(
    // appetizer
    repFn<IEnemyFormationConfig>(5 * (stageNum + 1), () => ({
      cost: Math.floor(100 / (stageNum + 1)),
      enemyConfigList: [UFOCon],
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new RandomPositionSPP(),
    })),
    // big wall
    repFn<IEnemyFormationConfig>(3, () => ({
      enemyConfigList: repVal(7 * Math.min(stageNum + 1, 5), UFOCon),
      enemyPositionProcess: new WallEPP(7),
      selfPositionProcessor: new RandomPositionSPP(),
    })),
    // random wheel
    repFn<IEnemyFormationConfig>(10, () => ({
      cost: 33,
      enemyConfigList: repVal(2 + stageNum, UFOCon),
      enemyPositionProcess: new PolygonEPP(),
      selfPositionProcessor: new RandomPositionSPP(),
    })),
    // straight pyramid
    repFn<IEnemyFormationConfig>(10, () => ({
      cost: 50,
      enemyConfigList: repVal(t[stageNum], UFOCon),
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new StraightForwardSPP(undefined, Math.PI),
    })),
    // zigzag
    repFn<IEnemyFormationConfig>(stageNum < 6 ? 1 : 3, () => ({
      enemyConfigList: repVal(10 + 5 * stageNum, UFOCon),
      enemyPositionProcess: new StraightLineEPP(),
      selfPositionProcessor: new StraightForwardSPP(),
    })),
    // speed driller
    repFn<IEnemyFormationConfig>(stageNum * 2 + 2, () => ({
      cost: Math.floor(100 / (stageNum + 1)),
      enemyConfigList: [UFOCon],
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new StraightForwardSPP(1000, undefined, false),
    })),
    // random
    repFn<IEnemyFormationConfig>(10 + 5 * stageNum, () => {
      let numUFO = 0;
      let epp;
      switch (Math.floor(Math.random() * 5)) {
        case 0:
          numUFO = 2;
          epp = new WallEPP(Math.round(Math.random()) + 1);
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
          epp = new WallEPP(Math.round(Math.random()) * 2 + 1);
          break;
        case 4:
          numUFO = 2;
          epp = new PolygonEPP();
          break;
      }
      return {
        cost: 20,
        enemyConfigList: repVal(numUFO, UFOCon),
        enemyPositionProcess: epp,
        selfPositionProcessor: new RandomPositionSPP(),
      };
    }),
  );
}

function getBossConfig(stageNum: number, rewardScore: number, live: number): IEnemyConfig {
  return {
    bulletConfig: {
      color: "lime",
      radius: 10,
      speed: 700,
    },
    fireTimeRange: [.1, .2],
    hitImageId: ImagesId.BigHFOHit,
    imageId: ImagesId.BigUFO + stageNum,
    live,
    rewardScore,
  };
}
const callBoss: Array<() => void>  = [
  () => {
    new Boss(getBossConfig(0, 10000, 300), [
      new RandomBulletDrop(),
    ]);
  },
  () => {
    new Boss(getBossConfig(1, 12000, 400), [
      new RandomBulletDrop(),
      new RandomBulletSpread(5),
      new SumonFormation(() => repFn(3, () => new EnemyFormation(
        [UFOConfig[1]],
        new RandomPositionSPP(),
        new PyramidEPP(),
      ))),
    ]);
  },
  () => {
    for (let i = 2; i--; ) {
      new Boss(getBossConfig(2, 7000, 250), [
        new RandomBulletDrop(),
        new RandomBulletSpread(3),
      ]);
    }
  },
  () => {
    new Boss(getBossConfig(3, 12000, 600), [
      new RandomBulletDrop(),
      new AimPlayerMultipleBullet(),
      new SumonFormation(() => repFn(2, () => new EnemyFormation(
        repVal(3, UFOConfig[3]),
        new RandomPositionSPP(),
        new PyramidEPP(),
      ))),
    ]);
  },
  () => {
    for (let i = 2; i--; ) {
      new Boss(getBossConfig(4, 9000, 700), [
        new AimPlayerMultipleBullet(),
        new SumonFormation(() => [new EnemyFormation(
            repVal(4, UFOConfig[4]),
            new RandomPositionSPP(),
            new PolygonEPP(),
          )],
        ),
      ]);
    }
  },
  () => {
    const c = getBossConfig(5, 20000, 800);
    c.imageId = ImagesId.alienPlanetSurface;
    const b = new FinalBoss(c, [
      new LazerChase(),
      new LazerScan(1),
      new RadialLazerScan(),
    ]);
    addListener({
      [Events.bossDefeated]() {
        addListener(this, [Events.render + 2]);
        return true;
      },
      [Events.render + 2]() {
        b.x += 100 * dt;
        b[Events.render + 2]();
        return b.x > scrheight + b.planet.radius;
      },
    }, [Events.bossDefeated]);
  },
  () => {
    new Boss(getBossConfig(6, 20000, 900), [
      new AimPlayerBullerDrop(),
      new RandomBulletSpread(5),
      new SumonFormation(() => [new EnemyFormation(
        repVal(5, UFOConfig[6]),
        new RandomPositionSPP(),
        new PolygonEPP(),
      )]),
    ]);
  },
  () => {
    new Boss(getBossConfig(7, 21000, 1000), [
      new AimPlayerBullerDrop(),
      new AimPlayerMultipleBullet(),
      new RandomBulletSpread(),
      new SumonFormation(() => [new EnemyFormation(
        repVal(5, UFOConfig[6]),
        new RandomPositionSPP(),
        new PolygonEPP(),
      )]),
    ]);
  },
  () => {
    const c = getBossConfig(8, 25000, 1500);
    c.imageId = ImagesId.alienPlanetSurface;
    new FinalBoss(c, [
      new LazerChase(3),
      new LazerScan(1),
      new LazerScan(2, 3),
      new RadialLazerScan(1),
      new RadialLazerScan(3),
    ]);
  },
];
