import type { Timestamp } from '$lib/types';

export const toTimeDifference = ({
  date,
  now = Date.now(),
  negativeDefault,
}: {
  date: Timestamp;
  now?: number;
  negativeDefault?: string;
}): string => {
  if (!date) return '';
  const start = String(date);

  try {
    const scheduled = Number(new Date(start));
    const timeFromNow = (scheduled - now) / 1000;

    if (negativeDefault && timeFromNow < 0) {
      return negativeDefault;
    }

    return !isNaN(timeFromNow) ? `${timeFromNow}s` : '';
  } catch (error) {
    return '';
  }
};
