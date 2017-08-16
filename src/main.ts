import Planet from "./Planet";

const c = document.getElementById("c") as HTMLCanvasElement;
c.width = window.innerWidth;
c.height = window.innerHeight;
const ctx = c.getContext("2d");

const img = new Image();
img.src = "./test-image.jpg";

img.onload = (e: Event) => {
  console.log("load complete");
  // ctx.drawImage(img, 0, 0);
  const p = new Planet({
    radius: 150,
    spinSpeed: 30,
    surfaceMap: img,
    tiltAngle: Math.PI / 6,
  }, ctx);
  p.x = 300;
  p.y = 400;
  setInterval(() => {
    c.width ^= 0;
    p.process(1 / 60);
    p.render(ctx);
  }, 1 / 60);

  // fun things: the earth looks "real" when move it around,
  // but looks a little "fake" when stand still :D
  window.onmousemove = (me: MouseEvent) => {
    p.x = me.clientX;
    p.y = me.clientY;
  };
};
