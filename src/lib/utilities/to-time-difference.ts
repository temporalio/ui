export const toTimeDifference = (date: Date | string, now = Date.now()) => {
  try {
    return (Number(new Date(String(date))) - now) / 1000 + 's';
  } catch (error) {
    return undefined;
  }
};
