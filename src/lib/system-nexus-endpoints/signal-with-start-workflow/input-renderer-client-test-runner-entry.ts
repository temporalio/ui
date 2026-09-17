import { flushSync, mount, unmount } from 'svelte';

import type { Payload } from '$lib/types';

import InputRenderer from './input-renderer.svelte';

const mounted: ReturnType<typeof mount>[] = [];

export async function cleanup() {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
}

export async function render(payload: Payload) {
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(mount(InputRenderer, { target, props: { payload } }));
  await Promise.resolve();
  await Promise.resolve();
  flushSync();
  return target;
}
