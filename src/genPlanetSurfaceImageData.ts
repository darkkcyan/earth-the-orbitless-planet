export interface IPlanetSurfaceLayer {
  color: string;
  data: number[][][];
}

export interface IPlanetSurface {
  background: string;
  width: number;
  height: number;
  layers: IPlanetSurfaceLayer[];
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
  ctx.lineCap = "round";

  for (const i of data.layers) {
    ctx.fillStyle = i.color;
    const lw = ctx.lineWidth = h / i.data.length;
    for (let f = 0, y = lw / 2; f < i.data.length; ++f, y += lw) {
      for (const g of i.data[f]) {
        const x1 = g[0] * w;
        const x2 = g[1] * w;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }
    }
  }

  return cvs.toDataURL();
}
