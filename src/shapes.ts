import {clamp} from "./math";
export const enum SHAPE_TYPE {
  CIRCLE,
  RECTANGLE,
}

export interface IShape {
  shapeType: SHAPE_TYPE;
}

export class Rectangle implements IShape {
  public readonly shapeType = SHAPE_TYPE.RECTANGLE;
  constructor(public x: number, public y: number, public width: number, public height: number) {
  }
  public getBounds() {
    return [this.x, this.y, this.x + this.width, this.y + this.height];
  }
}

export class Circle implements IShape {
  public readonly shapeType = SHAPE_TYPE.CIRCLE;
  constructor(public x: number, public y: number, public radius: number) {
  }
  public getBounds() {
    return [this.x - this.radius, this.y - this.radius, this.x + this.radius, this.y + this.radius];
  }
}

export type AllKindOfShapes = Rectangle | Circle;

// circle and rectanble collision dectection algorithm get from here:
// http://www.migapro.com/circle-and-rotated-rectangle-collision-detection/
export function isCollision(a: AllKindOfShapes, b: AllKindOfShapes) {
  if (a.shapeType === SHAPE_TYPE.RECTANGLE) {
    if (b.shapeType === SHAPE_TYPE.RECTANGLE) {
      return (
        a.x < b.x + b.width &&
        b.x < a.x + a.width &&
        a.y < b.y + b.height &&
        b.y < a.y + a.height
      );
    } else {
      const cx = clamp(b.x, a.x, a.x + a.width) - b.x;
      const cy = clamp(b.y, a.y, a.y + a.height) - b.y;
      return cx * cx + cy * cy < b.radius * b.radius;
    }
  } else if (b.shapeType === SHAPE_TYPE.CIRCLE) {
    const tx = a.x - b.x;
    const ty = a.y - b.y;
    const r = a.radius + b.radius;
    return tx * tx + ty * ty < r * r;
  } else {
    const cx = clamp(a.x, b.x, b.x + b.width) - a.x;
    const cy = clamp(a.y, b.y, b.y + b.height) - a.y;
    return cx * cx + cy * cy < a.radius * a.radius;
  }
}
