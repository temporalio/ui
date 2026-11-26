import { describe, expect, it, vi } from 'vitest';

import { composeEventHandlers } from './event-handlers';

describe('composeEventHandlers', () => {
  it('should call all provided handlers with the event', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    const event = new Event('click');

    composeEventHandlers(handlerA, handlerB)(event);

    expect(handlerA).toHaveBeenCalledWith(event);
    expect(handlerB).toHaveBeenCalledWith(event);
  });

  it('should skip undefined and null handlers', () => {
    const handler = vi.fn();
    const event = new Event('click');

    expect(() =>
      composeEventHandlers(undefined, handler, null)(event),
    ).not.toThrow();
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should call handlers in the order they were provided', () => {
    const calls: string[] = [];
    const handlerA = () => calls.push('a');
    const handlerB = () => calls.push('b');
    const handlerC = () => calls.push('c');

    composeEventHandlers(handlerA, handlerB, handlerC)(new Event('click'));

    expect(calls).toEqual(['a', 'b', 'c']);
  });
});
