import { type ValidTime, validTimeToDate } from '$lib/utilities/format-time';

export type TimespanLike = { start: ValidTime; end: ValidTime };

export class Timespan {
  #startTimeMs: number;
  #endTimeMs: number;

  constructor(startTimeMs: number, endTimeMs: number) {
    if (startTimeMs > endTimeMs) {
      throw new RangeError('Start time cannot come after end time');
    }

    this.#startTimeMs = startTimeMs;
    this.#endTimeMs = endTimeMs;
  }

  get key(): string {
    return `${this.startTimeMs}-${this.endTimeMs}`;
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

  static coerce(input: TimespanLike): Timespan {
    const startDate = validTimeToDate(input.start);
    const endDate = validTimeToDate(input.end);
    return new Timespan(startDate.getTime(), endDate.getTime());
  }
}
