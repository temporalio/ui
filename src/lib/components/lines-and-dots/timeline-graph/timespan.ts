const UNBOUNDED_KEY = 'unbounded';

export interface TimespanBounds {
  startUnbounded?: boolean;
  endUnbounded?: boolean;
}

export class Timespan {
  #startTimeMs: number;
  #endTimeMs: number;
  #startUnbounded: boolean;
  #endUnbounded: boolean;

  constructor(
    startTimeMs: number,
    endTimeMs: number,
    bounds: TimespanBounds = {},
  ) {
    if (startTimeMs > endTimeMs) {
      throw new RangeError('Start time cannot come after end time');
    }

    this.#startTimeMs = startTimeMs;
    this.#endTimeMs = endTimeMs;
    this.#startUnbounded = bounds.startUnbounded ?? false;
    this.#endUnbounded = bounds.endUnbounded ?? false;
  }

  get key(): string {
    const start = this.#startUnbounded
      ? UNBOUNDED_KEY
      : String(this.#startTimeMs);
    const end = this.#endUnbounded ? UNBOUNDED_KEY : String(this.#endTimeMs);
    return `${start}-${end}`;
  }

  get startUnbounded(): boolean {
    return this.#startUnbounded;
  }

  get endUnbounded(): boolean {
    return this.#endUnbounded;
  }

  get durationMs(): number {
    return this.endTimeMs - this.startTimeMs;
  }

  get startTimeMs() {
    return this.#startTimeMs;
  }

  set startTimeMs(startMs: number) {
    if (startMs > this.#endTimeMs) {
      throw new RangeError('Start time cannot come after end time');
    }

    this.#startTimeMs = startMs;
  }

  get endTimeMs() {
    return this.#endTimeMs;
  }

  set endTimeMs(endMs: number) {
    if (this.startTimeMs > endMs) {
      throw new RangeError('Start time cannot come after end time');
    }

    this.#endTimeMs = endMs;
  }

  contains(timeMs: number): boolean {
    return timeMs >= this.startTimeMs && timeMs <= this.endTimeMs;
  }

  clamp(timeMs: number): number {
    return Math.min(Math.max(timeMs, this.startTimeMs), this.endTimeMs);
  }
}
