interface EasingFunction {
  (t: number, b: number, c: number, d: number): number;
}

// 扩展 Math 接口
declare global {
  interface Math {
    easeInOutQuad: EasingFunction;
  }
}

Math.easeInOutQuad = function (t: number, b: number, c: number, d: number): number {
  t /= d / 2;
  if (t < 1) {
    return (c / 2) * t * t + b;
  }
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
const requestAnimFrame = (function (): ((callback: FrameRequestCallback) => number) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback: FrameRequestCallback): number {
      return window.setTimeout(callback, 1000 / 60);
    }
  );
})();

/**
 * Because it's so fucking difficult to detect the scrolling element, just move them all
 * @param {number} amount
 */
function move(amount: number): void {
  document.documentElement.scrollTop = amount;
  if (document.body.parentNode instanceof HTMLElement) {
    document.body.parentNode.scrollTop = amount;
  }
  document.body.scrollTop = amount;
}

function position(): number {
  return (
    document.documentElement.scrollTop ||
    (document.body.parentNode instanceof HTMLElement ? document.body.parentNode.scrollTop : 0) ||
    document.body.scrollTop
  );
}

/**
 * @param {number} to
 * @param {number} duration
 * @param {Function} callback
 */
export function scrollTo(to: number, duration?: number, callback?: () => void): void {
  const start = position();
  const change = to - start;
  const increment = 20;
  let currentTime = 0;
  const actualDuration = typeof duration === "undefined" ? 500 : duration;
  
  const animateScroll = function (): void {
    // increment the time
    currentTime += increment;
    // find the value with the quadratic in-out easing function
    const val = Math.easeInOutQuad(currentTime, start, change, actualDuration);
    // move the document.body
    move(val);
    // do the animation unless its over
    if (currentTime < actualDuration) {
      requestAnimFrame(animateScroll);
    } else {
      if (callback && typeof callback === "function") {
        // the animation is done so lets callback
        callback();
      }
    }
  };
  animateScroll();
}