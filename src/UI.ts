import Boss from "./Boss";
import {processButton} from "./Button";
import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {easeInOutQuint} from "./ease";
import {addListener, Events} from "./EventListener";
import {
  changeGameStage,
  GameState, gameState,
  ISavedData, ISessionData,
  newPlayer,
  player,
  score,
  storageName,
} from "./game";
import scriptsController from "./scripts";

addListener({
  [Events.postgamereset]() {
    addListener({
      [Events.render + 10]() {
        ctx.save();
        [renderMenu, renderGameUI][gameState]();
        ctx.restore();
      },
    }, [Events.render + 10]);
  },
}, [Events.postgamereset]);

export function changeScreen(cb: () => void) {
  let currentTime = 0;
  const changeTime = 3000;
  addListener({
    [Events.render + 10]() {
      currentTime += 16;
      if (currentTime - 16 < changeTime / 2 && currentTime > changeTime / 2) {
        cb();
      }
      if (currentTime < changeTime) {
        const x = easeInOutQuint(currentTime, -scrwidth * 2, scrwidth * 4, changeTime);
        ctx.fillStyle = "black";
        ctx.fillRect(x, 0, scrwidth * 2, scrheight);
      }
      return currentTime > changeTime;
    },
  }, [Events.render + 10]);
}

let preventButtonClick = false;
function renderMenu() {
  celm.style.cursor = "auto";

  ctx.fillStyle = "cyan";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const x = scrwidth / 2;
  ctx.font = "180px Arial";
  ctx.fillText("EARTH", x, 30);
  ctx.font = "50px Arial";
  ctx.fillText("THE ORBITLESS PLANET", x, 200);

  const ld = JSON.parse(localStorage.getItem(storageName)) as ISavedData;
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(`HIGHSCORE: ${ld.highscore}`, x, 280);

  if (sessionStorage.getItem(storageName)) {
    const sd = JSON.parse(sessionStorage.getItem(storageName)) as ISessionData;
    ctx.fillText(`YOUR SCORE: ${sd.lastScore}`, x, 400);
    if (sd.lastScore >= ld.highscore) {
      ctx.fillStyle = "yellow";
      ctx.fillText("NEW HIGH SCORE", x, 440);
    }
    ctx.fillStyle = "lime";
    ctx.font = "70px Arial";
    ctx.fillText(sd.isLose ? "GAME OVER" : "YOU WON", x, 320);
  }

  ctx.font = "60px Arial";
  const btw = 600;
  const bth = 70;
  processButton(x, 600, btw, bth, "NEW GAME", () => {
    if (preventButtonClick) {
      return;
    }
    preventButtonClick = true;
    changeScreen(() => {
      changeGameStage(GameState.ingame);
      newPlayer();
      scriptsController.startStage(0);
      preventButtonClick = false;
    });
  });
  if (ld.lastLive) {
    processButton(x, 700, btw, bth, "CONTINUE", () => {
      if (preventButtonClick) {
        return;
      }
      preventButtonClick = true;
      changeScreen(() => {
        changeGameStage(GameState.ingame);
        newPlayer();
        player.live = ld.lastLive;
        player.setGunLv(ld.lastGunLevel);
        scriptsController.startStage(ld.lastStage);
        preventButtonClick = false;
      });
    });
  }
}

function renderGameUI() {
  celm.style.cursor = "none";
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
