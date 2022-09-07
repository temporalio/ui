export const toTimeDifference = (date, now = Date.now()) => {
    if (!date)
        return '';
    const start = String(date);
    try {
        const scheduled = Number(new Date(start));
        const timeFromNow = (scheduled - now) / 1000;
        return !isNaN(timeFromNow) ? `${timeFromNow}s` : '';
    }
    catch (error) {
        return '';
    }
};
