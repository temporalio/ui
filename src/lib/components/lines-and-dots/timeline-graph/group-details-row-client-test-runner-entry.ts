import { flushSync, mount, unmount } from 'svelte';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

import GroupDetailsRow from './group-details-row.svelte';

const mounted: ReturnType<typeof mount>[] = [];

export function initialize() {
  if (globalThis.ResizeObserver) return;
  globalThis.ResizeObserver = class {
    constructor(_callback: ResizeObserverCallback) {}
    observe(_target: Element, _options?: ResizeObserverOptions) {}
    unobserve(_target: Element) {}
    disconnect() {}
  };
}

export async function cleanup() {
  await Promise.all(mounted.splice(0).map((component) => unmount(component)));
  document.body.replaceChildren();
}

export function render(group: EventGroup) {
  const target = document.body.appendChild(document.createElement('div'));
  mounted.push(
    mount(GroupDetailsRow, {
      target,
      props: { group, canvasWidth: 600, y: 0 },
    }),
  );
  flushSync();
  return target;
}
