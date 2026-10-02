import type { HourFormat } from '$lib/utilities/format-date';
import { getTimezone } from '$lib/utilities/timezone';

export interface TimelineChainTimeTick {
  timeMs: number;
  positionPercent: number;
  edge: 'start' | 'middle' | 'end';
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

export function formatTimelineChainDuration(durationMs: number): string {
  const totalSeconds = Math.max(1, Math.floor(durationMs / 1_000));
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (totalMinutes < 60) {
    return seconds ? `${totalMinutes}m ${seconds}s` : `${totalMinutes}m`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (totalHours < 24) {
    return minutes ? `${totalHours}h ${minutes}m` : `${totalHours}h`;
  }

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return hours ? `${days}d ${hours}h` : `${days}d`;
}

export function getTimelineChainTimeTicks({
  startTimeMs,
  endTimeMs,
  widthPx,
}: {
  startTimeMs: number;
  endTimeMs: number;
  widthPx: number;
}): TimelineChainTimeTick[] {
  if (endTimeMs < startTimeMs) return [];

  const tickCount = Math.max(2, Math.min(5, Math.floor(widthPx / 220) + 1));
  const durationMs = endTimeMs - startTimeMs;

  return Array.from({ length: tickCount }, (_, index) => {
    const progress = index / (tickCount - 1);
    return {
      timeMs: startTimeMs + durationMs * progress,
      positionPercent: progress * 100,
      edge: index === 0 ? 'start' : index === tickCount - 1 ? 'end' : 'middle',
    };
  });
}

export function formatTimelineChainTickTime({
  timeMs,
  durationMs,
  timeFormat,
  hourFormat,
}: {
  timeMs: number;
  durationMs: number;
  timeFormat: string;
  hourFormat: HourFormat;
}): string {
  const timeZone = getTimezone(timeFormat);
  // Under a few seconds the ticks fall within the same second, so they carry
  // fractions of one to stay apart.
  const precision =
    durationMs < 1_000
      ? 'centisecond'
      : durationMs < 5_000
        ? 'decisecond'
        : durationMs < 10 * 60_000
          ? 'second'
          : durationMs < 24 * 60 * 60_000
            ? 'minute'
            : durationMs < 365 * 24 * 60 * 60_000
              ? 'day'
              : 'year';
  const cacheKey = `${timeZone}|${hourFormat}|${precision}`;
  let formatter = formatterCache.get(cacheKey);

  if (!formatter) {
    const hour12 = hourFormat === 'system' ? undefined : hourFormat === '12';
    const options: Intl.DateTimeFormatOptions =
      precision === 'centisecond' || precision === 'decisecond'
        ? {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: precision === 'centisecond' ? 2 : 1,
          }
        : precision === 'second'
          ? { hour: 'numeric', minute: '2-digit', second: '2-digit' }
          : precision === 'minute'
            ? { hour: 'numeric', minute: '2-digit' }
            : precision === 'day'
              ? { month: 'short', day: 'numeric', hour: 'numeric' }
              : { year: 'numeric', month: 'short', day: 'numeric' };
    formatter = new Intl.DateTimeFormat(undefined, {
      ...options,
      ...(hour12 !== undefined && { hour12 }),
      timeZone,
    });
    formatterCache.set(cacheKey, formatter);
  }

  return formatter.format(new Date(timeMs));
}
