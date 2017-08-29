import ctx, {celm} from "./canvas";
import {emit, Events} from "./EventListener";
import Player from "./Player";

export let player: Player = null;
export let dt: number = null;

let lastTime = Date.now();

export function setPlayer(t: Player) {
  player = t;
}

export function gameloop() {
  dt = (Date.now() - lastTime) / 1000;
  lastTime = Date.now();
  celm.width ^= 0;
  emit(Events.process);
  emit(Events.render);
  requestAnimationFrame(gameloop);
}
