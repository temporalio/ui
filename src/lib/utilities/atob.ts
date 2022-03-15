import { browser } from '$app/env';

export const atob = browser ? window.atob : (str: string) => str;
