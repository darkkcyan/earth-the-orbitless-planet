import Bullet from "./Bullet";
import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {PLAYER_GUN_COLORSCHEME, UFO_GUN_COLORSCHEME} from "./colorschemes";
import EnemyUFO from "./EnemyUFO";
import {emit, Events} from "./EventListener";
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

// tslint:disable no-shadowed-variable
imageLoader
.add(0, 300, 150, (ctx) => renderPlanetSurface(earthsurfaceData, ctx))
.add(1, 70, 30, (ctx) => renderGunLv1(ctx, {size: 30, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(2, 70, 30, (ctx) => renderGunLv2(ctx, {size: 30, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(3, 70, 30, (ctx) => renderGunLv3(ctx, {size: 30, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(4, 60, 25, (ctx) => renderGunLv3(ctx, {size: 25, colorScheme: UFO_GUN_COLORSCHEME}))
.add(5, 100, 40, (ctx) => renderUFO(ctx, {color: "#F200ED", size: 40}))
.load(celm, () => {
  const [img, gunImg] = images;
  celm.width = scrwidth;
  celm.height = scrheight;
  // tslint:disable no-unused-expression
  // Its actually used expression, tslint does not recognize that
  new Player(new Planet({
    radius: img.height / 2,
    spinSpeed: img.height / 2,
    surfaceMap: img,
    tiltAngle: Math.PI / 6,
  }));
  // const g = new Gun(images[4], true);
  // g.angle = Math.PI / 2;
  // const u = new EnemyUFO({
  //   gun: g,
  //   image: images[5],
  // });
  new Bullet().init({
    color: "teal",
    radius: 10,
    speed: 1200,
  }, 50, 50, 0);
  function loop() {
    celm.width ^= 0;
    emit(Events.process, 1 / 60);
    emit(Events.render, ctx);
    requestAnimationFrame(loop);
  }
  loop();
});
