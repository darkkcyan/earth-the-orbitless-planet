import ctx, {scrheight, scrwidth} from "./canvas";
import {addListener, Events} from "./EventListener";
import {score} from "./game";

addListener({
  [Events.render + 10]() {
    ctx.save();
    renderGameUI();
    ctx.restore();
  },
}, [Events.render + 10]);

function renderGameUI() {
  const fontSize = 30;
  const viewHeight = fontSize + 5;
  ctx.fillStyle = "rgba(0,190,255,.546)";
  ctx.strokeStyle = "#00DCFF";
  ctx.font = "small-caps 30px Arial";
  ctx.textBaseline = "top";
  const lw = ctx.lineWidth = 5;
  ctx.font = `bold ${fontSize}px Courier New`;
  ctx.textBaseline = "top";
  const scorceStringSize = Math.max(100, ctx.measureText("" + score).width);
  ctx.beginPath();
  ctx.moveTo(scrwidth + lw, 0);
  ctx.lineTo(scrwidth + lw, viewHeight);
  ctx.lineTo(scrwidth - scorceStringSize, viewHeight);
  ctx.arc(scrwidth - scorceStringSize, 0, viewHeight, Math.PI / 2, Math.PI);
  ctx.closePath();
  ctx.moveTo(-lw, 0);
  ctx.lineTo(-lw, viewHeight);
  ctx.lineTo(100, viewHeight);
  ctx.arc(100, 0, viewHeight, Math.PI / 2, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.fillText("" + score, scrwidth, 0);
  ctx.textAlign = "left";
  ctx.fillStyle = "red";
  ctx.fillText("\u{1F49A}", 0, 0);
}
