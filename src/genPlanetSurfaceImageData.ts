export interface IPlanetSurfaceLayer {
  color: string;

  // If data[i] is array, then data[i] (for every i in [0, data.length))
  // is a list of a pair of number.
  // Each number is percentage relative to the width
  // If data[i] is number is a number, then it is the number of round to be skip
  data: Array<number[][] | number>;
}

export interface IPlanetSurface {
  background: string;
  width: number;
  height: number;
  layers: IPlanetSurfaceLayer[];
}

export function renderLayer(layer: IPlanetSurfaceLayer, cvs: HTMLCanvasElement, lineCap: string = "round") {
  const w = cvs.width;
  const h = cvs.height;
  const ctx = cvs.getContext("2d");
  ctx.strokeStyle = layer.color;
  ctx.lineCap = lineCap;
  ctx.fillStyle = layer.color;

  const magic = 2;  // used to hide gaps
  const numberOfLines = layer.data.reduce(
    (sum: number, val) => sum + (typeof val === "number" ? val : 1),
    0,
  ) as number;
  const lw = ctx.lineWidth = h / numberOfLines;

  ctx.lineWidth += magic;
  for (let f = 0, y = lw / 2; f < layer.data.length; ++f, y += lw) {
    const t = layer.data[f];
    if (typeof t === "number") {
      y += lw * (t - 1);
      continue;
    }
    for (const g of t) {
      const x1 = g[0] * w / 100;
      const x2 = g[1] * w / 100;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }
  }
}

export default
function genPlanetSurfaceImageData(
  data: IPlanetSurface, cvs: HTMLCanvasElement,
  newWidth?: number, newHeight?: number,
): string {
  const w = newWidth ? newWidth : data.width;
  const h = newHeight ? newHeight : data.height;
  cvs.width = w;
  cvs.height = h;
  const ctx = cvs.getContext("2d");
  ctx.fillStyle = data.background;
  ctx.fillRect(0, 0, w, h);

  for (const i of data.layers) {
    renderLayer(i, cvs);
  }

  return cvs.toDataURL();
}
