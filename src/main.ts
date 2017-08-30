import Bullet from "./Bullet";
import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {PLAYER_GUN_COLORSCHEME, UFO_GUN_COLORSCHEME} from "./colorschemes";
import EnemyUFO from "./EnemyUFO";
import {emit, Events, listeners} from "./EventListener";
import {gameloop, player, setPlayer} from "./game";
import Gun from "./Gun";
import imageLoader, {images} from "./imageLoader";
import {getMousePos} from "./mouse";
import Planet from "./Planet";
import {earthsurface as earthsurfaceData} from "./planet-surfaces-data";
import Player from "./Player";
import fillWhite from "./prerender/fillWhite";
import {
  renderGunLv1,
  renderGunLv2,
  renderGunLv3,
} from "./prerender/gun";
import {renderPlanetSurface} from "./prerender/planet";
import {renderUFO} from "./prerender/UFO";
import {Circle, Rectangle} from "./shapes";
import SpatialHashMap, {ICollidable} from "./SpatialHashMap";
import UFOFormation, {
  PolygonUPP,
  PyramidUPP,
  RandomPositionSPP,
  StraightForwardSPP,
  StraightLineUPP,
  TowardPlayerSPP,
  WallUPP,
} from "./UFOFormation";

// tslint:disable no-shadowed-variable
imageLoader
.add(0, 140, 70, (ctx) => renderPlanetSurface(earthsurfaceData, ctx))
.add(1, 60, 25, (ctx) => renderGunLv1(ctx, {size: 25, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(2, 60, 25, (ctx) => renderGunLv2(ctx, {size: 25, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(3, 60, 25, (ctx) => renderGunLv3(ctx, {size: 25, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(4, 60, 25, (ctx) => renderGunLv3(ctx, {size: 25, colorScheme: UFO_GUN_COLORSCHEME}))
.add(5, 100, 40, (ctx) => renderUFO(ctx, {color: "#F200ED", size: 40}))
.add(6, 100, 40, (ctx) => {
  renderUFO(ctx, {color: "black", size: 40});
  fillWhite();
})
.load(celm, () => {
  const [img, gunImg] = images;
  celm.width = scrwidth;
  celm.height = scrheight;
  // tslint:disable no-unused-expression
  // Its actually used expression, tslint does not recognize that
  setPlayer(new Player(new Planet({
    radius: img.height / 2,
    spinSpeed: img.height / 2,
    surfaceMap: img,
    tiltAngle: Math.PI / 6,
  })));
  const u = new EnemyUFO();
  function rep<T>(obj: T, n: number) {
    const ans: T[] = [];
    for (; n--; ) {
      ans.push(obj);
    }
    return ans;
  }
  const x = new UFOFormation(
    [...rep({
      bulletConfig: {
        color: "red",
        radius: 6,
        speed: 500,
      },
      image: images[5],
      live: 10,
    }, 10)],
    new RandomPositionSPP(),
    new PyramidUPP(),
  );

  gameloop();
});
