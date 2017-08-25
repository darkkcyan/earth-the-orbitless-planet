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
}

export class Circle implements IShape {
  public readonly shapeType = SHAPE_TYPE.CIRCLE;
  constructor(public x: number, public y: number, public radius: number) {
  }
}

type CollisionCheckFunction = (a: IShape, b: IShape) => boolean;
export const collisionDetector: CollisionCheckFunction[][] = [[], []];

collisionDetector[SHAPE_TYPE.RECTANGLE][SHAPE_TYPE.RECTANGLE] = (a: Rectangle, b: Rectangle) => {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
};

collisionDetector[SHAPE_TYPE.CIRCLE][SHAPE_TYPE.CIRCLE] = (a: Circle, b: Circle) => {
  const tx = a.x - b.x;
  const ty = a.y - b.y;
  const r = a.radius + b.radius;
  return tx * tx + ty * ty < r * r;
};

// circle and rectanble collision dectection algorithm get from here:
// http://www.migapro.com/circle-and-rotated-rectangle-collision-detection/
collisionDetector[SHAPE_TYPE.CIRCLE][SHAPE_TYPE.RECTANGLE] = (a: Circle, b: Rectangle) => {
  const cx = clamp(a.x, b.x, b.x + b.width) - a.x;
  const cy = clamp(a.y, b.y, b.y + b.height) - a.y;
  return cx * cx + cy * cy < a.radius * a.radius;
};

collisionDetector[SHAPE_TYPE.RECTANGLE][SHAPE_TYPE.CIRCLE] = (b: Rectangle, a: Circle) => {
  const cx = clamp(a.x, b.x, b.x + b.width) - a.x;
  const cy = clamp(a.y, b.y, b.y + b.height) - a.y;
  return cx * cx + cy * cy < a.radius * a.radius;
};
