/**
 * # Usage:
 * ## To add an event listener:
 *    addListener(obj, [eventId1, eventId2, ...])
 * Obj should has methods that has name equals to eventId.
 *
 * ## To emit and event:
 *  emit(eventId, data);
 *
 * ### Example:
 *  emit(0, ctx);  // emit event with id "0" and data is a CanvasRenderingContext2D
 *
 * ## To remove an event listener, in the handler function, just return true.
 * If the function return false or not return (that is, void), then it will be keep
 * in the listener pool.
 *
 * ## Example:
 *
 * // define some event for readablity
 * const enum Events {
 *   sayHi,
 *   momCallForLunch,
 * }
 *
 * class X {
 *  // this line must be added to implement IHasEventHandler interface
 *  [index: number]: (any) => boolean | void;
 *
 *  constructor() {
 *    addEvent(this, [Events.sayHI, Events.momCallForLunch]);
 *  }
 *
 *  public [Events.sayHi](name: string) {
 *    console.log("Hi", name);
 *  }
 *
 *  public [Events.momCallForLunch](lunchIsReady: boolean) {
 *    if (lunchIsReady) {
 *      console.log("gone for lunch, not come back");
 *      return true;
 *    } else {
 *      console.log("lunch is not ready, so I stay");
 *      return false;
 *    }
 *  }
 * }
 *
 * const x = new X();
 * emit(Event.sayHi, "mom");  // => Hi mom
 * emit(Event.sayHi, "dad");  // => Hi dad
 * emit(Event.momCallForLunch, false);  // => lunch is not ready, so I stay
 * emit(Event.momCallForLucnh, true);   // => gone for lunch, not come back
 * emit(Event.momCallForLunch, true);   // nothing happend
 *
 * # WHY???
 * - With this event listener system, there no need to bound an object to a function,
 * and the method name is shorter, because there are only numbers.
 * - Typescript's const enum feature make eveything readable.
 * - More over, the emit function will emit and remove the listeners at the same time,
 * so eveything will run in O(n), no need to implement some thing like a set/bag data structure.
 * - Current issue: the listeners run in no order, but that is not important,
 * because more events can be used instead.
 */

// Predefine event's ids
export const enum Events {
  process,
  render,
}

export interface IHasEventHandler {
  // If the handler return true, then the listener will be removed from the
  // listener pool.
  // Otherwise it will be keep.
  [index: number]: (any) => boolean | void;
}

export const listeners: IHasEventHandler[][] = [];

export function addListener(obj: IHasEventHandler, eventIds: number[]) {
  for (const eventId of eventIds) {
    if (!listeners[eventId]) {
      listeners[eventId] = [];
    }
    listeners[eventId].push(obj);
  }
}

export function emit(eventId, data?: any) {
  if (!listeners[eventId]) {
    return;
  }
  // using 2 pointer technique, this function emit and remove listener at the same time.
  // So it will run in O(n) time compilexity.
  // For more detail, look at c++ stl remove function in algorithm header.
  let newLength = 0;
  for (const obj of listeners[eventId]) {
    if (!obj[eventId](data)) {
      listeners[eventId][newLength++] = obj;
    }
  }
  listeners[eventId].length = newLength;
}

export function clearAll() {
  listeners.length = 0;
}
