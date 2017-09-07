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
import scriptController from "./scripts";
import StarField from "./StarField";
import "./UI";

// tslint:disable no-shadowed-variable
onload(() => {
  // tslint:disable no-unused-expression
  // Its actually used expression, tslint does not recognize that
  new StarField(100, 90);
  new StarField(100, 100);
  new StarField(100, 110);

  celm.width = scrwidth;
  celm.height = scrheight;
  const p = new Player();
  setPlayer(p);
  addListener({
    [Events.victory]() {
      // alert("VICTORY");
    },
  }, [Events.victory]);
  scriptController.startStage(0);

  gameloop();
});
