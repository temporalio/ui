import { describe, expect, it, vi } from 'vitest';

import type { EventGroupKey } from '$lib/models/event-history/event-group-markers';

import {
  getSharedFilterParams,
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

describe('event group filter params', () => {
  it('defaults to no event groups', () => {
    expect(
      parseEventFilterParams(new URL('http://localhost/')).eventGroups,
    ).toEqual([]);
  });

  it('round-trips event group keys containing separators', async () => {
    const keys: EventGroupKey[] = [
      'label:a,b',
      'update:adjust orbit',
      'event:18',
    ];
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      new URL('http://localhost/'),
      { eventGroups: keys },
      mockGoto,
    );

    const [href] = mockGoto.mock.calls[0] as unknown as [string];
    expect(
      parseEventFilterParams(new URL(href, 'http://localhost')).eventGroups,
    ).toEqual(keys);
  });

  it('removes the param when the selection is cleared', async () => {
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      new URL('http://localhost/?groups=label%3Aa'),
      { eventGroups: null },
      mockGoto,
    );

    const [href] = mockGoto.mock.calls[0] as unknown as [string];
    expect(href).not.toContain('groups=');
  });

  it('drops keys without a known kind', () => {
    expect(
      parseEventFilterParams(
        new URL('http://localhost/?groups=label%3Aa,phase,timer%3A5'),
      ).eventGroups,
    ).toEqual(['label:a']);
  });

  it('keeps malformed keys instead of throwing', () => {
    expect(
      parseEventFilterParams(new URL('http://localhost/?groups=label%3A%25E0'))
        .eventGroups,
    ).toEqual(['label:%E0']);
  });
});

describe('category filter params', () => {
  it('reads a missing category param as all categories', () => {
    expect(
      parseEventFilterParams(new URL('http://localhost/')).categories,
    ).toBeNull();
  });

  it('reads an empty category param as no categories', () => {
    expect(
      parseEventFilterParams(new URL('http://localhost/?category=')).categories,
    ).toEqual([]);
  });

  it('round-trips an explicit empty category list', async () => {
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      new URL('http://localhost/?category=activity&run=abc'),
      { categories: [] },
      mockGoto,
    );

    const [href] = mockGoto.mock.calls[0] as unknown as [string];
    const url = new URL(href, 'http://localhost');
    expect(url.searchParams.get('run')).toBe('abc');
    expect(parseEventFilterParams(url).categories).toEqual([]);
  });

  it('round-trips a category selection', async () => {
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      new URL('http://localhost/'),
      { categories: ['activity', 'timer'] },
      mockGoto,
    );

    const [href] = mockGoto.mock.calls[0] as unknown as [string];
    expect(
      parseEventFilterParams(new URL(href, 'http://localhost')).categories,
    ).toEqual(['activity', 'timer']);
  });

  it('removes the category param when all categories are selected', async () => {
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      new URL('http://localhost/?category='),
      { categories: null },
      mockGoto,
    );

    const [href] = mockGoto.mock.calls[0] as unknown as [string];
    expect(new URL(href, 'http://localhost').searchParams.has('category')).toBe(
      false,
    );
  });
});

describe('getSharedFilterParams', () => {
  it('keeps the shared filter params and drops the rest', () => {
    const url = new URL(
      'http://localhost/?sort=ascending&status=pending&page=2',
    );
    expect(getSharedFilterParams(url)).toEqual({
      sort: 'ascending',
      status: 'pending',
    });
  });

  it('keeps an empty category, which selects no event types', () => {
    const url = new URL('http://localhost/?category=');
    expect(getSharedFilterParams(url)).toEqual({ category: '' });
  });
});
