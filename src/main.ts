let c = document.getElementById("c") as HTMLCanvasElement;
c.width = window.innerWidth;
c.height = window.innerHeight;
let ctx = c.getContext("2d");

ctx.fillStyle = "red";
ctx.fillRect(0, 0, c.width, c.height);
