export interface IPlanetSurfaceLayer {
  color: string;
  data: number[][][];
}

export interface IPlanetSurface {
  background: string;
  layers: IPlanetSurfaceLayer[];
}

export default
function genPlanetSurfaceImageData(w: number, h: number, data: IPlanetSurface, cvs: HTMLCanvasElement): string {
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
