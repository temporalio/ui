import type { Timestamp } from '$lib/types';

export const toTimeDifference = (date: Timestamp, now = Date.now()): string => {
  if (!date) return '';
  const start = String(date);

  try {
    const scheduled = Number(new Date(start));
    const timeFromNow = (scheduled - now) / 1000;
    return !isNaN(timeFromNow) && timeFromNow > 0 ? `${timeFromNow}s` : '';
  } catch (error) {
    return '';
  }
};
