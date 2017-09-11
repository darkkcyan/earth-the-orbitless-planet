import ctx from "../canvas";
import {HALF_PI, PI2} from "../math";

export interface IGunConfig {
  size: number;
  colorScheme: string[];
  x?: number;
  y?: number;
}

function renderGunBase(size: number, colorScheme: string[]) {
  const d: Array<[boolean, string]> = [[false, colorScheme[2]], [true, colorScheme[1]]];
  for (const [reverse, color] of d) {
    ctx.beginPath();
    ctx.arc(size / 2, 0, size / 2, -Math.PI * .75, Math.PI * .75, reverse);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

export function renderGunLv1(config: IGunConfig) {
  const {size, x = 0, y = size / 2, colorScheme} = config;
  ctx.save();
  ctx.translate(x, y);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, -size / 2, size * 0.75, size);
  ctx.clip();
  ctx.scale(1, 0.5);
  renderGunBase(size, colorScheme);
  ctx.restore();

  ctx.translate(size * 0.75, 0);
  ctx.beginPath();
  ctx.fillStyle = colorScheme[3];
  ctx.fillRect(0, -size / 16, size * 0.75, size / 8);
  ctx.fillStyle = colorScheme[4];
  for (let i = 0, tx = size / 5, ts = size / 3; i < 3; ++i, tx += size / 8, ts -= size / 16) {
    ctx.fillRect(tx, -ts / 2, size / 16, ts);
  }
  ctx.beginPath();
  ctx.arc(size * .75, 0, size / 8, 0, PI2);
  ctx.fillStyle = colorScheme[2];
  ctx.fill();
  ctx.fillStyle = colorScheme[5];
  ctx.fillRect(0, -size / 6, size / 8, size / 3);

  ctx.restore();
}

export function renderGunLv2(config: IGunConfig) {
  const {size, x = 0, y = size / 2, colorScheme} = config;
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(size * 1.5, 0, size * .2, 0, PI2);
  ctx.fillStyle = colorScheme[2];
  ctx.fill();

  ctx.fillStyle = colorScheme[3];
  for (let sign = -1; sign < 2; sign += 2) {
    ctx.beginPath();
    ctx.moveTo(size * 1.5, sign * size * .2);
    ctx.lineTo(size * .5, sign * size * .2);
    ctx.lineTo(size * .7, sign * size * .4);
    ctx.fill();
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, -size / 2, size * 0.75, size);
  ctx.clip();
  ctx.scale(1, 0.7);
  renderGunBase(size, colorScheme);
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(size * 1.5, 0);
  ctx.lineTo(size * .7, size * .15);
  ctx.lineTo(size * .5, 0);
  ctx.lineTo(size * .7, -size * .15);
  ctx.fillStyle = colorScheme[5];
  ctx.fill();

  ctx.beginPath();
  ctx.arc(size * .75, 0, size * .1, 0, PI2);
  ctx.fillStyle = colorScheme[4];
  ctx.fill();

  ctx.restore();
}

export function renderGunLv3(config: IGunConfig) {
  const {size, x = 0, y = size / 2, colorScheme} = config;
  ctx.save();
  ctx.translate(x, y);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  [
    [size, -size / 2],
    [size, -size / 4],
    [size / 2, -size / 4],
    [size / 2, size / 4],
    [size, size / 4],
    [size, size / 2],
    [0, size / 2],
  ].forEach(([tx, ty]) => ctx.lineTo(tx, ty));
  ctx.clip();
  ctx.scale(1, .9);
  renderGunBase(size, colorScheme);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([size / 8, size / 16]);
  ctx.lineDashOffset = size / 3;
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size * 1.6, 0);
  ctx.lineWidth = size / 4;
  ctx.strokeStyle = colorScheme[4];
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(size * 1.75, - size / 4);
  ctx.arc(size * .8, 0, size / 4 * Math.SQRT2, -Math.PI * .75, Math.PI * .75, true);
  ctx.lineTo(size * 1.75, size / 4);
  ctx.strokeStyle = colorScheme[5];
  ctx.lineWidth = size / 10;
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 1.75, 0, size / 4 + size / 20, 0, PI2);
  ctx.fillStyle = colorScheme[2];
  ctx.fill();

  ctx.restore();
}
