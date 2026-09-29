import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import type { WorkflowEvents } from '$lib/types/events';

import WorkflowJsonNavigator from './workflow-json-navigator.svelte';

// jsdom has no ResizeObserver; code blocks bind element size.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

const events = [
  { eventId: '1' },
  { eventId: '2' },
  { eventId: '3' },
] as unknown as WorkflowEvents;

const pressKey = (target: Element, code: string): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', {
    code,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  flushSync();
  return event;
};

describe('WorkflowJsonNavigator keyboard shortcuts', () => {
  let component: ReturnType<typeof mount> | undefined;

  const setup = () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    component = mount(WorkflowJsonNavigator, { target, props: { events } });
    return target;
  };

  afterEach(() => {
    if (component) unmount(component);
    component = undefined;
    document.body.innerHTML = '';
  });

  it('handles the next event shortcut', () => {
    const target = setup();
    const range = target.querySelector<HTMLInputElement>('input[type=range]');
    expect(range?.value).toBe('1');

    const event = pressKey(document.body, 'KeyL');

    expect(event.defaultPrevented).toBe(true);
    expect(range?.value).toBe('2');
  });

  it('ignores shortcuts typed into a text input', () => {
    const target = setup();
    const range = target.querySelector<HTMLInputElement>('input[type=range]');
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    const event = pressKey(input, 'KeyL');

    expect(event.defaultPrevented).toBe(false);
    expect(range?.value).toBe('1');
  });

  it('ignores shortcuts typed into a textarea', () => {
    const target = setup();
    const range = target.querySelector<HTMLInputElement>('input[type=range]');
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const event = pressKey(textarea, 'KeyL');

    expect(event.defaultPrevented).toBe(false);
    expect(range?.value).toBe('1');
  });
});
