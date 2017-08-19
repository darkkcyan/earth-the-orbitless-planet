let mouseDownX: number;
let mouseDownY: number;
let currentX: number;
let currentY: number;

export const enum MouseStatus {
  DOWN,
  UP,
}

let mouseStatus = MouseStatus.UP;

export let getMouseStatus = () => mouseStatus;

function getMousePosRelativeToElement(x: number, y: number, elm: HTMLElement): [number, number] {
  const r = elm.getBoundingClientRect();
  return [x - r.left, y - r.top];
}

function posInsideElement(x: number, y: number, elm: HTMLElement) {
  const r = elm.getBoundingClientRect();
  return (
    (r.left <= x && x <= r.right) &&
    (r.top <= y && y <= r.bottom)
  );
}

window.addEventListener("mousedown", (e: MouseEvent) => {
  mouseDownX = currentX = e.clientX;
  mouseDownY = currentY = e.clientY;
  mouseStatus = MouseStatus.DOWN;
}, false);

window.addEventListener("mousemove", (e: MouseEvent) => {
  currentX = e.clientX;
  currentY = e.clientY;
}, false);

window.addEventListener("mouseup", (e: MouseEvent) => {
  currentX = e.clientX;
  currentY = e.clientY;
  mouseStatus = MouseStatus.UP;
}, false);

let relativeElement: HTMLElement;
export let setMouseRelativeElement = (elm: HTMLElement) => relativeElement = elm;

export let getMouseDownPos = () =>
  getMousePosRelativeToElement(mouseDownX, mouseDownY, relativeElement);

export let getMousePos = () =>
  getMousePosRelativeToElement(currentX, currentY, relativeElement);

export let isMouseDownInsideRelativeElement = () =>
  posInsideElement(mouseDownX, mouseDownY, relativeElement);

export let isMouseInsideRelativeElement = () =>
  posInsideElement(currentX, currentY, relativeElement);
