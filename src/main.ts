import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {emit, Events} from "./EventListener";
import {gameloop, setPlayer} from "./game";
import {images, ImagesId, onload} from "./imageLoader";
import "./loadImages";
import Planet from "./Planet";
import Player from "./Player";
import StarField from "./StarField";
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
  setPlayer(new Player());
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

  new StarField(100, 50);
  new StarField(100, 65);
  new StarField(100, 80);
  // setTimeout(() => {
  //   emit(Events.stopScroll);
  // }, 10000);

  gameloop();
});
