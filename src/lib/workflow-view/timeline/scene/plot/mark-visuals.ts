import { colorScales } from '$lib/theme/io/themes';

import type { QualifiedHistoryEvent } from '../../../data/history-events/types';

type EventType = QualifiedHistoryEvent['eventType'];

/** Returns the legacy-style fill and outline colors for a history event mark. */
export function getMarkColors(
  eventType: EventType,
): Readonly<{ fill: string; stroke: string }> {
  if (eventType.endsWith('Completed'))
    return { fill: colorScales.green[9], stroke: colorScales.green[11] };
  if (eventType.endsWith('Failed') || eventType.endsWith('Terminated'))
    return { fill: colorScales.red[9], stroke: colorScales.red[11] };
  if (eventType.endsWith('TimedOut'))
    return {
      fill: colorScales.persimmon[11],
      stroke: colorScales.persimmon[9],
    };
  if (eventType.endsWith('Canceled'))
    return { fill: colorScales.amber[9], stroke: colorScales.amber[3] };
  if (eventType.endsWith('Fired'))
    return { fill: colorScales.tangerine[9], stroke: colorScales.amber[9] };
  if (eventType.endsWith('Signaled'))
    return { fill: colorScales.pink[9], stroke: colorScales.pink[8] };
  if (eventType.endsWith('Started'))
    return { fill: colorScales.zaffre[7], stroke: colorScales.neutral[11] };
  return { fill: colorScales.indigo[3], stroke: colorScales.neutral[11] };
}

/** Returns the legacy-style connector color from a lifecycle's final event. */
export function getLineColor(
  eventType: EventType | undefined,
  fallback: string,
): string {
  if (!eventType) return fallback;
  if (eventType.endsWith('Completed')) return colorScales.green[9];
  if (eventType.endsWith('Failed') || eventType.endsWith('Terminated'))
    return colorScales.red[11];
  if (eventType.endsWith('TimedOut')) return colorScales.persimmon[9];
  if (eventType.endsWith('Canceled')) return colorScales.amber[9];
  if (eventType.endsWith('Fired')) return colorScales.tangerine[9];
  if (eventType.endsWith('Signaled')) return colorScales.pink[9];
  return fallback;
}
