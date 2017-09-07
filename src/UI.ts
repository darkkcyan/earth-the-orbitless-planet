import Boss from "./Boss";
import ctx, {scrheight, scrwidth} from "./canvas";
import {addListener, Events} from "./EventListener";
import {player, score} from "./game";

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
  ctx.lineTo(70, viewHeight);
  ctx.arc(70, 0, viewHeight, Math.PI / 2, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.fillText("" + score, scrwidth, 0);
  ctx.textAlign = "left";
  ctx.fillText("" + player.live, fontSize + 10, 0);
  ctx.fillStyle = "red";
  ctx.fillText("\u{1F49A}", 0, 0);
  if (Boss.activeBosses.length) {
    let totalBossLive = 0;
    let currentBossLive = 0;
    for (const b of Boss.activeBosses) {
      totalBossLive += b.config.live;
      currentBossLive += b.live;
    }
    // ctx.fillStyle = "red";  // above fillStyle was already set to red
    const bossLiveBarWidth = 600;
    const bossLiveBarHeight = 30;
    const x = (scrwidth - bossLiveBarWidth) / 2;
    const y = 10;
    ctx.fillRect(x, y, bossLiveBarWidth * (1 - currentBossLive / totalBossLive), bossLiveBarHeight);
    ctx.strokeRect(x, y, bossLiveBarWidth, bossLiveBarHeight);
  }
}
