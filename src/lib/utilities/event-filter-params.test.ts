import { describe, expect, it, vi } from 'vitest';

import {
  parseEventFilterParams,
  updateEventFilterParams,
} from './event-filter-params';

describe('parseEventFilterParams', () => {
  it('defaults refresh_off to false when param absent', () => {
    const url = new URL('http://localhost/');
    const params = parseEventFilterParams(url);
    expect(params.refresh_off).toBe(false);
  });

  it('parses refresh_off=true correctly', () => {
    const url = new URL('http://localhost/?refresh_off=true');
    const params = parseEventFilterParams(url);
    expect(params.refresh_off).toBe(true);
  });

  it('parses refresh_off=false correctly', () => {
    const url = new URL('http://localhost/?refresh_off=false');
    const params = parseEventFilterParams(url);
    expect(params.refresh_off).toBe(false);
  });

  it('defaults sort to descending when absent', () => {
    const url = new URL('http://localhost/');
    const params = parseEventFilterParams(url);
    expect(params.sort).toBe('descending');
  });

  it('round-trips opaque event group marker keys', async () => {
    const url = new URL('http://localhost/');
    const mockGoto = vi.fn((_href: string) => Promise.resolve());
    const eventGroups = ['label:checkout,row-1', 'update:update/1'];

    await updateEventFilterParams(url, { eventGroups }, mockGoto as never);

    const calledUrl = mockGoto.mock.calls[0][0];
    expect(parseEventFilterParams(new URL(calledUrl, url)).eventGroups).toEqual(
      eventGroups,
    );
  });
});

describe('updateEventFilterParams', () => {
  it('adds refresh_off=true to URL when toggling on', async () => {
    const url = new URL('http://localhost/');
    const navigated: string[] = [];
    const mockGoto = vi.fn((href: string) => {
      navigated.push(href);
      return Promise.resolve();
    });

    await updateEventFilterParams(
      url,
      { refresh_off: true },
      mockGoto as never,
    );

    expect(mockGoto).toHaveBeenCalledOnce();
    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).toContain('refresh_off=true');
  });

  it('removes refresh_off param when toggling off', async () => {
    const url = new URL('http://localhost/?refresh_off=true');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      url,
      { refresh_off: false },
      mockGoto as never,
    );

    expect(mockGoto).toHaveBeenCalledOnce();
    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('refresh_off');
  });

  it('preserves existing query params when updating refresh_off', async () => {
    const url = new URL('http://localhost/?sort=ascending');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      url,
      { refresh_off: true },
      mockGoto as never,
    );

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).toContain('sort=ascending');
    expect(calledUrl).toContain('refresh_off=true');
  });
});
