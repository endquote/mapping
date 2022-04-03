// from two.js sample
// https://codesandbox.io/s/sharp-proskuriakova-h5weu

export function getWidth() {
  if (window.navigator.maxTouchPoints > 0) {
    return Math.max(window.innerWidth, window.innerHeight);
  }
  return window.innerWidth;
}

export function getHeight() {
  if (window.navigator.maxTouchPoints > 0) {
    return Math.min(window.innerWidth, window.innerHeight);
  }
  return window.innerHeight;
}

export function transposeEvent(e: MouseEvent) {
  if (window.navigator.maxTouchPoints > 0) {
    if (window.innerWidth > window.innerHeight) {
      return {
        clientX: e.clientX,
        clientY: e.clientY,
      };
    } else {
      return {
        clientX: e.clientY,
        clientY: window.innerWidth - e.clientX, // Based on rotation settings
      };
    }
  }
  return {
    clientX: e.clientX,
    clientY: e.clientY,
  };
}
