import {celm, scrheight, scrwidth} from "./canvas";
let currentX: number;
let currentY: number;

export const enum MouseStatus {
  DOWN,
  UP,
}

let mouseStatus = MouseStatus.UP;

export let getMouseStatus = () => mouseStatus;

celm.onmousedown = (e: MouseEvent) => {
  mouseStatus = MouseStatus.DOWN;
};

celm.onmousemove = (e: MouseEvent) => {
  currentX = e.offsetX * scrwidth / celm.offsetWidth;
  currentY = e.offsetY * scrheight / celm.offsetHeight;
};

celm.onmouseup = (e: MouseEvent) => {
  mouseStatus = MouseStatus.UP;
};

export let getMousePos = () => [currentX, currentY];
