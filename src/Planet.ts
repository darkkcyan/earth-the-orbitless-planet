import ctx from "./canvas";
import {Events} from "./EventListener";
import {dt} from "./game";
import {HALF_PI, PI2} from "./math";

const tiltAngle = Math.PI / 6;

export default class Planet {
  public x: number = 0;
  public y: number = 0;

  public spinSpeed: number; // its actually the surfaceMap scroll speed

  private mapPosition: number = 0;

  constructor(
    private surfaceMap: HTMLImageElement,
    public lightSourceAngle: number = 0,
    public radius: number = surfaceMap.height / 2,
    private hasRing = false,
  ) {
    this.spinSpeed = this.surfaceMap.height / 2;
  }

  public getScaleRatio() {
    return this.radius / this.surfaceMap.height * 2;
  }

  public [Events.process]() {
    this.mapPosition += dt * this.spinSpeed;
    if (this.mapPosition > this.surfaceMap.width * this.getScaleRatio()) {
      this.mapPosition -= this.surfaceMap.width * this.getScaleRatio();
    }
  }

  public [Events.render]() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // draw surface map
    ctx.save();
    ctx.rotate(tiltAngle);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, PI2);
    ctx.clip();
    const px = -this.radius + this.mapPosition;
    const py = -this.radius;
    const magic = 3;  // this number is added
                      // to the previous image's position
                      // inorder to hide a little line between 2 images.

    const nw = this.surfaceMap.width * this.getScaleRatio();
    const nh = this.radius * 2;
    ctx.drawImage(this.surfaceMap, px, py, nw, nh);
    ctx.drawImage(this.surfaceMap, px - nw + magic, py, nw, nh);
    ctx.restore();

    // draw shadow, instead of draw light
    ctx.save();
    ctx.rotate(this.lightSourceAngle);
    ctx.beginPath();
    ctx.arc(this.radius, 0, this.radius * Math.SQRT2, -Math.PI * 3 / 4, Math.PI * 3 / 4, true);
    ctx.arc(0, 0, this.radius, HALF_PI, - HALF_PI);
    ctx.fillStyle = "rgba(0,0,0,0.5)";  // gray color with half alpha, make it feels like shadow
    ctx.fill();
    ctx.restore();

    if (this.hasRing) {
      ctx.rotate(tiltAngle);
      ctx.scale(1, .1);
      const ang1 = Math.PI / 7.3;
      const ang2 = Math.PI / 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.1, -ang1, Math.PI + ang1);
      ctx.arc(0, 0, this.radius * 1.6, Math.PI + ang2, -ang2, true);
      ctx.fillStyle = "rgba(183,160,146,.5)";
      ctx.fill();
    }
    ctx.restore();
  }
}
