import genPlanetSurfaceImageData from "./genPlanetSurfaceImageData";
import {renderPlayerGunLv1, renderPlayerGunLv2} from "./gunRenderFunctions";
import {getMouseDownPos, getMousePos, setMouseRelativeElement} from "./mouse";
import Planet from "./Planet";
import {earthsurface as earthsurfaceData} from "./planet-surfaces-data";
import Player from "./Player";

const c = document.getElementById("c") as HTMLCanvasElement;
const ctx = c.getContext("2d");

// const img = new Image();
// img.src = genPlanetSurfaceImageData(earthsurfaceData, c, 300, 150);

c.width = window.innerWidth;
c.height = window.innerHeight;

// setMouseRelativeElement(c);

// img.onload = (e: Event) => {
//   console.log("load complete");
//   // ctx.drawImage(img, 0, 0);
//   const p = new Player(new Planet({
//     radius: img.height / 2,
//     spinSpeed: img.height / 10,
//     surfaceMap: img,
//     tiltAngle: Math.PI / 6,
//   }));
//   setInterval(() => {
//     c.width ^= 0;
//     p.process(1 / 60);
//     p.render(ctx);
//   }, 1 / 60);
// };

renderPlayerGunLv1(ctx, {
  size: 50,
  x: 100,
  y: 100,
});

renderPlayerGunLv2(ctx, {
  size: 50,
  x: 200,
  y: 100,
});
