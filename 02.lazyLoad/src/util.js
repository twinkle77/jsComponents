export const util = {
  throttle (fn, delay) {
    let timer = null
    return function () {
      timer = setTimeout(() => {
        clearTimeout(timer)
        fn()
      }, delay)
    }
  },
  throttle1 (fn, mustRun = 500) {
    const timer = null;
    let previous = null;
    return function() {
      const now = new Date();
      const context = this;
      const args = arguments;
      if (!previous){
        previous = now;
      }
      const remaining = now - previous;
      if (mustRun && remaining >= mustRun) {
        fn.apply(context, args);
        previous = now;
      }
    }
  }
}

/**
 * http://www.alloyteam.com/2012/11/javascript-throttle/
 */
