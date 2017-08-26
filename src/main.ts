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
import {Circle, Rectangle} from "./shapes";
import SpatialHashMap, {ICollidable} from "./SpatialHashMap";

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
  const p = new Player(new Planet({
    radius: img.height / 2,
    spinSpeed: img.height / 2,
    surfaceMap: img,
    tiltAngle: Math.PI / 6,
  }));
  p.collisionShape = new Circle(0, 0, 0);
  // const g = new Gun(images[4], true);
  // g.angle = Math.PI / 2;
  // const u = new EnemyUFO({
  //   gun: g,
  //   image: images[5],
  // });
  const r: Array<{
    collisionShape: Rectangle,
    px: number,
    py: number,
  }> = [];
  // change the number to 100 to see them clearer
  for (let i = 1000; i--; ) {
    r.push({
      collisionShape: new  Rectangle(
        Math.random() * c.width,
        Math.random() * c.height,
        Math.random() * 16 + 1,
        Math.random() * 16 + 1,
      ),
      px: (Math.random() - Math.random()) * 3,
      py: (Math.random() - Math.random()) * 3,
    });
  }
  let ld = Date.now();
  function loop() {
    c.width ^= 0;
    p.process(1 / 60);
    console.log((Date.now() - ld) / 1000);
    ld = Date.now();
    p.render(ctx);
    p.collisionShape.x = p.x;
    p.collisionShape.y = p.y;
    p.collisionShape.radius = img.height / 2;
    const shm = new SpatialHashMap();
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.lineWidth = 2;
    for (const rect of r) {
      rect.collisionShape.x += rect.px;
      rect.collisionShape.y += rect.py;
      if (rect.collisionShape.x < 0 || rect.collisionShape.x > c.width) {
        rect.px *= -1;
      }
      if (rect.collisionShape.y < 0 || rect.collisionShape.y > c.height) {
        rect.py *= -1;
      }
      shm.insert(rect);
      ctx.strokeRect(
        rect.collisionShape.x,
        rect.collisionShape.y,
        (rect.collisionShape as Rectangle).width,
        (rect.collisionShape as Rectangle).height,
      );
    }
    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    for (const rect of shm.retrive(p)) {
      ctx.fillRect(
        rect.collisionShape.x,
        rect.collisionShape.y,
        (rect.collisionShape as Rectangle).width,
        (rect.collisionShape as Rectangle).height,
      );
    }
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    for (const rect of r) {
      if (shm.retrive(rect).length > 0) {
        ctx.fillRect(
          rect.collisionShape.x,
          rect.collisionShape.y,
          (rect.collisionShape as Rectangle).width,
          (rect.collisionShape as Rectangle).height,
        );
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
});

setMouseRelativeElement(c);
