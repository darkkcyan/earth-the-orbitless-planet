import {PLAYER_GUN_COLORSCHEME} from "./colorschemes";
import {ImagesId, loadPrerender} from "./imageLoader";
import {earthsurface} from "./planet-surfaces-data";
import fillWhite from "./prerender/fillWhite";
import {
  renderGunLv1,
  renderGunLv2,
  renderGunLv3,
} from "./prerender/gun";
import {renderPlanetSurface} from "./prerender/planet";
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
loadPrerender(ImagesId.UFOHit, UFOw, UFOh, () => {
  renderUFO({color: "black", size: UFOh});
  fillWhite();
});

// colors of UFO are currently got from here https://en.wikipedia.org/wiki/Solar_System#/media/File:Planets2013.svg
const UFOColor = "4682B4,20B2AA,F3CE9F,tan,F24300,6ED03D,DC9A3C,848484".split(",").map((x) => "#" + x);
for (let i = UFOColor.length; i--; ) {
  loadPrerender(ImagesId.UFO + i, UFOw, UFOh, () => {
    renderUFO({color: UFOColor[i], size: UFOh});
  });
}

loadPrerender(ImagesId.earthSurface, 140, 70, () => {renderPlanetSurface(earthsurface); });
