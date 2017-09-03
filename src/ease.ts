// some functions get from here: http://gizma.com/easing/

export function easeInOutCubic(t: number, b: number, c: number, d: number) {
  t /= d / 2;
  if (t < 1) {
    return c / 2 * t * t * t + b;
  }
  t -= 2;
  return c / 2 * (t * t * t + 2) + b;
}

export function easeInCubic(t: number, b: number, c: number, d: number) {
	t /= d;
	return c * t * t * t + b;
}

export function easeOutCubic(t: number, b: number, c: number, d: number) {
  t /= d;
  t--;
  return c * (t * t * t + 1) + b;
}

export function easeInOutQuad(t: number, b: number, c: number, d: number) {
  t /= d / 2;
  if (t < 1) {
    return c / 2 * t * t + b;
  }
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
}

export function easeInCirc(t: number, b: number, c: number, d: number) {
  t /= d;
  return -c * (Math.sqrt(1 - t * t) - 1) + b;
}

export function easeInOutQuint(t: number, b: number, c: number, d: number) {
  t /= d / 2;
  if (t < 1) {
    return c / 2 * t * t * t * t * t + b;
  }
  t -= 2;
  return c / 2 * (t * t * t * t * t + 2) + b;
}
