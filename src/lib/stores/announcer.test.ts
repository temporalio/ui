import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAnnouncer } from './announcer';

describe('createAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no messages', () => {
    const announcer = createAnnouncer();
    expect(get(announcer.messages)).toEqual([]);
  });

  it('appends a polite message by default', () => {
    const announcer = createAnnouncer();
    announcer.announce('Saved');
    const messages = get(announcer.messages);
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe('Saved');
    expect(messages[0].politeness).toBe('polite');
    expect(messages[0].id).toBeTruthy();
  });

  it('appends an assertive message when requested', () => {
    const announcer = createAnnouncer();
    announcer.announce('Boom', 'assertive');
    expect(get(announcer.messages)[0].politeness).toBe('assertive');
  });

  it('gives identical consecutive messages distinct ids', () => {
    const announcer = createAnnouncer();
    announcer.announce('Same');
    announcer.announce('Same');
    const messages = get(announcer.messages);
    expect(messages).toHaveLength(2);
    expect(messages[0].id).not.toBe(messages[1].id);
  });

  it('removes a message after the timeout', () => {
    const announcer = createAnnouncer({ timeout: 1000 });
    announcer.announce('Temporary');
    expect(get(announcer.messages)).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(get(announcer.messages)).toHaveLength(0);
  });

  it('clear() empties the buffer', () => {
    const announcer = createAnnouncer();
    announcer.announce('a');
    announcer.announce('b');
    announcer.clear();
    expect(get(announcer.messages)).toHaveLength(0);
  });
});
