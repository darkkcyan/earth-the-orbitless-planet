import {PLAYER_GUN_COLORSCHEME, UFO_GUN_COLORSCHEME} from "./colorschemes";
import EnemyUFO from "./EnemyUFO";
import Gun from "./Gun";
import imageLoader, {images} from "./imageLoader";
import {getMouseDownPos, getMousePos, setMouseRelativeElement} from "./mouse";
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

const c = document.getElementById("c") as HTMLCanvasElement;

imageLoader
.add(0, 300, 150, (ctx) => renderPlanetSurface(earthsurfaceData, ctx))
.add(1, 70, 30, (ctx) => renderGunLv1(ctx, {size: 30, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(2, 70, 30, (ctx) => renderGunLv2(ctx, {size: 30, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(3, 70, 30, (ctx) => renderGunLv3(ctx, {size: 30, colorScheme: PLAYER_GUN_COLORSCHEME}))
.add(4, 60, 25, (ctx) => renderGunLv3(ctx, {size: 25, colorScheme: UFO_GUN_COLORSCHEME}))
.add(5, 100, 40, (ctx) => renderUFO(ctx, {color: "#F200ED", size: 40}))
.load(c, () => {
  const [img, gunImg] = images;
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  console.log("load complete");
  ctx.drawImage(img, 0, 0);
  // const p = new Player(new Planet({
  //   radius: img.height / 2,
  //   spinSpeed: img.height / 10,
  //   surfaceMap: img,
  //   tiltAngle: Math.PI / 6,
  // }));
  const g = new Gun(images[4], true);
  g.angle = Math.PI / 2;
  const u = new EnemyUFO({
    gun: g,
    image: images[5],
  });
  setInterval(() => {
    c.width ^= 0;
    [u.x, u.y] = getMousePos();
    u.process(1 / 60);
    u.render(ctx);
  }, 1 / 60);
});

setMouseRelativeElement(c);
