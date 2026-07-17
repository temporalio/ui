import { Timespan } from './timespan';

export class Viewport {
  startTimeMs = $state(0);
  endTimeMs = $state(0);
  widthPx = $state(0);
  heightPx = $state(0);

  readonly timespan = $derived(new Timespan(this.startTimeMs, this.endTimeMs));
  readonly durationMs = $derived(Math.max(this.timespan.durationMs, 1));

  constructor(init: {
    startTimeMs: number;
    endTimeMs: number;
    widthPx?: number;
    heightPx?: number;
  }) {
    this.startTimeMs = init.startTimeMs;
    this.endTimeMs = init.endTimeMs;
    this.widthPx = init.widthPx ?? 0;
    this.heightPx = init.heightPx ?? 0;
  }

  setSize(widthPx: number, heightPx: number) {
    this.widthPx = widthPx;
    this.heightPx = heightPx;
  }

  setTimespan(startTimeMs: number, endTimeMs: number) {
    this.startTimeMs = startTimeMs;
    this.endTimeMs = endTimeMs;
  }
}
