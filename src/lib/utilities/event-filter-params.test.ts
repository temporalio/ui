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

  it('returns null for absent facet params', () => {
    const params = parseEventFilterParams(new URL('http://localhost/'));
    expect(params.categories).toBeNull();
    expect(params.classifications).toBeNull();
    expect(params.attributes).toBeNull();
  });

  it('distinguishes an emptied facet from an absent one', () => {
    const params = parseEventFilterParams(
      new URL('http://localhost/?category=none&classification=none'),
    );
    expect(params.categories).toEqual([]);
    expect(params.classifications).toEqual([]);
  });

  it('parses comma-separated facet values', () => {
    const params = parseEventFilterParams(
      new URL(
        'http://localhost/?category=activity,timer&classification=Failed,TimedOut',
      ),
    );
    expect(params.categories).toEqual(['activity', 'timer']);
    expect(params.classifications).toEqual(['Failed', 'TimedOut']);
  });

  it('drops unrecognized category and classification values', () => {
    const params = parseEventFilterParams(
      new URL('http://localhost/?category=activty&classification=Running'),
    );
    expect(params.categories).toBeNull();
    expect(params.classifications).toBeNull();
  });

  it('keeps the valid members of a partly bogus list', () => {
    const params = parseEventFilterParams(
      new URL('http://localhost/?category=activity,activty,timer'),
    );
    expect(params.categories).toEqual(['activity', 'timer']);
  });

  it('drops unrecognized attribute values', () => {
    const params = parseEventFilterParams(
      new URL('http://localhost/?attribute=pending,bogus,retried'),
    );
    expect(params.attributes).toEqual(['pending', 'retried']);
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

  it('writes the none sentinel for an emptied exhaustive facet', async () => {
    const url = new URL('http://localhost/');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      url,
      { categories: [], classifications: [] },
      mockGoto as never,
    );

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).toContain('category=none');
    expect(calledUrl).toContain('classification=none');
  });

  it('drops the param when an exhaustive facet is reset to null', async () => {
    const url = new URL('http://localhost/?category=activity');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(url, { categories: null }, mockGoto as never);

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('category');
  });

  it('drops the attribute param when the refinement is empty', async () => {
    const url = new URL('http://localhost/?attribute=pending');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(url, { attributes: [] }, mockGoto as never);

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('attribute');
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
