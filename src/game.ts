import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {emit, Events, listeners} from "./EventListener";
import Player from "./Player";
import SpatialHashMap from "./SpatialHashMap";

export let player: Player = null;
export let dt: number = null;
export let shm: SpatialHashMap = null;

let lastTime = Date.now();

export function setPlayer(t: Player) {
  player = t;
}

export function gameloop() {
  dt = (Date.now() - lastTime) / 1000;
  lastTime = Date.now();
  // ctx.fillStyle = "#01030B";
  // ctx.fillRect(0, 0, scrwidth, scrheight);
  celm.width ^= 0;
  shm = new SpatialHashMap();  // clear the map every frame
  emit(Events.process);
  emit(Events.collisionCheck);
  for (let i = Events.render; i <= Events.last_render; ++i) {
    emit(i);
  }
  // console.log(listeners[Events.process]);
  requestAnimationFrame(gameloop);
}
