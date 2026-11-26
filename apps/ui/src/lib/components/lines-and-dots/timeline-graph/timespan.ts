const UNBOUNDED_KEY = 'unbounded';

export interface TimespanBounds {
  startUnbounded?: boolean;
  endUnbounded?: boolean;
}

export class Timespan {
  private _startTimeMs: number;
  private _endTimeMs: number;
  private _startUnbounded: boolean;
  private _endUnbounded: boolean;

  constructor(
    startTimeMs: number,
    endTimeMs: number,
    bounds: TimespanBounds = {},
  ) {
    if (startTimeMs > endTimeMs) {
      throw new RangeError('Start time cannot come after end time');
    }

    this._startTimeMs = startTimeMs;
    this._endTimeMs = endTimeMs;
    this._startUnbounded = bounds.startUnbounded ?? false;
    this._endUnbounded = bounds.endUnbounded ?? false;
  }

  get key(): string {
    const start = this._startUnbounded
      ? UNBOUNDED_KEY
      : String(this._startTimeMs);
    const end = this._endUnbounded ? UNBOUNDED_KEY : String(this._endTimeMs);
    return `${start}-${end}`;
  }

  get startUnbounded(): boolean {
    return this._startUnbounded;
  }

  get endUnbounded(): boolean {
    return this._endUnbounded;
  }

  get durationMs(): number {
    return this.endTimeMs - this.startTimeMs;
  }

  get startTimeMs() {
    return this._startTimeMs;
  }

  set startTimeMs(startMs: number) {
    if (startMs > this._endTimeMs) {
      throw new RangeError('Start time cannot come after end time');
    }

    this._startTimeMs = startMs;
  }

  get endTimeMs() {
    return this._endTimeMs;
  }

  set endTimeMs(endMs: number) {
    if (this.startTimeMs > endMs) {
      throw new RangeError('Start time cannot come after end time');
    }

    this._endTimeMs = endMs;
  }

  contains(timeMs: number): boolean {
    return timeMs >= this.startTimeMs && timeMs <= this.endTimeMs;
  }

  clamp(timeMs: number): number {
    return Math.min(Math.max(timeMs, this.startTimeMs), this.endTimeMs);
  }
}
