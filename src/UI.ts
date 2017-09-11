import Boss from "./Boss";
import {processButton} from "./Button";
import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {easeInOutCubic} from "./ease";
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
import scriptsController, {totalStages} from "./scripts";

addListener({
  [Events.render + 10]() {
    ctx.save();
    [renderMenu, renderGameUI][gameState]();
    ctx.restore();
  },
}, [Events.render + 10]);

export function changeScreen(cb: () => void) {
  let currentTime = 0;
  const changeTime = 1500;
  addListener({
    [Events.render + 10]() {
      currentTime += 16;
      if (currentTime - 16 < changeTime / 2 && currentTime > changeTime / 2) {
        cb();
      }
      if (currentTime < changeTime) {
        const x = easeInOutCubic(currentTime, scrwidth, -scrwidth * 3, changeTime);
        // ctx.fillStyle = "#00271A";
        ctx.clearRect(x, 0, scrwidth * 2, scrheight);
      }
      return currentTime > changeTime;
    },
  }, [Events.render + 10]);
}

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

  ctx.font = "small-caps 30px Arial";
  ctx.fillText("Made by Quang Loc Tran", x, 260);

  ctx.font = "30px Arial";

  ctx.fillText(`HIGHSCORE: ${ld.highscore}`, x, 340);

  if (sessionStorage.getItem(storageName)) {
    const sd = JSON.parse(sessionStorage.getItem(storageName)) as ISessionData;
    ctx.fillText(`YOUR SCORE: ${sd.lastScore}`, x, 470);
    if (sd.lastScore >= ld.highscore) {
      ctx.fillStyle = "yellow";
      ctx.fillText("NEW HIGH SCORE", x, 500);
    }
    ctx.fillStyle = "lime";
    ctx.font = "70px Arial";
    ctx.fillText(sd.isLose ? "GAME OVER" : "YOU WON", x, 380);
  }

  ctx.font = "60px Arial";
  const btw = 600;
  const bth = 70;
  processButton(x, 600, btw, bth, "NEW GAME", () => {
    changeScreen(() => {
      changeGameStage(GameState.ingame);
      newPlayer();
      // player.setGunLv(7);
      scriptsController.startStage(0);
    });
  });
  if (ld.lastGunLevel != null) {
    processButton(x, 700, btw, bth, "CONTINUE", () => {
      changeScreen(() => {
        changeGameStage(GameState.ingame);
        newPlayer();
        player.setGunLv(ld.lastGunLevel);
        scriptsController.startStage(ld.lastStage);
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
  } else {
    ctx.textAlign = "center";
    ctx.fillText(`Next stop: ${[
      "Neptune",
      "Uranus",
      "Saturn",
      "Jupiter",
      "Mars",
      "Earth???",
      "Venus",
      "Mercury",
      "Sun",
      "Earth's orbit",
    ][scriptsController.currentStage]}`, scrwidth / 2, 0);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "red";
  ctx.fillText("\u{1F49A}", 0, 0);
}
