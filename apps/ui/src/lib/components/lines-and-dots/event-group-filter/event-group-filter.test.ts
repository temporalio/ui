import { describe, expect, it } from 'vitest';

import type { EventGroupOption } from '$lib/services/grouped-event-buffer';

import {
  limitEventGroupOptions,
  matchesEventGroupSearch,
} from './event-group-filter';

const option = (
  id: string,
  overrides: Partial<EventGroupOption['group']> = {},
): EventGroupOption => ({
  group: { key: `label:${id}`, kind: 'label', id, ...overrides },
  eventCount: 1,
  firstEventId: 1,
});

describe('matchesEventGroupSearch', () => {
  it('matches everything when the search is empty', () => {
    expect(matchesEventGroupSearch(option('a'), 'Ascent', '  ')).toBe(true);
  });

  it('matches the label case-insensitively', () => {
    expect(matchesEventGroupSearch(option('a'), 'Ascent', 'ASC')).toBe(true);
  });

  it('matches the id and the signal or update name', () => {
    const update = option('adjust-orbit-SAT-A', {
      key: 'update:adjust-orbit-SAT-A',
      kind: 'update',
      name: 'adjustOrbit',
    });
    expect(matchesEventGroupSearch(update, 'Orbit burn', 'sat-a')).toBe(true);
    expect(matchesEventGroupSearch(update, 'Orbit burn', 'adjustorbit')).toBe(
      true,
    );
  });

  it('does not match unrelated text', () => {
    expect(matchesEventGroupSearch(option('a'), 'Ascent', 'payload')).toBe(
      false,
    );
  });
});

describe('limitEventGroupOptions', () => {
  const options = Array.from({ length: 5 }, (_, index) => option(`${index}`));

  it('returns every option under the limit', () => {
    expect(limitEventGroupOptions(options, new Set(), 10)).toBe(options);
  });

  it('keeps selected options when over the limit', () => {
    expect(
      limitEventGroupOptions(options, new Set(['label:4']), 2).map(
        ({ group }) => group.id,
      ),
    ).toEqual(['4', '0']);
  });

  it('shows every selected option even past the limit', () => {
    expect(
      limitEventGroupOptions(
        options,
        new Set(['label:2', 'label:3', 'label:4']),
        2,
      ).map(({ group }) => group.id),
    ).toEqual(['2', '3', '4']);
  });
});
