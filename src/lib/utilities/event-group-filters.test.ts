import { describe, expect, it } from 'vitest';

import { dotColors } from '$lib/components/lines-and-dots/colors';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { EventClassification } from '$lib/types/events';

import {
  countBy,
  filterableEventClassifications,
  filterEventGroups,
  getGroupAttempt,
  getGroupClassification,
  groupHasAttribute,
  isGroupCompletedWithRetries,
  isGroupRetried,
} from './event-group-filters';

const startedEvent = (attempt: number) => ({
  activityTaskStartedEventAttributes: { attempt },
  attributes: { attempt },
});

const group = (overrides: Partial<EventGroup> = {}): EventGroup =>
  ({
    category: 'activity',
    classification: 'Scheduled',
    finalClassification: 'Completed',
    isPending: false,
    pendingActivity: undefined,
    eventList: [],
    ...overrides,
  }) as unknown as EventGroup;

describe('getGroupClassification', () => {
  it('prefers finalClassification over the initial classification', () => {
    expect(
      getGroupClassification(
        group({ classification: 'Scheduled', finalClassification: 'Failed' }),
      ),
    ).toBe('Failed');
  });

  it('falls back to classification when there is no final one', () => {
    expect(
      getGroupClassification(
        group({ classification: 'Signaled', finalClassification: undefined }),
      ),
    ).toBe('Signaled');
  });
});

describe('getGroupAttempt', () => {
  it('reads the attempt off a pending activity', () => {
    expect(
      getGroupAttempt(group({ pendingActivity: { attempt: 4 } as never })),
    ).toBe(4);
  });

  it('reads the attempt off the ActivityTaskStarted event', () => {
    expect(
      getGroupAttempt(group({ eventList: [startedEvent(3)] as never })),
    ).toBe(3);
  });

  it('returns 0 for non-activity groups', () => {
    expect(
      getGroupAttempt(
        group({ category: 'timer', eventList: [startedEvent(3)] as never }),
      ),
    ).toBe(0);
  });

  it('returns 0 when the group has no started event', () => {
    expect(getGroupAttempt(group())).toBe(0);
  });
});

describe('isGroupRetried', () => {
  it('is false for a first attempt', () => {
    expect(
      isGroupRetried(group({ eventList: [startedEvent(1)] as never })),
    ).toBe(false);
  });

  it('is true past the first attempt', () => {
    expect(
      isGroupRetried(group({ eventList: [startedEvent(2)] as never })),
    ).toBe(true);
  });
});

describe('isGroupCompletedWithRetries', () => {
  it('is true for a retried group that ended completed', () => {
    expect(
      isGroupCompletedWithRetries(
        group({
          eventList: [startedEvent(2)] as never,
          finalClassification: 'Completed',
        }),
      ),
    ).toBe(true);
  });

  it('is false for a retried group that ended failed', () => {
    expect(
      isGroupCompletedWithRetries(
        group({
          eventList: [startedEvent(2)] as never,
          finalClassification: 'Failed',
        }),
      ),
    ).toBe(false);
  });

  it('is false for a completed group with no retries', () => {
    expect(
      isGroupCompletedWithRetries(
        group({
          eventList: [startedEvent(1)] as never,
          finalClassification: 'Completed',
        }),
      ),
    ).toBe(false);
  });
});

describe('groupHasAttribute', () => {
  it('matches pending groups', () => {
    expect(groupHasAttribute(group({ isPending: true }), 'pending')).toBe(true);
    expect(groupHasAttribute(group({ isPending: false }), 'pending')).toBe(
      false,
    );
  });

  it('matches retried groups', () => {
    expect(
      groupHasAttribute(
        group({ eventList: [startedEvent(2)] as never }),
        'retried',
      ),
    ).toBe(true);
  });
});

describe('filterEventGroups', () => {
  const allCategories = ['activity', 'timer', 'signal'] as never;
  const allClassifications = [
    ...filterableEventClassifications,
  ] as EventClassification[];

  const completedActivity = group({
    category: 'activity',
    finalClassification: 'Completed',
  });
  const failedTimer = group({
    category: 'timer',
    finalClassification: 'Failed',
  });
  const pendingSignal = group({
    category: 'signal',
    finalClassification: 'Canceled',
    isPending: true,
  });

  const groups = [completedActivity, failedTimer, pendingSignal];

  it('passes everything through when both exhaustive facets are full', () => {
    expect(
      filterEventGroups(groups, {
        categories: allCategories,
        classifications: allClassifications,
        attributes: [],
      }),
    ).toEqual(groups);
  });

  it('filters by category', () => {
    expect(
      filterEventGroups(groups, {
        categories: ['activity'] as never,
        classifications: allClassifications,
        attributes: [],
      }),
    ).toEqual([completedActivity]);
  });

  it('filters by final classification, not the initial one', () => {
    expect(
      filterEventGroups(groups, {
        categories: allCategories,
        classifications: ['Failed'] as never,
        attributes: [],
      }),
    ).toEqual([failedTimer]);
  });

  it('ANDs across facets', () => {
    expect(
      filterEventGroups(groups, {
        categories: ['activity'] as never,
        classifications: ['Failed'] as never,
        attributes: [],
      }),
    ).toEqual([]);
  });

  it('treats an empty attribute list as no constraint', () => {
    expect(
      filterEventGroups(groups, {
        categories: allCategories,
        classifications: allClassifications,
        attributes: [],
      }),
    ).toHaveLength(3);
  });

  it('ANDs attributes against the other facets', () => {
    expect(
      filterEventGroups(groups, {
        categories: allCategories,
        classifications: allClassifications,
        attributes: ['pending'],
      }),
    ).toEqual([pendingSignal]);
  });

  it('ORs within the attribute facet', () => {
    const retriedActivity = group({
      category: 'activity',
      finalClassification: 'Completed',
      eventList: [startedEvent(2)] as never,
    });
    expect(
      filterEventGroups([...groups, retriedActivity], {
        categories: allCategories,
        classifications: allClassifications,
        attributes: ['pending', 'retried'],
      }),
    ).toEqual([pendingSignal, retriedActivity]);
  });

  it('returns nothing when a facet is emptied', () => {
    expect(
      filterEventGroups(groups, {
        categories: [],
        classifications: allClassifications,
        attributes: [],
      }),
    ).toEqual([]);
  });

  it.each(['Unspecified', 'Scheduled', 'Started', 'Initiated', 'New'])(
    'exempts %s groups from the status facet',
    (classification) => {
      const exempt = group({
        category: 'activity',
        finalClassification: classification as EventClassification,
      });
      expect(
        filterEventGroups([completedActivity, exempt], {
          categories: allCategories,
          classifications: [],
          attributes: [],
        }),
      ).toEqual([exempt]);
    },
  );

  it('still applies the other facets to exempt groups', () => {
    const exempt = group({
      category: 'timer',
      finalClassification: 'Unspecified',
    });
    expect(
      filterEventGroups([exempt], {
        categories: ['activity'] as never,
        classifications: allClassifications,
        attributes: [],
      }),
    ).toEqual([]);
  });

  it('keeps groups whose classification could not be resolved', () => {
    const unresolved = group({
      category: 'activity',
      classification: undefined,
      finalClassification: undefined,
    });
    expect(
      filterEventGroups([unresolved], {
        categories: allCategories,
        classifications: [],
        attributes: [],
      }),
    ).toEqual([unresolved]);
  });
});

describe('getGroupClassification for local activities', () => {
  const localActivity = (failure?: unknown) =>
    group({
      category: 'local-activity',
      classification: undefined,
      finalClassification: undefined,
      initialEvent: {
        markerRecordedEventAttributes: {
          markerName: 'LocalActivity',
          ...(failure ? { failure } : {}),
        },
      },
    } as never);

  it('reports a failed local activity as Failed', () => {
    expect(getGroupClassification(localActivity({ message: 'boom' }))).toBe(
      'Failed',
    );
  });

  it('reports a successful local activity as Completed', () => {
    expect(getGroupClassification(localActivity())).toBe('Completed');
  });

  it('brings local activities inside the status facet', () => {
    expect(
      filterEventGroups([localActivity({ message: 'boom' })], {
        categories: ['local-activity'] as never,
        classifications: ['Completed'] as never,
        attributes: [],
      }),
    ).toEqual([]);
  });
});

describe('filterableEventClassifications', () => {
  it('offers only the statuses an event row can end in', () => {
    expect(filterableEventClassifications).toEqual([
      'Completed',
      'Failed',
      'TimedOut',
      'Canceled',
      'Terminated',
      'Signaled',
      'Fired',
    ]);
  });

  it('excludes the workflow-row-only and unreachable classifications', () => {
    for (const classification of ['Running', 'Open', 'Unspecified'] as const) {
      expect(filterableEventClassifications).not.toContain(classification);
    }
  });

  it('every offered status has a real dot color, not the fallback', () => {
    const fallback = JSON.stringify(dotColors(undefined));
    for (const classification of filterableEventClassifications) {
      expect(JSON.stringify(dotColors(classification))).not.toBe(fallback);
    }
  });

  // The timeline draws Failed and Terminated with the same dot, so their chips
  // are deliberately identical too — the legend mirrors the graph rather than
  // inventing a distinction the graph does not make. Everything else differs.
  it('only Failed and Terminated share a swatch', () => {
    const colors = filterableEventClassifications.map((classification) =>
      JSON.stringify(dotColors(classification)),
    );
    expect(new Set(colors).size).toBe(
      filterableEventClassifications.length - 1,
    );
    expect(dotColors('Failed')).toEqual(dotColors('Terminated'));
  });
});

describe('countBy', () => {
  it('counts by the supplied key and omits empty buckets', () => {
    const groups = [
      group({ category: 'activity' }),
      group({ category: 'activity' }),
      group({ category: 'timer' }),
    ];
    expect(countBy(groups, (g) => g.category)).toEqual({
      activity: 2,
      timer: 1,
    });
  });
});
