import ctx from "./canvas";
import {getMousePos, isMouseDown} from "./mouse";

export function processButton(
  x: number, y: number, width: number, height: number,
  label: string,
  onclick: () => void,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = ctx.fillStyle = "cyan";
  ctx.fillText(label, x, y);
  x -= width / 2;
  y -= height / 2;
  ctx.strokeRect(x, y, width, height);
  const [mx, my] = getMousePos();
  if (x < mx && x + width > mx && y < my && y + height > my) {
    ctx.fillStyle = "rgba(255,255,255,.2)";
    ctx.fillRect(x, y, width, height);
    if (isMouseDown) {
      onclick();
    }
  }
}
