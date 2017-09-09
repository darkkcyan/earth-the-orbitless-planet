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
import {gameloop, ISavedData, ISessionData, newPlayer, storageName} from "./game";
import {images, ImagesId, onload} from "./imageLoader";
import "./loadImages";
import Moon, {MoonState} from "./Moon";
import Planet from "./Planet";
import Player from "./Player";
import "./PowerUp";
import PowerUp from "./PowerUp";
import scriptController from "./scripts";
import StarField from "./StarField";
import "./UI";

// tslint:disable no-shadowed-variable
onload(() => {
  localStorage.setItem(storageName, JSON.stringify({
    highscore: 0,
    lastLive: 100,
  } as ISavedData));
  // sessionStorage.setItem(storageName, JSON.stringify({
  //   isLose: true,
  //   lastScore: 100,
  // } as ISessionData));
  // tslint:disable no-unused-expression
  // Its actually used expression, tslint does not recognize that
  new StarField(100, 90);
  new StarField(100, 100);
  new StarField(100, 110);

  celm.width = scrwidth;
  celm.height = scrheight;
  emit(Events.startScroll);
  // newPlayer();
  // addListener({
  //   [Events.victory]() {
  //     // alert("VICTORY");
  //   },
  //   [Events.playerdead]() {
  //     alert("ur dead");
  //   },
  // }, [Events.victory, Events.playerdead]);

  // for (let i = 20; i-- ;) {
  //   new PowerUp(scrwidth, scrheight / 2);
  // }
  // scriptController.startStage(5);

  gameloop();
});
