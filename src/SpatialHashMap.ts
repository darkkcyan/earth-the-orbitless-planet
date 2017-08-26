import {
  AllKindOfShapes,
  isCollision,
  IShape,
  Rectangle,
  SHAPE_TYPE,
} from "./shapes";

export interface ICollidable {
  collisionShape: AllKindOfShapes;
}

export default class SpatialHashMap {
  private hash: {[index: string]: ICollidable[]; } = {};
  constructor(public powerOf2 = 5) {
  }

  public insert(a: ICollidable) {
    const [sx, sy, ex, ey] = this.getPositions(a.collisionShape);
    for (let i = sx; i <= ex; ++i) {
      for (let f = sy; f <= ey; ++f) {
        const key = this.hashFunc(i, f);
        if (!this.hash[key]) {
          this.hash[key] = [];
        }
        this.hash[key].push(a);
      }
    }
  }

  public retrive(a: ICollidable) {
    const ans: ICollidable[] = [];
    const [sx, sy, ex, ey] = this.getPositions(a.collisionShape);
    for (let i = sx; i <= ex; ++i) {
      for (let f = sy; f <= ey; ++f) {
        const key = this.hashFunc(i, f);
        if (!this.hash[key]) {
          continue;
        }
        for (const obj of this.hash[key]) {
          if (obj === a) {
            continue;
          }

          // if this object is processed before
          const [ox, oy] = this.getPositions(obj.collisionShape);
          if (Math.max(ox, sx) !== i || Math.max(oy, sy) !== f) {
            continue;
          }

          if (isCollision(obj.collisionShape, a.collisionShape)) {
            ans.push(obj);
          }
        }
      }
    }
    return ans;
  }

  private getPosition(x: number, y: number): [number, number] {
    return [x >> this.powerOf2, y >> this.powerOf2];
  }

  private getPositions(shape: AllKindOfShapes) {
    const ans = shape.getBounds();
    for (let i = ans.length; i--; ) {
      ans[i] >>= this.powerOf2;
    }
    return ans;
  }

  private hashFunc(x: number, y: number) {
    return (x << 25 | y);  // because the safe integer range is 2 ^ 53
  }
}
