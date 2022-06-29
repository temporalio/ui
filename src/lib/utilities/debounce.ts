// https://github.com/hayes/just-debounce

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number, atStart?: boolean, guarantee?: boolean) {
  let timeout;
  let args;
  let self;

  return function debounced() {
    self = this;
    args = Array.prototype.slice.call(arguments);

    if (timeout && (atStart || guarantee)) {
      return;
    } else if (!atStart) {
      clear();

      timeout = setTimeout(run, delay);
      return timeout;
    }

    timeout = setTimeout(clear, delay);
    fn.apply(self, args);

    function run() {
      clear();
      fn.apply(self, args);
    }

    function clear() {
      clearTimeout(timeout);
      timeout = null;
    }
  };
}