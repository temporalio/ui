import { page } from '$app/stores';
import { get, writable } from 'svelte/store';

const getQueryParam = () => !!+get(page).query.has('fullScreen');
const setQueryParam = (status: boolean): boolean => {
  const query = new URLSearchParams();
  if (status) {
    query.append('fullScreen', '1');
  } else {
    query.delete('fullScreen');
  }
  history.pushState(null, '', `?${query}`);
  return status;
};

const { subscribe, update } = writable(false, function (set) {
  set(getQueryParam());
});

export const isFullScreen = {
  subscribe,
  toggle: () => update((status) => setQueryParam(!status)),
};
