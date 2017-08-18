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

export function renderLayer(layer: IPlanetSurfaceLayer, cvs: HTMLCanvasElement) {
  const w = cvs.width;
  const h = cvs.height;
  const ctx = cvs.getContext("2d");
  ctx.lineCap = "round";
  ctx.fillStyle = layer.color;
  const lw = ctx.lineWidth = h / layer.data.length;
  for (let f = 0, y = lw / 2; f < layer.data.length; ++f, y += lw) {
    for (const g of layer.data[f]) {
      const x1 = g[0] * w;
      const x2 = g[1] * w;
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
