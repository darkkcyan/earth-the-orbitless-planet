import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {gameloop, setPlayer} from "./game";
import {images, ImagesId, onload} from "./imageLoader";
import "./loadImages";
import Planet from "./Planet";
import Player from "./Player";
import UFOFormation, {
  PolygonUPP,
  PyramidUPP,
  RandomPositionSPP,
  StraightForwardSPP,
  StraightLineUPP,
  TowardPlayerSPP,
  WallUPP,
} from "./UFOFormation";

// tslint:disable no-shadowed-variable
onload(() => {
  celm.width = scrwidth;
  celm.height = scrheight;
  // tslint:disable no-unused-expression
  // Its actually used expression, tslint does not recognize that
  const img = images[ImagesId.earthSurface];
  setPlayer(new Player(new Planet({
    radius: img.height / 2,
    spinSpeed: img.height / 2,
    surfaceMap: img,
    tiltAngle: Math.PI / 6,
  })));
  function rep<T>(obj: T, n: number) {
    const ans: T[] = [];
    for (; n--; ) {
      ans.push(obj);
    }
    return ans;
  }
  const u = [];
  for (let i = 8; i--; ) {
    u.push({
      bulletConfig: {
        color: "red",
        radius: 6,
        speed: 500,
      },
      image: images[ImagesId.UFO + i],
      live: 5,
    });
  }
  const x = new UFOFormation(
    u,
    new RandomPositionSPP(),
    new PolygonUPP(),
  );

  gameloop();
});
