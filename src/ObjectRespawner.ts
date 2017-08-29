import {addListener, Events} from "./EventListener";
interface IConstructor<T> {
  new(): T;
}

/**
 * This is a object pool implementation, but ObjectRespawner sound cooler,
 * and its job is just "respawer old objects".
 *
 * In this implementation, #free method pushes data into pool and #get method get data from the pool.
 * Both of them has O(1) complexity because #get method does not use Array.shift().
 *
 * Inorder to maintain the size, after all processions (that is, after each game loop),
 * the #clean method should be called.
 */
export default class ObjectRespawner<T> {
  private queue: T[] = [];
  private currentHead = 0;

  [index: number]: (any) => boolean | void;

  constructor(private ctor: IConstructor<T>) {
    addListener(this, [Events.process]);
  }

  public assign(numberOfObject: number) {
    while (numberOfObject--) {
      this.free(new this.ctor());
    }
  }

  public free(data: T) {
    this.queue.push(data);
  }

  public get(): T {
    if (this.currentHead === this.queue.length) {
      this.free(new this.ctor());
    }
    return this.queue[this.currentHead++];
  }

  public clean() {
    const maxQueuelength = 1000;
    if (this.queue.length > maxQueuelength) {
      this.queue.splice(0, this.currentHead);
      this.currentHead = 0;
    }
  }

  public [Events.process]() {
    this.clean();
  }

}
