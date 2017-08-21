// This file constains functions for prerendering purpose

import {PI2} from "./math";

export interface IGunConfig {
  size: number;
  x?: number;
  y?: number;
}

/**
 * This color scheme got from here: http://www.colorcombos.com/color-schemes/7626/ColorCombo7626.html
 */
const colorScheme = [
  "#525564",
  "#74828F",
  "#96C0CE",
  "#BEB9B5",
  "#C25B56",
  "#FEF6EB",
];

export function renderPlayerGunLv1(ctx: CanvasRenderingContext2D, config: IGunConfig) {
  const {size, x = 0, y = size / 2} = config;
  ctx.save();
  ctx.translate(x, y);

  ctx.save();
  ctx.scale(1, 0.5);
  const d: Array<[boolean, string]> = [[false, colorScheme[2]], [true, colorScheme[1]]];
  for (const [reverse, color] of d) {
    ctx.beginPath();
    ctx.arc(size / 2, 0, size / 2, -Math.PI * 3 / 4, Math.PI * 3 / 4, reverse);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.fillStyle = colorScheme[0];
  ctx.fillRect(size, -size / 16, size / 2, size / 8);
  ctx.fillStyle = colorScheme[4];
  for (let i = 0, tx = size + size / 10, ts = size / 3; i < 3; ++i, tx += size / 10, ts -= size / 16) {
    ctx.fillRect(tx, -ts / 2, size / 24, ts);
  }
  ctx.beginPath();
  ctx.arc(size * 1.5, 0, size / 8, 0, PI2);
  ctx.fillStyle = colorScheme[2];
  ctx.fill();
  ctx.fillStyle = colorScheme[5];
  ctx.fillRect(size * 15 / 16, -size / 8, size / 8, size / 4);

  ctx.restore();
}
