import { afterEach, describe, expect, it, vi } from 'vitest';

import { clickoutside } from './outside-click';

const dispatch = (target: Element, type: string, init: MouseEventInit = {}) => {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      detail: 1,
      ...init,
    }),
  );
};

const getElement = (id: string): HTMLElement => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Test fixture is missing an element: #${id}`);
  return element;
};

describe('clickoutside', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  const setup = async () => {
    document.body.innerHTML = `
      <div id="container"><input id="inside" /></div>
      <div id="outside"></div>
    `;

    const node = getElement('container');
    const handler = vi.fn();
    const action = clickoutside(node, handler);

    // svelte/events defers attaching pointer listeners to a microtask
    await Promise.resolve();

    return {
      node,
      handler,
      action,
      inside: getElement('inside'),
      outside: getElement('outside'),
    };
  };

  it('calls the handler when a click starts and ends outside the node', async () => {
    const { handler, outside, action } = await setup();

    dispatch(outside, 'pointerdown');
    dispatch(outside, 'click');

    expect(handler).toHaveBeenCalledTimes(1);
    action.destroy();
  });

  it('does not call the handler when a click starts and ends inside the node', async () => {
    const { handler, inside, action } = await setup();

    dispatch(inside, 'pointerdown');
    dispatch(inside, 'click');

    expect(handler).not.toHaveBeenCalled();
    action.destroy();
  });

  it('does not call the handler when a drag starts inside the node and releases outside', async () => {
    const { handler, inside, action } = await setup();

    dispatch(inside, 'pointerdown');
    dispatch(document.body, 'click');

    expect(handler).not.toHaveBeenCalled();
    action.destroy();
  });

  it('still closes on the next click that originates outside the node', async () => {
    const { handler, inside, outside, action } = await setup();

    dispatch(inside, 'pointerdown');
    dispatch(document.body, 'click');

    dispatch(outside, 'pointerdown');
    dispatch(outside, 'click');

    expect(handler).toHaveBeenCalledTimes(1);
    action.destroy();
  });

  it('closes on a keyboard-activated click outside even after a press inside', async () => {
    const { handler, inside, outside, action } = await setup();

    dispatch(inside, 'pointerdown');
    dispatch(outside, 'click', { detail: 0 });

    expect(handler).toHaveBeenCalledTimes(1);
    action.destroy();
  });

  it('does not let a non-primary press inside suppress a later outside click', async () => {
    const { handler, inside, outside, action } = await setup();

    dispatch(inside, 'pointerdown', { button: 2 });
    dispatch(outside, 'click');

    expect(handler).toHaveBeenCalledTimes(1);
    action.destroy();
  });

  it('removes both listeners on destroy', async () => {
    const { handler, outside, action } = await setup();

    action.destroy();

    dispatch(outside, 'pointerdown');
    dispatch(outside, 'click');

    expect(handler).not.toHaveBeenCalled();
  });
});
