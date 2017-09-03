import ctx from "./canvas";
import {Events} from "./EventListener";
import {dt} from "./game";
import {HALF_PI, PI2} from "./math";

export default class Planet {
  public static tiltAngle = Math.PI / 6;
  public x: number = 0;
  public y: number = 0;

  public spinSpeed: number; // its actually the surfaceMap scroll speed

  private mapPosition: number = 0;

  constructor(
    private surfaceMap: HTMLImageElement,
    public lightSourceAngle: number = 0,
    public radius: number = surfaceMap.height / 2,
  ) {
    this.spinSpeed = this.surfaceMap.height / 2;
  }

  public [Events.process]() {
    this.mapPosition += dt * this.spinSpeed;
    if (this.mapPosition > this.surfaceMap.width) {
      this.mapPosition -= this.surfaceMap.width;
    }
  }

  public [Events.render]() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // draw surface map
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, PI2);
    ctx.clip();
    ctx.rotate(Planet.tiltAngle);
    const px = -this.radius + this.mapPosition;
    const py = -this.radius;
    const magic = 3;  // this number is added
                      // to the previous image's position
                      // inorder to hide a little line between 2 images.

    ctx.drawImage(this.surfaceMap, px, py);
    ctx.drawImage(this.surfaceMap, px - this.surfaceMap.width + magic, py);
    ctx.restore();

    // draw shadow, instead of draw light
    ctx.rotate(this.lightSourceAngle);
    ctx.beginPath();
    ctx.arc(this.radius, 0, this.radius * Math.SQRT2, -Math.PI * 3 / 4, Math.PI * 3 / 4, true);
    ctx.arc(0, 0, this.radius, HALF_PI, - HALF_PI);
    ctx.fillStyle = "rgba(0,0,0,0.5)";  // gray color with half alpha, make it feels like shadow
    ctx.fill();
    ctx.restore();
  }
}
