import {celm, scrheight, scrwidth} from "./canvas";
import {clamp} from "./math";
let currentX: number = 0;
let currentY: number = 0;

export let isMouseDown = false;

window.onmousedown = (e: MouseEvent) => {
  isMouseDown = true;
  e.preventDefault();
};

window.onmousemove = (e: MouseEvent) => {
  const t = celm.getBoundingClientRect();
  currentX = clamp((e.clientX - t.left) * scrwidth / celm.offsetWidth, 0, scrwidth);
  currentY = clamp((e.clientY - t.top) * scrheight / celm.offsetHeight, 0, scrheight);
  e.preventDefault();
};

window.onmouseup = (e: MouseEvent) => {
  isMouseDown = false;
  e.preventDefault();
};

export let getMousePos = () => [currentX, currentY];
