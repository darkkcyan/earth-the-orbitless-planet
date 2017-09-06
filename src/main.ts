import * as dat from "dat-gui";
import Boss, {
  AimPlayerBullerDrop,
  AimPlayerMultipleBullet,
  RandomBulletDrop,
  RandomBulletSpread,
  SumonFormation,
} from "./Boss";
import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {IEnemyConfig} from "./Enemy";
import EnemyFormation, {
  PolygonEPP,
  PyramidEPP,
  RandomPositionSPP,
  StraightForwardSPP,
  StraightLineEPP,
  TowardPlayerSPP,
  WallEPP,
} from "./EnemyFormation";
import EFM, {IEnemyFormationConfig as IEFC} from "./EnemyFormationManager";
import {addListener, emit, Events} from "./EventListener";
import FinalBoss, {LazerChase, LazerScan, RadialLazerScan, SumonMoon} from "./FinalBoss";
import {gameloop, setPlayer} from "./game";
import {images, ImagesId, onload} from "./imageLoader";
import "./loadImages";
import Moon, {MoonState} from "./Moon";
import Planet from "./Planet";
import Player from "./Player";
import "./PowerUp";
import scriptController, {scripts} from "./scripts";
import StarField from "./StarField";
import "./UI";

// tslint:disable no-shadowed-variable
onload(() => {
  // tslint:disable no-unused-expression
  // Its actually used expression, tslint does not recognize that
  new StarField(100, 50);
  new StarField(100, 65);
  new StarField(100, 80);

  celm.width = scrwidth;
  celm.height = scrheight;
  const p = new Player();
  setPlayer(p);
  function rep<T>(n: number, fn: () => T) {
    const ans: T[] = [];
    while (n--) {
      ans.push(fn());
    }
    return ans;
  }
  const u: IEnemyConfig = {
    bulletConfig: {
      color: "red",
      radius: 6,
      speed: 500,
    },
    hitImage: images[ImagesId.UFOHit],
    image: images[ImagesId.UFO],
    live: 8,
    rewardScore: 100,
  };

  scripts.push({
    callEnemyFormationManager() {
      new EFM(([] as IEFC[]).concat(rep(3, () => ({
        cost: 50,
        enemyConfigList: rep(8, () => u),
        enemyPositionProcess: new RandomPositionSPP(),
        selfPositionProcessor: new PolygonEPP(),
      }))));
    },
    callBoss() {
      new Boss({
        bulletConfig: {
          color: "red",
          radius: 10,
          speed: 600,
        },
        fireTimeRange: [.1, .2],
        hitImage: images[ImagesId.BigHFOHit],
        image: images[ImagesId.BigUFO],
        live: 100,
        rewardScore: 1000000,
      }, [
        new AimPlayerBullerDrop(),
        new RandomBulletSpread(),
      ]);
    },
  });
  addListener({
    [Events.victory]() {
      alert("VICTORY");
    },
  }, [Events.victory]);
  scriptController.startWave(0);
  // new EnemyFormation(
  //   u,
  //   new RandomPositionSPP(),
  //   new PolygonEPP(),
  // );
  // new EnemyFormation(
  //   u,
  //   new RandomPositionSPP(),
  //   new PolygonEPP(),
  // );
  // new EnemyFormation(
  //   u,
  //   new RandomPositionSPP(),
  //   new PolygonEPP(),
  // );

  gameloop();
});
