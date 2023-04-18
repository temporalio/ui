import { writable } from 'svelte/store';

function getTimeDifference(start: string, end?: string) {
  if (end && end !== 'null') {
    return getTimeDifferenceFromStart(start, end);
  }
  return getTimeDifferenceFromNow(start);
}

function getTimeDifferenceFromNow(date: string) {
  const timeDiff = new Date() - new Date(date);
  return Math.floor(timeDiff / 1000);
}
function getTimeDifferenceFromStart(start: string, end: string) {
  const timeDiff = new Date(end) - new Date(start);
  return Math.floor(timeDiff / 1000);
}

export const timeDiffStore = (start: string, end?: string) => {
  const { subscribe, set } = writable(getTimeDifference(start, end));

  const interval = setInterval(() => {
    set(getTimeDifferenceFromNow(start));
  }, 1000);

  if (end && end !== 'null') {
    clearInterval(interval);
  }

  return {
    subscribe,
    unsubscribe: () => clearInterval(interval),
  };
};
