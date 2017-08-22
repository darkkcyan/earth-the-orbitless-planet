import genPlanetSurfaceImageData, {renderPlanetSurface} from "./genPlanetSurfaceImageData";
import {
  renderPlayerGunLv1,
  renderPlayerGunLv2,
  renderPlayerGunLv3,
} from "./gunRenderFunctions";
import imageLoader from "./imageLoader";
import {getMouseDownPos, getMousePos, setMouseRelativeElement} from "./mouse";
import Planet from "./Planet";
import {earthsurface as earthsurfaceData} from "./planet-surfaces-data";
import Player from "./Player";

const c = document.getElementById("c") as HTMLCanvasElement;

imageLoader
.add(0, 300, 150, (ctx) => renderPlanetSurface(earthsurfaceData, ctx))
.add(1, 70, 30, (ctx) => renderPlayerGunLv3(ctx, {size: 30}))
.load(c, ([img, gunImg]) => {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  console.log("load complete");
  // ctx.drawImage(img, 0, 0);
  const p = new Player(new Planet({
    radius: img.height / 2,
    spinSpeed: img.height / 10,
    surfaceMap: img,
    tiltAngle: Math.PI / 6,
  }));
  setInterval(() => {
    c.width ^= 0;
    p.process(1 / 60);
    p.render(ctx);
    const [x, y] = getMousePos();
    ctx.drawImage(gunImg, x, y);
  }, 1 / 60);
});

setMouseRelativeElement(c);
