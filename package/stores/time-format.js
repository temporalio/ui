import { persistStore } from './persist-store';
export const timeFormat = persistStore('timeFormat', 'UTC');
export const setTimeFormat = (format) => {
    timeFormat.set(format);
};
