import type {
  LifecycleFilterDefinition,
  LifecycleFilterEventLookup,
  LifecycleFilterQuery,
  LifecycleFilterQuerySubscriber,
} from './types';
import type { LifecycleFilterKey, LifecycleKey } from '../identity-keys';
import type { LifecycleGroup } from '../lifecycle-groups/types';

type MembershipChange = Readonly<{
  key: LifecycleFilterKey;
  type: 'add' | 'delete';
}>;

type QuerySubscription = {
  query: LifecycleFilterQuery;
  subscriber: LifecycleFilterQuerySubscriber;
  filterKeys: ReadonlySet<LifecycleFilterKey>;

  snapshot: readonly LifecycleKey[];
};

/** Indexes lifecycle filter membership and publishes query snapshots. */
export class LifecycleFilterRepository {
  private _membershipsByGroup = new Map<
    LifecycleKey,
    Set<LifecycleFilterKey>
  >();
  private _bucketsByKey = new Map<LifecycleFilterKey, Set<LifecycleKey>>();

  private _filters: readonly LifecycleFilterDefinition[];
  private _getEvent: LifecycleFilterEventLookup;

  private _subscriptions = new Set<QuerySubscription>();

  private _bucketSnapshotCache = new Map<
    LifecycleFilterKey,
    readonly LifecycleKey[]
  >();
  private _queryCache = new WeakMap<
    LifecycleFilterQuery,
    readonly LifecycleKey[]
  >();

  /** Creates an index with fixed filter definitions and canonical event lookup. */
  constructor(
    filters: readonly LifecycleFilterDefinition[],
    getEvent: LifecycleFilterEventLookup,
  ) {
    this._filters = filters;
    this._getEvent = getEvent;

    for (const definition of this._filters) {
      if (this._bucketsByKey.has(definition.key)) {
        throw new Error(`Duplicate lifecycle filter key: ${definition.key}`);
      }
      this._bucketsByKey.set(definition.key, new Set());
    }
  }

  /** Updates memberships for a batch of distinct lifecycle groups. */
  upsertGroups(groups: readonly LifecycleGroup[]): void {
    if (!groups.length) return;

    const changes: MembershipChange[] = [];

    for (const group of groups) {
      const groupKey = group.lifecycleKey;
      const matchingFilters = new Set<LifecycleFilterKey>();
      const previousFilters =
        this._membershipsByGroup.get(groupKey) ?? new Set<LifecycleFilterKey>();

      for (const filter of this._filters) {
        if (filter.matches(group, this._getEvent)) {
          matchingFilters.add(filter.key);
        }
      }

      for (const filterKey of previousFilters) {
        if (matchingFilters.has(filterKey)) {
          continue;
        }

        this._getBucket(filterKey).delete(groupKey);
        changes.push({ key: filterKey, type: 'delete' });
      }

      for (const filterKey of matchingFilters) {
        if (previousFilters.has(filterKey)) {
          continue;
        }

        this._getBucket(filterKey).add(groupKey);
        changes.push({ key: filterKey, type: 'add' });
      }

      this._membershipsByGroup.set(groupKey, matchingFilters);
    }

    if (!changes.length) return;

    for (const change of changes) {
      this._bucketSnapshotCache.delete(change.key);
    }

    this._queryCache = new WeakMap();
    this._notifyQueries(changes);
  }

  /** Returns cached query membership without presentation ordering. */
  getQuerySnapshot(query: LifecycleFilterQuery): readonly LifecycleKey[] {
    const cached = this._queryCache.get(query);
    if (cached) return cached;
    const keys =
      query.type === 'filter'
        ? this._getBucketSnapshot(query.key)
        : [...this._evaluateQuery(query)];
    this._queryCache.set(query, keys);
    return keys;
  }

  /** Observes query membership, optionally emitting its current snapshot; returns unsubscribe. */
  subscribeQuery(
    query: LifecycleFilterQuery,
    subscriber: LifecycleFilterQuerySubscriber,
    options?: { emitCurrentSnapshot?: boolean },
  ): () => void {
    const filterKeys = new Set<LifecycleFilterKey>();
    this._collectDependencies(query, filterKeys);
    const subscription: QuerySubscription = {
      query,
      subscriber,
      filterKeys,

      snapshot: this.getQuerySnapshot(query),
    };
    this._subscriptions.add(subscription);
    if (options?.emitCurrentSnapshot) subscriber(subscription.snapshot);
    return () => {
      this._subscriptions.delete(subscription);
    };
  }

  private _getBucketSnapshot(key: LifecycleFilterKey): readonly LifecycleKey[] {
    const cached = this._bucketSnapshotCache.get(key);
    if (cached) {
      return cached;
    }

    const snapshot = [...this._getBucket(key)];
    this._bucketSnapshotCache.set(key, snapshot);
    return snapshot;
  }

  private _getBucket(key: LifecycleFilterKey): Set<LifecycleKey> {
    const bucket = this._bucketsByKey.get(key);

    if (!bucket) {
      console.warn(`Unknown lifecycle filter: ${key}`);
      return new Set();
    }

    return bucket;
  }

  private _evaluateQuery(
    query: LifecycleFilterQuery,
  ): ReadonlySet<LifecycleKey> {
    if (query.type === 'filter') return this._getBucket(query.key);

    const buckets = query.queries.map((child) => this._evaluateQuery(child));
    if (query.type === 'any')
      return new Set(buckets.flatMap((bucket) => [...bucket]));
    const first = buckets[0];
    if (!first) return new Set();

    return new Set(
      [...first].filter((key) => buckets.every((bucket) => bucket.has(key))),
    );
  }

  private _collectDependencies(
    query: LifecycleFilterQuery,
    filterKeys: Set<LifecycleFilterKey>,
  ): void {
    if (query.type === 'filter') {
      this._getBucket(query.key);
      filterKeys.add(query.key);
      return;
    }

    for (const child of query.queries) {
      this._collectDependencies(child, filterKeys);
    }
  }

  private _notifyQueries(changes: readonly MembershipChange[]): void {
    for (const subscription of this._subscriptions) {
      const affected = changes.some((change) =>
        subscription.filterKeys.has(change.key),
      );
      if (!affected) continue;
      const snapshot = this.getQuerySnapshot(subscription.query);
      const previous = new Set(subscription.snapshot);
      if (
        snapshot.length === previous.size &&
        snapshot.every((key) => previous.has(key))
      )
        continue;
      subscription.snapshot = snapshot;
      subscription.subscriber(snapshot);
    }
  }
}
