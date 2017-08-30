import ctx, {celm} from "./canvas";
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
  celm.width ^= 0;
  shm = new SpatialHashMap();  // clear the map every frame
  emit(Events.process);
  emit(Events.collisionCheck);
  emit(Events.render);
  console.log(listeners[Events.process]);
  requestAnimationFrame(gameloop);
}
