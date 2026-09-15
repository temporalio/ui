import { describe, expect, it } from 'vitest';

import type { EventGroupMarkerDescriptor } from '$lib/models/event-marker-groups';

import {
  EVENT_GROUP_FILTER_OPTION_LIMIT,
  limitEventGroupFilterOptions,
} from './event-group-filter';

const descriptor = (markerKey: string): EventGroupMarkerDescriptor => ({
  markerKey,
  eventGroupMarker: { label: { id: markerKey } },
  displayName: markerKey,
  eventCount: 1,
  firstEventId: '1',
});

describe('limitEventGroupFilterOptions', () => {
  it('caps rendered options while keeping selected markers visible', () => {
    const options = Array.from(
      { length: EVENT_GROUP_FILTER_OPTION_LIMIT + 2 },
      (_, index) => descriptor(`marker-${index}`),
    );

    const visible = limitEventGroupFilterOptions(
      options,
      new Set(['marker-101']),
    );

    expect(visible).toHaveLength(EVENT_GROUP_FILTER_OPTION_LIMIT);
    expect(visible[0].markerKey).toBe('marker-101');
  });
});
