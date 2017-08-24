import {PI2} from "../math";
export interface IUFOConfig {
  size: number;
  x?: number;
  y?: number;
  color: string;
}

const GLASS_COLOR = "#C2EEFE";
const SHADOW_GLASS_COLOR = "#7AABEB";

export function renderUFO(ctx: CanvasRenderingContext2D, config: IUFOConfig) {
  ctx.save();
  const size = config.size;
  const GAP_SIZE = size * .075;
  const WIDTH = size * 2.5;
  const {x = WIDTH / 2, y = size / 2, color} = config;

  ctx.save();
  ctx.translate(x, y);
  ctx.save();

  ctx.beginPath();
  ctx.arc(0, 0, size / 2, Math.PI, 0);
  ctx.fillStyle = GLASS_COLOR;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, size * .6, -Math.PI / 6, 0);
  ctx.arc(0, 0, size * .6, Math.PI, -Math.PI * 5 / 6);
  ctx.fillStyle = SHADOW_GLASS_COLOR;
  ctx.fill();
  for (let i = 0, p = -size * .6; i < 3; ++i, p += size * .6) {
    ctx.beginPath();
    ctx.arc(p, size * .1, size * .275, 0, Math.PI);
    ctx.fill();
  }

  ctx.scale(1, .175);
  ctx.beginPath();
  ctx.arc(0, 0, WIDTH / 2 - GAP_SIZE / 2, -Math.PI / 3, Math.PI / 3);
  ctx.arc(0, 0, WIDTH / 2 - GAP_SIZE / 2, Math.PI * 2 / 3, -Math.PI * 2 / 3);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, WIDTH / 2 - GAP_SIZE / 2, 0, Math.PI / 3);
  ctx.arc(0, 0, WIDTH / 2 - GAP_SIZE / 2, Math.PI * 2 / 3, Math.PI);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  // ctx.setLineDash([size / 10]);
  ctx.moveTo(-WIDTH / 2 + GAP_SIZE / 2, 0);
  ctx.lineTo(WIDTH / 2 - GAP_SIZE / 2, 0);
  ctx.lineWidth = GAP_SIZE;
  ctx.lineCap = "round";
  ctx.strokeStyle = "white";
  ctx.stroke();

  ctx.restore();
}
