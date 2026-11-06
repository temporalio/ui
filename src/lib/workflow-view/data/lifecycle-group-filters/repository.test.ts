import { describe, expect, it, vi } from 'vitest';

import type { QualifiedHistoryEvent } from '../history-events/types';
import type { EventKey, LifecycleKey } from '../identity-keys';
import { LifecycleFilterRepository } from './repository';
import type {
  LifecycleFilterDefinition,
  LifecycleFilterEventLookup,
  LifecycleFilterQuery,
} from './types';
import {
  getEventKey,
  getExecutionKey,
  getLifecycleFilterKey,
  getLifecycleKey,
} from '../identity-keys';
import type { LifecycleGroup, LifecycleKind } from '../lifecycle-groups/types';

function group(
  eventId: string,
  kind: LifecycleKind = 'activity',
  runId = 'run-1',
): LifecycleGroup {
  const executionKey = getExecutionKey({
    namespace: 'default',
    workflowId: 'workflow',
    runId,
  });
  const headEventKey = getEventKey(executionKey, eventId);
  return {
    lifecycleKey: getLifecycleKey(headEventKey),
    executionKey,
    headEventKey,
    kind,
    eventKeys: [headEventKey],
  };
}

function filter(name: string): LifecycleFilterQuery {
  return { type: 'filter', key: getLifecycleFilterKey(name) };
}

function definition(
  name: string,
  kind: LifecycleKind,
): LifecycleFilterDefinition {
  return {
    key: getLifecycleFilterKey(name),
    matches: (value) => value.kind === kind,
  };
}

function repository(
  definitions: readonly LifecycleFilterDefinition[] = [
    definition('activity', 'activity'),
    definition('timer', 'timer'),
  ],
  getEvent: LifecycleFilterEventLookup = () => undefined,
) {
  return new LifecycleFilterRepository(definitions, getEvent);
}

function listener() {
  return vi.fn<(keys: readonly LifecycleKey[]) => void>();
}

describe('LifecycleFilterRepository', () => {
  it('caches empty single-filter snapshots across equivalent query objects', () => {
    const repo = repository();
    const query = filter('activity');
    const keys = repo.getQuerySnapshot(query);

    expect(keys).toEqual([]);
    expect(repo.getQuerySnapshot(query)).toBe(keys);
    expect(repo.getQuerySnapshot(filter('activity'))).toBe(keys);
  });

  it('matches nothing for empty queries with an empty definition list', () => {
    const repo = repository([]);
    const first = group('1');
    repo.upsertGroups([first]);

    expect(repo.getQuerySnapshot({ type: 'all', queries: [] })).toEqual([]);
    expect(repo.getQuerySnapshot({ type: 'any', queries: [] })).toEqual([]);
  });

  it('rejects duplicate definition keys before evaluating predicates', () => {
    const matches = vi.fn(() => true);
    const getEvent = vi.fn(() => undefined);
    const key = getLifecycleFilterKey('duplicate');

    expect(() =>
      repository(
        [
          { key, matches },
          { key, matches },
        ],
        getEvent,
      ),
    ).toThrow();
    expect(matches).not.toHaveBeenCalled();
    expect(getEvent).not.toHaveBeenCalled();
  });

  it('evaluates only the supplied groups without revisiting other indexed groups', () => {
    const activityMatches = vi.fn(
      (value: LifecycleGroup) => value.kind === 'activity',
    );
    const timerMatches = vi.fn(
      (value: LifecycleGroup) => value.kind === 'timer',
    );
    const lookup: LifecycleFilterEventLookup = () => undefined;
    const repo = repository(
      [
        { key: getLifecycleFilterKey('activity'), matches: activityMatches },
        { key: getLifecycleFilterKey('timer'), matches: timerMatches },
      ],
      lookup,
    );
    const first = group('1');
    const second = group('2', 'timer');
    repo.upsertGroups([first, second]);
    activityMatches.mockClear();
    timerMatches.mockClear();
    const updated = group('1', 'timer');
    const third = group('3');
    repo.upsertGroups([updated, third]);

    for (const matches of [activityMatches, timerMatches]) {
      expect(matches).toHaveBeenCalledTimes(2);
      expect(matches).toHaveBeenCalledWith(updated, lookup);
      expect(matches).toHaveBeenCalledWith(third, lookup);

      expect(matches).not.toHaveBeenCalledWith(second, lookup);
    }
    expect(repo.getQuerySnapshot(filter('activity'))).toEqual([
      third.lifecycleKey,
    ]);
    expect(new Set(repo.getQuerySnapshot(filter('timer')))).toEqual(
      new Set([first.lifecycleKey, second.lifecycleKey]),
    );
  });

  it('reevaluates an identical group reference on separate upserts', () => {
    let enabled = true;
    const matches = vi.fn(() => enabled);
    const repo = repository([
      { key: getLifecycleFilterKey('enabled'), matches },
    ]);
    const first = group('1');
    repo.upsertGroups([first]);
    enabled = false;
    repo.upsertGroups([first]);

    expect(matches).toHaveBeenCalledTimes(2);
    expect(repo.getQuerySnapshot(filter('enabled'))).toEqual([]);
  });

  it('preserves caches and stays silent for detail-only changes and empty batches', () => {
    const repo = repository();
    const first = group('1');
    repo.upsertGroups([first]);
    const queries: LifecycleFilterQuery[] = [
      filter('activity'),
      { type: 'any', queries: [filter('activity')] },
      { type: 'all', queries: [] },
    ];
    const snapshots = queries.map((query) => repo.getQuerySnapshot(query));
    const changed = listener();
    for (const query of queries) repo.subscribeQuery(query, changed);

    repo.upsertGroups([
      { ...first, eventKeys: [...first.eventKeys, group('2').headEventKey] },
    ]);
    repo.upsertGroups([first]);
    repo.upsertGroups([]);

    queries.forEach((query, index) => {
      expect(repo.getQuerySnapshot(query)).toBe(snapshots[index]);
    });
    expect(changed).not.toHaveBeenCalled();
  });

  it('reuses single-filter arrays across unrelated membership changes and unmatched additions', () => {
    const repo = repository();
    const first = group('1');
    repo.upsertGroups([first, group('2', 'timer')]);
    const query = filter('activity');
    const keys = repo.getQuerySnapshot(query);

    repo.upsertGroups([group('2', 'workflow'), group('3', 'workflow')]);

    expect(repo.getQuerySnapshot(query)).toBe(keys);
    expect(repo.getQuerySnapshot(filter('activity'))).toBe(keys);
    repo.upsertGroups([group('4')]);
    expect(repo.getQuerySnapshot(query)).not.toBe(keys);
    expect(keys).toEqual([first.lifecycleKey]);
  });

  it('keeps cached snapshots point-in-time through removal and reentry', () => {
    const repo = repository();
    const first = group('1');
    const second = group('2');
    repo.upsertGroups([first, second]);
    const query: LifecycleFilterQuery = {
      type: 'any',
      queries: [filter('activity'), filter('timer')],
    };
    const bucketKeys = repo.getQuerySnapshot(filter('activity'));
    const compoundKeys = repo.getQuerySnapshot(query);
    repo.upsertGroups([group('1', 'workflow')]);
    const removed = repo.getQuerySnapshot(query);
    repo.upsertGroups([first]);

    expect(new Set(bucketKeys)).toEqual(
      new Set([first.lifecycleKey, second.lifecycleKey]),
    );
    expect(new Set(compoundKeys)).toEqual(new Set(bucketKeys));
    expect(removed).toEqual([second.lifecycleKey]);
    expect(new Set(repo.getQuerySnapshot(query))).toEqual(new Set(bucketKeys));
    expect(repo.getQuerySnapshot(query)).not.toBe(compoundKeys);
  });

  it('composes overlapping unions, intersections, and nested positive queries', () => {
    const first = group('1');
    const second = group('2', 'timer');
    const third = group('3');
    const repo = repository([
      definition('activity', 'activity'),
      {
        key: getLifecycleFilterKey('selected'),
        matches: (value) => value.lifecycleKey !== first.lifecycleKey,
      },
    ]);
    repo.upsertGroups([first, second, third]);
    const union: LifecycleFilterQuery = {
      type: 'any',
      queries: [filter('selected'), filter('activity'), filter('selected')],
    };
    const intersection: LifecycleFilterQuery = {
      type: 'all',
      queries: [filter('selected'), filter('activity')],
    };
    const nested: LifecycleFilterQuery = {
      type: 'all',
      queries: [union, intersection],
    };

    expect(new Set(repo.getQuerySnapshot(union))).toEqual(
      new Set([first.lifecycleKey, second.lifecycleKey, third.lifecycleKey]),
    );
    expect(repo.getQuerySnapshot(intersection)).toEqual([third.lifecycleKey]);
    expect(repo.getQuerySnapshot(nested)).toEqual([third.lifecycleKey]);
  });

  it('matches configured buckets explicitly and matches nothing for empty queries', () => {
    const repo = repository();
    const first = group('1');
    const second = group('2', 'timer');
    const unmatched = group('3', 'workflow');
    repo.upsertGroups([first, second, unmatched]);
    const configured: LifecycleFilterQuery = {
      type: 'any',
      queries: [filter('activity'), filter('timer')],
    };

    expect(new Set(repo.getQuerySnapshot(configured))).toEqual(
      new Set([first.lifecycleKey, second.lifecycleKey]),
    );
    expect(repo.getQuerySnapshot({ type: 'all', queries: [] })).toEqual([]);
    expect(repo.getQuerySnapshot({ type: 'any', queries: [] })).toEqual([]);
    repo.upsertGroups([group('1', 'workflow')]);
    expect(repo.getQuerySnapshot(configured)).toEqual([second.lifecycleKey]);
    repo.upsertGroups([first]);
    expect(new Set(repo.getQuerySnapshot(configured))).toEqual(
      new Set([first.lifecycleKey, second.lifecycleKey]),
    );
  });

  it('caches compound queries without reevaluating predicates and invalidates only on membership changes', () => {
    const matches = vi.fn((value: LifecycleGroup) => value.kind === 'activity');
    const repo = repository([
      { key: getLifecycleFilterKey('activity'), matches },
      definition('timer', 'timer'),
    ]);
    const first = group('1');
    repo.upsertGroups([first, group('2', 'timer')]);
    const query: LifecycleFilterQuery = {
      type: 'any',
      queries: [filter('activity')],
    };
    const before = repo.getQuerySnapshot(query);

    expect(repo.getQuerySnapshot(query)).toBe(before);
    expect(matches).toHaveBeenCalledTimes(2);
    repo.upsertGroups([group('2', 'workflow')]);
    const afterMembership = repo.getQuerySnapshot(query);
    expect(afterMembership).toEqual(before);
    expect(afterMembership).not.toBe(before);
    expect(repo.getQuerySnapshot(query)).toBe(afterMembership);
    repo.upsertGroups([group('3', 'workflow')]);
    const afterUnmatched = repo.getQuerySnapshot(query);
    expect(afterUnmatched).toBe(afterMembership);
    expect(repo.getQuerySnapshot(query)).toBe(afterUnmatched);
    expect(matches).toHaveBeenCalledTimes(4);
  });

  it('uses execution-qualified event lookup independently for each run', () => {
    const first = group('1', 'activity', 'run-1');
    const second = group('1', 'activity', 'run-2');
    const event: QualifiedHistoryEvent = {
      eventId: '1',
      eventType: 'ActivityTaskScheduled',
      eventTypeFormat: 'readable',
      eventTimeMs: 0,
      executionKey: second.executionKey,
      eventKey: second.headEventKey,
    };
    const events = new Map<EventKey, QualifiedHistoryEvent>([
      [second.headEventKey, event],
    ]);
    const getEvent = vi.fn((key: EventKey) => events.get(key));
    const repo = repository(
      [
        {
          key: getLifecycleFilterKey('scheduled'),
          matches: (value, lookup) =>
            lookup(value.headEventKey)?.eventType === 'ActivityTaskScheduled',
        },
      ],
      getEvent,
    );
    repo.upsertGroups([first, second]);

    expect(first.headEventKey).not.toBe(second.headEventKey);
    expect(first.lifecycleKey).not.toBe(second.lifecycleKey);
    expect(
      new Set(
        repo.getQuerySnapshot({ type: 'any', queries: [filter('scheduled')] }),
      ),
    ).toEqual(new Set([second.lifecycleKey]));
    expect(repo.getQuerySnapshot(filter('scheduled'))).toEqual([
      second.lifecycleKey,
    ]);
    expect(getEvent).toHaveBeenCalledTimes(2);
    expect(getEvent).toHaveBeenCalledWith(first.headEventKey);
    expect(getEvent).toHaveBeenCalledWith(second.headEventKey);
  });

  it('emits the current cached snapshot only when requested', () => {
    const repo = repository();
    const query = filter('activity');
    const current = listener();
    const silent = listener();
    const explicitlySilent = listener();
    repo.subscribeQuery(query, current, { emitCurrentSnapshot: true });
    repo.subscribeQuery(query, silent);
    repo.subscribeQuery(query, explicitlySilent, {
      emitCurrentSnapshot: false,
    });

    expect(current).toHaveBeenCalledExactlyOnceWith(
      repo.getQuerySnapshot(query),
    );
    expect(current.mock.calls[0]?.[0]).toBe(repo.getQuerySnapshot(query));
    expect(silent).not.toHaveBeenCalled();
    expect(explicitlySilent).not.toHaveBeenCalled();
    const first = group('1');
    repo.upsertGroups([first]);
    expect(current).toHaveBeenLastCalledWith([first.lifecycleKey]);
    expect(silent).toHaveBeenCalledExactlyOnceWith([first.lifecycleKey]);
    expect(explicitlySilent).toHaveBeenCalledExactlyOnceWith([
      first.lifecycleKey,
    ]);
  });

  it('scopes nested subscriptions to their referenced filter memberships', () => {
    const repo = repository();
    const query: LifecycleFilterQuery = {
      type: 'all',
      queries: [
        { type: 'any', queries: [filter('activity'), filter('activity')] },
      ],
    };
    const changed = listener();
    repo.subscribeQuery(query, changed);
    repo.upsertGroups([group('1', 'timer')]);
    repo.upsertGroups([group('1', 'workflow'), group('2', 'workflow')]);
    expect(changed).not.toHaveBeenCalled();

    const first = group('3');
    repo.upsertGroups([first]);
    expect(changed).toHaveBeenCalledExactlyOnceWith([first.lifecycleKey]);
  });

  it('notifies once after all memberships in a batch are updated', () => {
    const repo = repository();
    const query: LifecycleFilterQuery = {
      type: 'any',
      queries: [filter('activity'), filter('timer')],
    };
    const changed = listener();
    repo.subscribeQuery(query, changed);
    const first = group('1');
    const second = group('2', 'timer');
    repo.upsertGroups([first, second]);

    expect(changed).toHaveBeenCalledTimes(1);
    expect(new Set(changed.mock.calls[0]?.[0])).toEqual(
      new Set([first.lifecycleKey, second.lifecycleKey]),
    );
    expect(changed.mock.calls[0]?.[0]).toBe(repo.getQuerySnapshot(query));
  });

  it('stays silent for unmatched additions with empty and nested positive queries', () => {
    const repo = repository();
    const queries: LifecycleFilterQuery[] = [
      { type: 'any', queries: [filter('activity'), filter('timer')] },
      { type: 'all', queries: [] },
      {
        type: 'any',
        queries: [{ type: 'all', queries: [] }, filter('activity')],
      },
      { type: 'all', queries: [{ type: 'any', queries: [] }] },
    ];
    const subscribers = queries.map((query) => {
      const changed = listener();
      repo.subscribeQuery(query, changed);
      return changed;
    });
    const unmatched = group('1', 'workflow');
    repo.upsertGroups([unmatched]);
    for (const changed of subscribers) {
      expect(changed).not.toHaveBeenCalled();
    }
    repo.upsertGroups([unmatched]);
    for (const changed of subscribers) expect(changed).not.toHaveBeenCalled();
  });

  it('suppresses unchanged intersections and empty all and any queries', () => {
    const first = group('1');
    const repo = repository([
      definition('activity', 'activity'),
      {
        key: getLifecycleFilterKey('selected'),
        matches: (value) => value.lifecycleKey === first.lifecycleKey,
      },
    ]);
    repo.upsertGroups([first]);
    const intersection: LifecycleFilterQuery = {
      type: 'all',
      queries: [filter('activity'), filter('selected')],
    };
    const unchanged = listener();
    const empty = listener();
    const emptyAll = listener();
    repo.subscribeQuery(intersection, unchanged);
    repo.subscribeQuery({ type: 'any', queries: [] }, empty);
    repo.subscribeQuery({ type: 'all', queries: [] }, emptyAll);
    repo.upsertGroups([group('2')]);

    expect(unchanged).not.toHaveBeenCalled();
    expect(empty).not.toHaveBeenCalled();
    expect(emptyAll).not.toHaveBeenCalled();
    repo.upsertGroups([group('2', 'workflow')]);
    expect(unchanged).not.toHaveBeenCalled();
    expect(empty).not.toHaveBeenCalled();
    expect(emptyAll).not.toHaveBeenCalled();
    repo.upsertGroups([group('1', 'workflow')]);
    expect(unchanged).toHaveBeenCalledExactlyOnceWith([]);
  });

  it('suppresses callbacks when only natural union iteration order changes', () => {
    const repo = repository();
    const first = group('1');
    const second = group('2', 'timer');
    repo.upsertGroups([first, second]);
    const query: LifecycleFilterQuery = {
      type: 'any',
      queries: [filter('activity'), filter('timer')],
    };
    const before = repo.getQuerySnapshot(query);
    const changed = listener();
    repo.subscribeQuery(query, changed);
    repo.upsertGroups([group('1', 'timer'), group('2')]);

    expect(new Set(repo.getQuerySnapshot(query))).toEqual(new Set(before));
    expect(changed).not.toHaveBeenCalled();
    repo.upsertGroups([group('1', 'workflow')]);
    expect(changed).toHaveBeenCalledExactlyOnceWith([second.lifecycleKey]);
  });

  it('unsubscribes independently for subscribers sharing a query', () => {
    const repo = repository();
    const query = filter('activity');
    const first = listener();
    const second = listener();
    const unsubscribeFirst = repo.subscribeQuery(query, first);
    const unsubscribeSecond = repo.subscribeQuery(query, second);
    unsubscribeFirst();
    unsubscribeFirst();
    repo.upsertGroups([group('1')]);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith([group('1').lifecycleKey]);
    unsubscribeSecond();
    repo.upsertGroups([group('2')]);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not scan Map keys for sparse single-filter, union, or intersection reads', () => {
    const groups = Array.from({ length: 1000 }, (_, index) =>
      group(String(index)),
    );
    const first = group('0');
    const second = group('1');
    const repo = repository([
      {
        key: getLifecycleFilterKey('first'),
        matches: (value) =>
          value.kind === 'activity' &&
          value.lifecycleKey === first.lifecycleKey,
      },
      {
        key: getLifecycleFilterKey('pair'),
        matches: (value) =>
          value.kind === 'activity' &&
          (value.lifecycleKey === first.lifecycleKey ||
            value.lifecycleKey === second.lifecycleKey),
      },
    ]);
    repo.upsertGroups(groups);
    const readWithoutKeyScans = () => {
      const keys = vi.spyOn(Map.prototype, 'keys');
      try {
        const results = [
          repo.getQuerySnapshot(filter('first')),
          repo.getQuerySnapshot({
            type: 'any',
            queries: [filter('pair'), filter('first')],
          }),
          repo.getQuerySnapshot({
            type: 'all',
            queries: [filter('pair'), filter('first')],
          }),
          repo.getQuerySnapshot({
            type: 'all',
            queries: [filter('first'), filter('pair')],
          }),
        ];
        return {
          results: results.map((result) => new Set(result)),
          scans: keys.mock.calls.length,
        };
      } finally {
        keys.mockRestore();
      }
    };

    const before = readWithoutKeyScans();
    expect(before.scans).toBe(0);
    expect(before.results).toEqual([
      new Set([first.lifecycleKey]),
      new Set([first.lifecycleKey, second.lifecycleKey]),
      new Set([first.lifecycleKey]),
      new Set([first.lifecycleKey]),
    ]);
    repo.upsertGroups([group('0', 'workflow')]);
    const after = readWithoutKeyScans();
    expect(after.scans).toBe(0);
    expect(after.results).toEqual([
      new Set(),
      new Set([second.lifecycleKey]),
      new Set(),
      new Set(),
    ]);
  });
});
