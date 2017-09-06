import {PLAYER_GUN_COLORSCHEME} from "./colorschemes";
import {ImagesId, loadPrerender} from "./imageLoader";
import * as surfaces from "./planet-surfaces-data";
import fillWhite from "./prerender/fillWhite";
import {
  renderGunLv1,
  renderGunLv2,
  renderGunLv3,
} from "./prerender/gun";
import {IPlanetSurface, renderPlanetSurface} from "./prerender/planet";
import {renderUFO} from "./prerender/UFO";

const gunw = 60;
const gunh = 25;
for (const [id, cb] of [
  [ImagesId.gunlv1, renderGunLv1],
  [ImagesId.gunlv2, renderGunLv2],
  [ImagesId.gunlv3, renderGunLv3],
] as Array<[number, typeof renderGunLv1]>) {
  loadPrerender(id, gunw, gunh, () => cb({size: gunh, colorScheme: PLAYER_GUN_COLORSCHEME}));
}

const UFOw = 100;
const UFOh = 40;
const BigUFOw = 500;
const BigUFOh = 200;
loadPrerender(ImagesId.UFOHit, UFOw, UFOh, () => {
  renderUFO({color: "black", size: UFOh});
  fillWhite();
});
loadPrerender(ImagesId.BigHFOHit, BigUFOw, BigUFOh, () => {
  renderUFO({color: "black", size: BigUFOh});
  fillWhite();
});

// colors of UFO are currently got from here https://en.wikipedia.org/wiki/Solar_System#/media/File:Planets2013.svg
const UFOColor = "4682B4,20B2AA,F3CE9F,tan,F24300,6ED03D,DC9A3C,848484".split(",").map((x) => "#" + x);
for (let i = UFOColor.length; i--; ) {
  loadPrerender(ImagesId.UFO + i, UFOw, UFOh, () => {
    renderUFO({color: UFOColor[i], size: UFOh});
  });
  loadPrerender(ImagesId.BigUFO + i, BigUFOw, BigUFOh, () => {
    renderUFO({color: UFOColor[i], size: BigUFOh});
  });
}

export const planetSurfaceScale = [];
function loadPlanetSurface(id: number, p: IPlanetSurface, scaleRatio = 1) {
  planetSurfaceScale[id] = scaleRatio;
  loadPrerender(id, p.width / scaleRatio, p.height / scaleRatio, () => {renderPlanetSurface(p); });
}

loadPlanetSurface(ImagesId.earthSurface, surfaces.earthsurface);
loadPlanetSurface(ImagesId.moonSurface, surfaces.moonsurface);
loadPlanetSurface(ImagesId.alienPlanetSurface, surfaces.alienplanetsurface);
loadPlanetSurface(ImagesId.alienPlanetSurfaceWithShield, surfaces.alienplanetsurfaceiwithshield);
loadPlanetSurface(ImagesId.neptuneSurface, surfaces.neptunesurface, 8);
loadPlanetSurface(ImagesId.uranusSurface, surfaces.uranussurface, 8);
loadPlanetSurface(ImagesId.saturnSurface, surfaces.saturnsurface, 8);
loadPlanetSurface(ImagesId.jupiterSurface, surfaces.jupitersurface, 8);
loadPlanetSurface(ImagesId.marsSurface, surfaces.marssurface, 2);
loadPlanetSurface(ImagesId.venusSurface, surfaces.venussurface, 2);
loadPlanetSurface(ImagesId.mercurySurface, surfaces.mercurysurface, 2);
loadPlanetSurface(ImagesId.sunSurface, surfaces.sunsurface);
