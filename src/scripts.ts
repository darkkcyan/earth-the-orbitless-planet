import {addListener, emit, Events} from "./EventListener";

interface IScriptWave {
  callEnemyFormationManager();
  callBoss();
}

export const scripts: IScriptWave[] = [];

const scriptController = {
  currentWave: 0,
  startWave(wave: number) {
    if (wave >= scripts.length) {
      emit(Events.victory);
      return;
    }
    emit(Events.startScroll);
    this.currentWave = wave;
    scripts[wave].callEnemyFormationManager();
  },
  [Events.enemyFormationManagerFinish]() {
    emit(Events.stopScroll);
    scripts[this.currentWave].callBoss();
  },
  [Events.bossDefeated]() {
    this.startWave(++this.currentWave);
  },
};

addListener(scriptController, [Events.enemyFormationManagerFinish, Events.bossDefeated]);

export default scriptController;
