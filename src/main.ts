import ctx, {celm, scrheight, scrwidth} from "./canvas";
import {addListener, emit, Events, listeners} from "./EventListener";
import {
  changeGameStage,
  gameloop,
  GameState,
  ISavedData, ISessionData,
  newPlayer, player,
  resetScore, score,
  storageName,
} from "./game";
import {onload} from "./imageLoader";
import "./loadImages";
import "./PowerUp";
import scriptController from "./scripts";
import StarField from "./StarField";
import "./UI";
import {changeScreen} from "./UI";

const lis = {
  [Events.gamereset]() {
    listeners[Events.process] = [];
    listeners[Events.collisionCheck] = [];
    listeners[Events.startScroll] = [];
    listeners[Events.stopScroll] = [];
    listeners[Events.enemyDead] = [];
    listeners[Events.enemyFormationDead] = [];
    for (let i = Events.render; i < Events.last_render; ++i) {
      listeners[i] = [];
    }

    if (!localStorage.getItem(storageName)) {
      localStorage.setItem(storageName, JSON.stringify({
        highscore: 0,
        lastGunLevel: null,
        lastStage: null,
      } as ISavedData));
    }
    resetScore();
    // tslint:disable no-unused-expression
    // Its actually used expression, tslint does not recognize that
    new StarField(100, 90);
    new StarField(100, 100);
    new StarField(100, 110);
    celm.width = scrwidth;
    celm.height = scrheight;
    changeGameStage(GameState.mainmenu);
    emit(Events.postgamereset);
    emit(Events.startScroll);
  },
  [Events.playerdead]() {
    const ld = JSON.parse(localStorage.getItem(storageName)) as ISavedData;
    const sd: ISessionData = {
      isLose: true,
      lastScore: score,
    };
    ld.highscore = Math.max(ld.highscore, score);
    localStorage.setItem(storageName, JSON.stringify(ld));
    sessionStorage.setItem(storageName, JSON.stringify(sd));
    changeScreen(() => emit(Events.gamereset));
  },
  [Events.victory]() {
    const ld = JSON.parse(localStorage.getItem(storageName)) as ISavedData;
    const sd: ISessionData = {
      isLose: false,
      lastScore: score,
    };
    ld.highscore = Math.max(ld.highscore, score);
    ld.lastGunLevel = ld.lastStage = null;
    localStorage.setItem(storageName, JSON.stringify(ld));
    sessionStorage.setItem(storageName, JSON.stringify(sd));
    changeScreen(() => emit(Events.gamereset));
  },
};
addListener(lis, [Events.gamereset, Events.playerdead, Events.victory]);

// tslint:disable no-shadowed-variable
celm.style.display = "none";
onload(() => {
  celm.style.display = "block";
  lis[Events.gamereset]();
  gameloop();
});
