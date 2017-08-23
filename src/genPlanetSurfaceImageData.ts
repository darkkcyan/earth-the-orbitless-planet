import {IPlanetSurface, IPlanetSurfaceLayer, renderPlanetSurface} from "./prerender/planet";

export * from "./prerender/planet";

export default
function genPlanetSurfaceImageData(
  data: IPlanetSurface, cvs: HTMLCanvasElement,
  newWidth?: number, newHeight?: number,
): string {
  const w = newWidth ? newWidth : data.width;
  const h = newHeight ? newHeight : data.height;
  cvs.width = w;
  cvs.height = h;
  renderPlanetSurface(data, cvs.getContext("2d"));
  return cvs.toDataURL();
}
