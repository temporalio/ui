export const toTimeDifference = (date: unknown, now = Date.now()): string => {
  if (!date) return '';
  const start = String(date);

  try {
    const scheduled = Number(new Date(start));
    const timeFromNow = (scheduled - now) / 1000;
    return !isNaN(timeFromNow) ? `${timeFromNow}s` : '';
  } catch (error) {
    return '';
  }
};
