export const toTimeDifference = (date: unknown, now = Date.now()) => {
  if (!date) return '';
  const start = String(date);
  try {
    const scheduled = Number(new Date(start));
    const timeFromNow = (scheduled - now) / 1000 + 's';
    console.log({ date, now });
    return timeFromNow;
  } catch (error) {
    return undefined;
  }
};
