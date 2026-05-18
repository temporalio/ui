import type { Timespan } from '../timespan';

export type TimeSegmentKey = string;

export interface TimeSegment {
  kind: 'active' | 'inactive';
  timespan: Timespan;
}
