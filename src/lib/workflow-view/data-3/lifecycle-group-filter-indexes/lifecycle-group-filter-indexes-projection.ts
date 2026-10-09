import type {
  LifecycleGroupFilterDefinition,
  LifecycleGroupFilterIndexProjectionChange,
  LifecycleGroupFilterKey,
} from './types';
import type { HistoryEventId } from '../history-events/types';
import type { LifecycleGroup } from '../lifecycle-groups/types';

export class LifecycleGroupsFilterIndexesProjection {
  private _definitions: readonly LifecycleGroupFilterDefinition[];
  private _filterIndex = new Map<
    LifecycleGroupFilterKey,
    Set<HistoryEventId>
  >();

  constructor(definitions: readonly LifecycleGroupFilterDefinition[] = []) {
    this._definitions = [...definitions];

    for (const definition of definitions) {
      if (this._filterIndex.has(definition.key)) {
        throw new Error(`Duplicate lifecycle group filter ${definition.key}`);
      }

      this._filterIndex.set(definition.key, new Set());
    }
  }

  /** Updates filter membership using the group's current known events. */
  updateGroup(
    group: LifecycleGroup,
    getEvent: Parameters<LifecycleGroupFilterDefinition['matches']>[1],
  ): LifecycleGroupFilterIndexProjectionChange[] | null {
    const changes: LifecycleGroupFilterIndexProjectionChange[] = [];

    for (const definition of this._definitions) {
      const members = this._filterIndex.get(definition.key);

      if (!members) {
        throw new Error(`Missing lifecycle group filter ${definition.key}`);
      }

      const matches = definition.matches(group, getEvent);
      if (matches === members.has(group.headEventId)) {
        continue;
      }

      if (matches) {
        members.add(group.headEventId);
      } else {
        members.delete(group.headEventId);
      }

      changes.push({
        type: 'LIFECYCLE_GROUP_FILTER_INDEX_CHANGED',
        lifecycleGroupFilterKey: definition.key,
      });
    }

    return changes.length ? changes : null;
  }

  /** Returns a live readonly view of matching lifecycle head IDs by filter. */
  get filterIndex(): ReadonlyMap<
    LifecycleGroupFilterKey,
    ReadonlySet<HistoryEventId>
  > {
    return this._filterIndex;
  }
}
