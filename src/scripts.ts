import Boss, {
  AimPlayerBullerDrop,
  AimPlayerMultipleBullet,
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

  PolygonEPP,
  PyramidEPP,
  StraightLineEPP,
  WallEPP,
  // tslint:enable ordered-imports
} from "./EnemyFormation";
import EnemyFormationManager, {IEnemyFormationConfig} from "./EnemyFormationManager";
import {addListener, emit, Events} from "./EventListener";
import FinalBoss, {LazerChase, LazerScan, RadialLazerScan} from "./FinalBoss";
import {dt, ISavedData, player, resetScore, storageName} from "./game";
import {images, ImagesId} from "./imageLoader";
import {planetSurfaceScale} from "./loadImages";
import {clamp} from "./math";
import Planet from "./Planet";

export const totalStages = 9;

const scriptController = {
  currentStage: 0,
  startStage(stage: number) {
    Boss.activeBosses.length = 0;
    if (stage >= totalStages) {
      setTimeout(() => emit(Events.victory), 2000);
      return;
    }
    emit(Events.startScroll);
    this.currentStage = stage;
    // tslint:disable no-unused-expression
    new EnemyFormationManager(
      getUFOFormationConfig(this.currentStage),
      this.currentStage < 3 ? 300 : 1000,
    );
    const ld = JSON.parse(localStorage.getItem(storageName)) as ISavedData;
    if (this.currentStage === 0) {
      ld.lastGunLevel = ld.lastStage = null;
    } else {
      ld.lastGunLevel = player.level;
      ld.lastStage = this.currentStage;
    }
    localStorage.setItem(storageName, JSON.stringify(ld));
  },
  [Events.enemyFormationManagerFinish]() {
    // tslint:disable no-unused-expression
    if (this.currentStage !== 5) {
      const imgId = ImagesId.first_planet_surface + this.currentStage - +(this.currentStage > 5);
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
    this.x = Math.max(scrwidth + this.radius * 2, 1.25 * scrwidth);
    this.y = scrheight / 2;
  }

  public [Events.stopScroll]() {
    this.accelerate = -BackgroundPlanet.scrollSpeed * .5;
    return this.x < -scrwidth;
  }
  public [Events.startScroll]() {
    this.accelerate = BackgroundPlanet.scrollSpeed * .5;
    return this.x < -scrwidth;
  }

  public [Events.process]() {
    super[Events.process]();
    this.speed = clamp(this.speed + this.accelerate * dt, 0, BackgroundPlanet.scrollSpeed);
    this.x -= this.speed * dt;
    return this.x < -scrwidth;
  }

  public [Events.render]() {
    super[Events.render]();
    return this.x < -scrwidth;
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
  const t1 = [1, 1, 3, 3, 6, 6, 10, 10, 15];
  const t2 = [1, 1, 2, 2, 2, 2, 3, 3, 4];
  const UFOCon = UFOConfig[stageNum];
  return ([] as IEnemyFormationConfig[]).concat(
    // appetizer
    repFn<IEnemyFormationConfig>(5 * (stageNum + 1), () => ({
      cost: Math.floor(100 / (stageNum + 2)),
      enemyConfigList: [UFOCon],
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new RandomPositionSPP(2),
    })),
    // big wall
    repFn<IEnemyFormationConfig>(stageNum < 3 ? 5 : 3, () => ({
      cost: stageNum < 3 ? 50 : 100,
      enemyConfigList: repVal(9 * Math.min(stageNum + 1, 5), UFOCon),
      enemyPositionProcess: new WallEPP(9, 80),
      selfPositionProcessor: new RandomPositionSPP(2, 0),
    })),
    // random wheel
    repFn<IEnemyFormationConfig>(20, () => ({
      cost: stageNum < 6 ? 25 : 33,
      enemyConfigList: repVal(2 + stageNum, UFOCon),
      enemyPositionProcess: new PolygonEPP(),
      selfPositionProcessor: new RandomPositionSPP(),
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
        cost: stageNum < 6 ? 20 : 14,
        enemyConfigList: repVal(numUFO, UFOCon),
        enemyPositionProcess: epp,
        selfPositionProcessor: new RandomPositionSPP(),
      };
    }),
    // straight pyramid/square/line
    repFn<IEnemyFormationConfig>(15, () => {
      let numEnemy: number;
      let epp: PyramidEPP | WallEPP;
      const p = Math.random();
      if (p < .33) {
        numEnemy = t1[stageNum];
        epp = new PyramidEPP();
      } else if (p < .66) {
        numEnemy = t2[stageNum] * t2[stageNum];
        epp = new WallEPP(t2[stageNum]);
      } else {
        numEnemy = Math.floor(stageNum * 1.25) + 2;
        epp = new StraightLineEPP();
      }
      return {
        cost: 50,
        enemyConfigList: repVal(numEnemy, UFOCon),
        enemyPositionProcess: epp,
        selfPositionProcessor: new StraightForwardSPP(500, Math.PI),
      };
    }),
    // zigzag
    repFn<IEnemyFormationConfig>(2, () => ({
      enemyConfigList: repVal(10 + 3 * stageNum, UFOCon),
      enemyPositionProcess: new StraightLineEPP(),
      selfPositionProcessor: new StraightForwardSPP(400 + stageNum * 30),
    })),
    // speed driller
    repFn<IEnemyFormationConfig>(stageNum + 2, () => ({
      cost: Math.floor(100 / Math.min(stageNum + 1, 3)),
      enemyConfigList: repVal(5, UFOCon),
      enemyPositionProcess: new StraightLineEPP(),
      selfPositionProcessor: new StraightForwardSPP(700, undefined, false),
    })),
    // dessert
    repFn<IEnemyFormationConfig>(5 * (stageNum + 1), () => ({
      cost: Math.floor(100 / (stageNum + 2)),
      enemyConfigList: [UFOCon],
      enemyPositionProcess: new PyramidEPP(),
      selfPositionProcessor: new RandomPositionSPP(2),
    })),
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
    new Boss(getBossConfig(0, 10000, 150), [
      new RandomBulletSpread(1, .5, 2),
      new SumonFormation(() => repFn(3, () => new EnemyFormation(
        [UFOConfig[0]],
        new RandomPositionSPP(),
        new PyramidEPP(),
        0,
      )), 5),
    ]);
  },
  () => {
    new Boss(getBossConfig(1, 12000, 300), [
      new RandomBulletSpread(1, .5, 2),
      new RandomBulletSpread(5),
      new SumonFormation(() => repFn(3, () => new EnemyFormation(
        [UFOConfig[1]],
        new RandomPositionSPP(),
        new PyramidEPP(),
        0,
      )), 2),
    ]);
  },
  () => {
    for (let i = 2; i--; ) {
      new Boss(getBossConfig(2, 7000, 250), [
        new RandomBulletSpread(1, .5, 2),
        new RandomBulletSpread(3),
      ]);
    }
  },
  () => {
    new Boss(getBossConfig(3, 12000, 600), [
      new RandomBulletSpread(1, .5, 2),
      new AimPlayerMultipleBullet(),
      new SumonFormation(() => repFn(2, () => new EnemyFormation(
        repVal(3, UFOConfig[3]),
        new RandomPositionSPP(),
        new PyramidEPP(),
        0,
      )), 2),
    ]);
  },
  () => {
    for (let i = 3; i--; ) {
      new Boss(getBossConfig(4, 9000, 233), [
        new RandomBulletSpread(1, .5, 2),
        new RandomBulletSpread(2),
        new SumonFormation(() => [new EnemyFormation(
            repVal(4, UFOConfig[4]),
            new RandomPositionSPP(),
            new PolygonEPP(),
            0,
          )], 2,
        ),
      ]);
    }
  },
  () => {
    const c = getBossConfig(5, 20000, 900);
    c.imageId = ImagesId.alienPlanetSurfaceWithShield;
    const b = new FinalBoss(c, [
      new LazerChase(1),
      new LazerScan(1, 2),
      new RadialLazerScan(1),
    ]);
    addListener({
      [Events.bossDefeated]() {
        addListener(this, [Events.render + 2]);
        return true;
      },
      [Events.render + 2]() {
        b.planet.x += 150 * dt;
        b.planet[Events.render]();
        return b.planet.x > scrwidth + b.planet.radius;
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
        0,
      )], 2),
    ]);
  },
  () => {
    new Boss(getBossConfig(7, 21000, 1000), [
      new AimPlayerBullerDrop(),
      new AimPlayerMultipleBullet(),
      new RandomBulletSpread(5),
      new SumonFormation(() => [new EnemyFormation(
        repVal(5, UFOConfig[7]),
        new RandomPositionSPP(),
        new PolygonEPP(),
        0,
      )], 2),
    ]);
  },
  () => {
    const c = getBossConfig(8, 25000, 2000);
    c.imageId = ImagesId.alienPlanetSurfaceWithShield;
    new FinalBoss(c, [
      new LazerChase(3),
      new LazerScan(1),
      new LazerScan(2, 3),
      new RadialLazerScan(3, 1),
    ]);
  },
];
