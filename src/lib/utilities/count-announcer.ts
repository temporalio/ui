interface CountAnnouncerOptions {
  /** Called with the message to announce (and with '' to clear before re-announcing). */
  onAnnounce: (message: string) => void;
  /** Build the announcement from the accumulated number of new items. */
  getMessage: (newItems: number) => string;
  /** Debounce window (ms) to coalesce a batch delivered across multiple updates. */
  debounceMs?: number;
}

/**
 * Tracks increases to a count and emits a debounced announcement per batch, for
 * driving an `aria-live` region. Never announces the initial value (only changes
 * after the first `update`) or decreases. Clears (emits '') before each message
 * so an identical consecutive count still re-announces.
 *
 * Framework-agnostic on purpose: the Svelte adapter wires `update` to a reactive
 * count and `onAnnounce` to a `$state` string.
 */
export function createCountAnnouncer(opts: CountAnnouncerOptions) {
  const debounceMs = opts.debounceMs ?? 250;

  let prevCount = 0;
  let pending = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    update(current: number) {
      if (current > prevCount && prevCount > 0) {
        pending += current - prevCount;
        clearTimeout(timer);
        timer = setTimeout(() => {
          const message = opts.getMessage(pending);
          pending = 0;
          // Clear, then re-set on a fresh task so an identical consecutive
          // message still mutates the live region's text and re-announces.
          opts.onAnnounce('');
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => opts.onAnnounce(message));
        }, debounceMs);
      }
      prevCount = current;
    },
    dispose() {
      clearTimeout(timer);
      clearTimeout(resetTimer);
    },
  };
}
