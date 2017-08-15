import Planet from "./Planet";

const c = document.getElementById("c") as HTMLCanvasElement;
c.width = window.innerWidth;
c.height = window.innerHeight;
const ctx = c.getContext("2d");

ctx.fillStyle = "red";
const p = new Planet({radius: 40});
p.x = 300;
p.y = 400;
p.render(ctx);
ctx.fill();
