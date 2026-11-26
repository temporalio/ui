import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCountAnnouncer } from './count-announcer';

const message = (newItems: number) => `${newItems} new events loaded`;

function setup() {
  const announced: string[] = [];
  const announcer = createCountAnnouncer({
    onAnnounce: (m) => announced.push(m),
    getMessage: message,
  });
  return { announced, announcer };
}

describe('createCountAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays silent on the initial value', () => {
    const { announced, announcer } = setup();

    announcer.update(10);
    vi.advanceTimersByTime(300);

    expect(announced).toEqual([]);
  });

  it('announces the delta after the debounce window', () => {
    const { announced, announcer } = setup();

    announcer.update(10); // mount
    announcer.update(12); // +2
    vi.advanceTimersByTime(300);

    expect(announced).toContain('2 new events loaded');
  });

  it('coalesces a burst delivered across multiple updates into one total', () => {
    const { announced, announcer } = setup();

    announcer.update(10); // mount
    announcer.update(12); // +2
    announcer.update(14); // +2, still within the debounce window
    vi.advanceTimersByTime(300);

    expect(announced.filter((m) => m !== '')).toEqual(['4 new events loaded']);
  });

  it('does not announce until the debounce window elapses', () => {
    const { announced, announcer } = setup();

    announcer.update(10);
    announcer.update(12);
    vi.advanceTimersByTime(200); // before the 250ms window

    expect(announced).toEqual([]);
  });

  it('re-announces an identical consecutive count', () => {
    const { announced, announcer } = setup();

    announcer.update(10); // mount
    announcer.update(12); // +2
    vi.advanceTimersByTime(300);
    announcer.update(14); // +2 again — identical message
    vi.advanceTimersByTime(300);

    // Emitted twice (cleared to '' then re-set each time) — this is what
    // forces the live region to re-announce an identical count.
    expect(announced.filter((m) => m === '2 new events loaded').length).toBe(2);
  });

  it('does not announce when the count decreases or is unchanged', () => {
    const { announced, announcer } = setup();

    announcer.update(10);
    announcer.update(8);
    announcer.update(8);
    vi.advanceTimersByTime(300);

    expect(announced).toEqual([]);
  });

  it('clears pending timers on dispose', () => {
    const { announced, announcer } = setup();

    announcer.update(10);
    announcer.update(12);
    announcer.dispose();
    vi.advanceTimersByTime(300);

    expect(announced).toEqual([]);
  });
});
