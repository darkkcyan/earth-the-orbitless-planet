import {collisionDetector, IShape, Rectangle} from "./shapes";

export interface ICollidable {
  boundary: Rectangle;
  shape: IShape;
}

export default class SpatialHashMap {
  private hash: {[index: string]: ICollidable[]; } = {};
  constructor(public powerOf2 = 5) {
  }

  public insert(a: ICollidable) {
    for (const p of this.getPositions(a.boundary)) {
      const key = this.hashFunc(p);
      if (!this.hash[key]) {
        this.hash[key] = [];
      }
      this.hash[key].push(a);
    }
  }

  public retrive(a: ICollidable) {
    const ans: ICollidable[] = [];
    const bpx = a.boundary.x >> this.powerOf2;
    const bpy = a.boundary.y >> this.powerOf2;
    for (const p of this.getPositions(a.boundary)) {
      const key = this.hashFunc(p);
      if (!this.hash[key]) {
        continue;
      }
      for (const obj of this.hash[key]) {
        if (obj === a) {
          continue;
        }

        // if this object is processed before
        if (
          Math.max(obj.boundary.x >> this.powerOf2, bpx) !== p[0] ||
          Math.max(obj.boundary.y >> this.powerOf2, bpy) !== p[1]
        ) {
          continue;
        }

        if (collisionDetector[obj.shape.shapeType][a.shape.shapeType](obj.shape, a.shape)) {
          ans.push(obj);
        }
      }
    }
    return ans;
  }

  private getPosition(x: number, y: number): [number, number] {
    return [x >> this.powerOf2, y >> this.powerOf2];
  }

  private getPositions(boundary: Rectangle) {
    const sx = boundary.x >> this.powerOf2;
    const sy = boundary.y >> this.powerOf2;
    const ex = (boundary.x + boundary.width) >> this.powerOf2;
    const ey = (boundary.y + boundary.height) >> this.powerOf2;
    const ans: Array<[number, number]> = [];
    for (let i = sx; i <= ey; ++i) {
      for (let f = sy; f <= ey; ++f) {
        ans.push([i, f]);
      }
    }
    return ans;
  }

  private hashFunc([x, y]: [number, number]) {
    return (x << 25 | y);  // because the safe integer range is 2 ^ 53
  }
}
