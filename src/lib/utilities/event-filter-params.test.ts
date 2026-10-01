import { describe, expect, it, vi } from 'vitest';

import {
  getSharedFilterParams,
  parseEventFilterParams,
  updateEventFilterParams,
} from './event-filter-params';

describe('parseEventFilterParams', () => {
  it('preserves following mode with shared workflow filters', () => {
    const url = new URL(
      'http://localhost/?follow_continues=on&sort=ascending&timeline_mode=full-duration&unrelated=value',
    );

    expect(getSharedFilterParams(url)).toEqual({
      sort: 'ascending',
      follow_continues: 'on',
      timeline_mode: 'full-duration',
    });
  });

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

  it('defaults the timeline to a fixed window', () => {
    const url = new URL('http://localhost/');

    expect(parseEventFilterParams(url).timelineDisplayMode).toBe(
      'fixed-window',
    );
  });

  it('parses the full-duration timeline mode', () => {
    const url = new URL('http://localhost/?timeline_mode=full-duration');

    expect(parseEventFilterParams(url).timelineDisplayMode).toBe(
      'full-duration',
    );
  });

  it('parses the classic timeline mode', () => {
    const url = new URL('http://localhost/?timeline_mode=classic');

    expect(parseEventFilterParams(url).timelineDisplayMode).toBe('classic');
  });

  it('shows containment groups when the param is absent', () => {
    const url = new URL('http://localhost/');

    expect(parseEventFilterParams(url).showGroups).toBe(true);
  });

  it('hides containment groups for show_groups=false', () => {
    const url = new URL('http://localhost/?show_groups=false');

    expect(parseEventFilterParams(url).showGroups).toBe(false);
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

  it('adds full-duration timeline mode to the URL', async () => {
    const url = new URL('http://localhost/?follow_continues=on');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      url,
      { timelineDisplayMode: 'full-duration' },
      mockGoto as never,
    );

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).toContain('timeline_mode=full-duration');
    expect(calledUrl).toContain('follow_continues=on');
  });

  it('removes timeline mode from the URL for the default fixed window', async () => {
    const url = new URL(
      'http://localhost/?timeline_mode=full-duration&sort=ascending',
    );
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      url,
      { timelineDisplayMode: 'fixed-window' },
      mockGoto as never,
    );

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('timeline_mode');
    expect(calledUrl).toContain('sort=ascending');
  });

  it('adds show_groups=false to the URL when hiding groups', async () => {
    const url = new URL('http://localhost/?timeline_mode=lanes');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      url,
      { showGroups: false },
      mockGoto as never,
    );

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).toContain('show_groups=false');
    expect(calledUrl).toContain('timeline_mode=lanes');
  });

  it('removes show_groups from the URL when showing groups again', async () => {
    const url = new URL(
      'http://localhost/?timeline_mode=lanes&show_groups=false',
    );
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(url, { showGroups: true }, mockGoto as never);

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).not.toContain('show_groups');
    expect(calledUrl).toContain('timeline_mode=lanes');
  });

  it('adds classic timeline mode to the URL', async () => {
    const url = new URL('http://localhost/');
    const mockGoto = vi.fn(() => Promise.resolve());

    await updateEventFilterParams(
      url,
      { timelineDisplayMode: 'classic' },
      mockGoto as never,
    );

    const calledUrl = mockGoto.mock.calls[0][0] as string;
    expect(calledUrl).toContain('timeline_mode=classic');
  });
});
