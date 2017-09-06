import {IEnemyConfig} from "./Enemy";
import EnemyFormation, {IFormationSubProcessor} from "./EnemyFormation";
import {addListener, emit, Events} from "./EventListener";

export interface IEnemyFormationConfig {
  enemyConfigList: IEnemyConfig[];
  selfPositionProcessor: IFormationSubProcessor;
  enemyPositionProcess: IFormationSubProcessor;
  cost?: number;
}

export default class EnemyFormationManager {
  [index: number]: (any?) => boolean | void;
  public lastSumonTime: number = Date.now();
  public currentCost: number = 0;
  constructor(
    public formationConfigList: IEnemyFormationConfig[],
    public relaxTime = 3000,  // time between 2 sumon moments.
    public maxCost = 100,
  ) {
    this.formationConfigList.reverse();
    addListener(this, [Events.process, Events.enemyFormationDead]);
  }

  public [Events.process](): boolean | void {
    if (!this.formationConfigList.length) {
      if (!this.currentCost) {
        emit(Events.enemyFormationManagerFinish);
        return true;
      }
      return ;
    }
    const ct = Date.now();
    if (ct - this.lastSumonTime < this.relaxTime) {
      return ;
    }
    const nextFormationConfig = this.formationConfigList.pop();
    if (this.currentCost + (nextFormationConfig.cost || 1) <= this.maxCost) {
      // tslint:disable no-unused-expression
      this.currentCost += (new EnemyFormation(
        nextFormationConfig.enemyConfigList,
        nextFormationConfig.selfPositionProcessor,
        nextFormationConfig.enemyPositionProcess,
        nextFormationConfig.cost,
      )).cost;
      this.lastSumonTime = ct;
      // tslint:enable no-unused-expression
    } else {
      this.formationConfigList.push(nextFormationConfig);
    }
    return ;
  }

  public [Events.enemyFormationDead](f: EnemyFormation) {
    this.currentCost -= f.cost;
    return !this.formationConfigList.length && !this.currentCost;
  }
}
