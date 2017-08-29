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
import {
  renderGunLv1,
  renderGunLv2,
  renderGunLv3,
} from "./prerender/gun";
import {renderPlanetSurface} from "./prerender/planet";
import {renderUFO} from "./prerender/UFO";
import {Circle, Rectangle} from "./shapes";
import SpatialHashMap, {ICollidable} from "./SpatialHashMap";
import formations, {UFOFormation} from "./UFOFormation";

// tslint:disable no-shadowed-variable
imageLoader
.add(0, 140, 70, (ctx) => renderPlanetSurface(earthsurfaceData, ctx))
.add(1, 60, 25, (ctx) => renderGunLv1(ctx, {size: 25, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(2, 60, 25, (ctx) => renderGunLv2(ctx, {size: 25, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(3, 60, 25, (ctx) => renderGunLv3(ctx, {size: 25, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(4, 60, 25, (ctx) => renderGunLv3(ctx, {size: 25, colorScheme: UFO_GUN_COLORSCHEME}))
.add(5, 100, 40, (ctx) => renderUFO(ctx, {color: "#F200ED", size: 40}))
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
  new formations[1]([...rep({
    bulletConfig: {
      color: "red",
      radius: 6,
      speed: 500,
    },
    image: images[5],
  }, 3)]);

  new formations[0]([...rep({
    bulletConfig: {
      color: "blue",
      radius: 6,
      speed: 500,
    },
    image: images[5],
  }, 10)]);
  gameloop();
});
