export const enum Events {
  process,
  render,
}

export interface IHasEventHandler {
  [index: number]: (any) => boolean | void;
}

const listeners: IHasEventHandler[][] = [];

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
