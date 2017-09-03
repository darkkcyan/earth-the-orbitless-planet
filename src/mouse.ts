import {celm, scrheight, scrwidth} from "./canvas";
import {clamp} from "./math";
let currentX: number = 0;
let currentY: number = 0;

export const enum MouseStatus {
  DOWN,
  UP,
}

let mouseStatus = MouseStatus.UP;

export let getMouseStatus = () => mouseStatus;

window.onmousedown = (e: MouseEvent) => {
  mouseStatus = MouseStatus.DOWN;
};

window.onmousemove = (e: MouseEvent) => {
  const t = celm.getBoundingClientRect();
  currentX = clamp((e.clientX - t.left) * scrwidth / celm.offsetWidth, 0, scrwidth);
  currentY = clamp((e.clientY - t.top) * scrheight / celm.offsetHeight, 0, scrheight);
};

window.onmouseup = (e: MouseEvent) => {
  mouseStatus = MouseStatus.UP;
};

export let getMousePos = () => [currentX, currentY];
