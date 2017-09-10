import ctx from "./canvas";
import {Events} from "./EventListener";
import {dt} from "./game";
import Gun, {IGunConfig} from "./Gun";
import {images, ImagesId} from "./imageLoader";
import {PI2, SimpleHarmonicMotion as HarmonicMotion} from "./math";
import {isMouseDown} from "./mouse";

export class HarmonicMotionPlayerGunFormation {
  public x: number = 0;
  public y: number = 0;

  public planetRadius: number;
  public mainGun: Gun = null;
  public sideGunPhaseOffset: number;
  public hm: HarmonicMotion;
  public leftSideGunList: Gun[];
  public rightSideGunList: Gun[];

  public setSideGun(gl: Gun[]) {
    this.leftSideGunList = gl.map((gun) => gun.clone());
    this.rightSideGunList = gl;
  }

  public [Events.process]() {
    this.hm.process(dt);
    const sideGunTimeOffset = this.sideGunPhaseOffset / PI2 * this.hm.period;
    const fire = isMouseDown;
    if (this.mainGun) {
      this.mainGun.x = this.x + this.planetRadius;
      this.mainGun.y = this.y;
      this.mainGun.angle = 0;
      this.mainGun.isFiring = fire;
      this.mainGun[Events.process]();
    }
    for (let i = 0, t = 0; i < this.leftSideGunList.length; ++i, t += sideGunTimeOffset) {
      const leftGun = this.leftSideGunList[i];
      const rightGun = this.rightSideGunList[i];
      leftGun.angle = this.hm.getX(t);
      rightGun.angle = this.hm.getX(t + this.hm.period / 2);
      leftGun.x = this.x + this.planetRadius * Math.cos(leftGun.angle);
      leftGun.y = this.y + this.planetRadius * Math.sin(leftGun.angle);
      rightGun.x = this.x + this.planetRadius * Math.cos(rightGun.angle);
      rightGun.y = this.y + this.planetRadius * Math.sin(rightGun.angle);
      leftGun.isFiring = rightGun.isFiring = fire;
      leftGun[Events.process]();
      rightGun[Events.process]();
    }
  }

  public [Events.render]() {
    for (const gun of this.leftSideGunList) {
      gun[Events.render]();
    }
    for (const gun of this.rightSideGunList) {
      gun[Events.render]();
    }
    if (this.mainGun) {
      this.mainGun[Events.render]();
    }
  }
}

const playerBulletColor: string[] = [
  "#00CED1",
  "#7FFFD4",
  "#00FF7F",
];
function getPlayerGun(gunLv: number) {
  if (gunLv === 0) {
    return null;
  }
  const rotate = gunLv < 0;
  gunLv = Math.abs(gunLv);
  return new Gun({
    bulletConfig: {
      color: playerBulletColor[gunLv - 1],
      damage: gunLv,
      isPlayerBullet: true,
      radius: 4 + gunLv * 3,
      speed: 850 + gunLv * 150,
    },
    image: images[ImagesId.playerGun + gunLv],
    reloadTime: .55 - gunLv * .1,
    rotate,
  });
}

const playerGunFormationData: number[][] = [
// [hm.amplitute (actually it is Math.PI / hm.amplitute, hm.period,
//  sideGunPhaseOffset (same as hm.amplitute), mainGunLv, sidegun0lv, sidegun1lv, ...]
  [0, 1, 0, 1],
  [6, 2, 0, 0, 1],
  [6, 2, 0, 1, -1],
  [6, 2, 0, 2, -1],
  [6, 2, 0, 1, -2],
  [6, 2, 0, 2, -2],
  [4, 2, 6, 3, 1, -1],
  [4, 2, 6, 3, 1, -2],
  [4, 2, 6, 3, 1, -2],
  [4, 2, 6, 3, 1, -2],
  [4, 2, 6, 3, 1, -2],
  [4, 2, 6, 3, 1, -2],
  [4, 2, 6, 3, 2, -2],
  [4, 2, 6, 3, 2, -2],
  [4, 2, 6, 3, 2, -2],
  [4, 2, 6, 3, 2, -2],
  [4, 2, 6, 3, 2, -2],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 2, -3],
  [4, 2, 6, 3, 3, -3],
];

export default function getPlayerGunFormation(playerLevel: number) {
  playerLevel = Math.min(playerLevel, playerGunFormationData.length - 1);
  const dat = playerGunFormationData[playerLevel];
  const ret = new HarmonicMotionPlayerGunFormation();
  const [amplitute, period, sideGunPhaseOffset, mainGunLv, ...sideGunLv] = dat;
  ret.hm = new HarmonicMotion(Math.PI / amplitute, period);
  ret.sideGunPhaseOffset = Math.PI / sideGunPhaseOffset;
  ret.mainGun = getPlayerGun(mainGunLv);
  ret.setSideGun(sideGunLv.map((x) => getPlayerGun(x)));
  return ret;
}
