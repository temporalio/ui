import type {
  LifecycleGroupFilterDefinition,
  LifecycleGroupFilterIndexProjectionChange,
  LifecycleGroupFilterKey,
} from './types';
import type { HistoryEventId } from '../history-events/types';
import type { LifecycleGroup } from '../lifecycle-groups/types';
import type { WorkflowExecutionDetails } from '../workflow-execution/types';

export class LifecycleGroupsFilterIndexesProjection {
  private _historyFilters: readonly Extract<
    LifecycleGroupFilterDefinition,
    { dependsOnExecutionDetails?: false }
  >[];
  private _detailsFilters: readonly Extract<
    LifecycleGroupFilterDefinition,
    { dependsOnExecutionDetails: true }
  >[];

  private _filterIndex = new Map<
    LifecycleGroupFilterKey,
    Set<HistoryEventId>
  >();

  constructor(definitions: readonly LifecycleGroupFilterDefinition[] = []) {
    const detailsFilters: Extract<
      LifecycleGroupFilterDefinition,
      { dependsOnExecutionDetails: true }
    >[] = [];
    const historyFilters: Extract<
      LifecycleGroupFilterDefinition,
      { dependsOnExecutionDetails?: false }
    >[] = [];

    for (const definition of definitions) {
      if (this._filterIndex.has(definition.key)) {
        throw new Error(`Duplicate lifecycle group filter ${definition.key}`);
      }

      this._filterIndex.set(definition.key, new Set());

      if (definition.dependsOnExecutionDetails) {
        detailsFilters.push(definition);
      } else {
        historyFilters.push(definition);
      }
    }

    this._detailsFilters = detailsFilters;
    this._historyFilters = historyFilters;
  }

  /** Updates all filters using the group's known events and latest details. */
  updateGroup(
    group: LifecycleGroup,
    getEvent: Parameters<LifecycleGroupFilterDefinition['matches']>[1],
    details: WorkflowExecutionDetails | null,
  ): LifecycleGroupFilterIndexProjectionChange[] | null {
    const historyChanges = this._updateGroup(
      group,
      getEvent,
      details,
      this._historyFilters,
    );

    const detailsChanges = this._updateGroup(
      group,
      getEvent,
      details,
      this._detailsFilters,
    );

    if (!historyChanges) {
      return detailsChanges;
    }

    if (!detailsChanges) {
      return historyChanges;
    }

    return [...historyChanges, ...detailsChanges];
  }

  /** Re-evaluates only details-dependent filters for the supplied groups. */
  updateExecutionDetails(
    groups: Iterable<LifecycleGroup>,
    getEvent: Parameters<LifecycleGroupFilterDefinition['matches']>[1],
    details: WorkflowExecutionDetails,
  ): LifecycleGroupFilterIndexProjectionChange[] | null {
    if (!this._detailsFilters.length) {
      return null;
    }

    const changes: LifecycleGroupFilterIndexProjectionChange[] = [];

    for (const group of groups) {
      const groupChanges = this._updateGroup(
        group,
        getEvent,
        details,
        this._detailsFilters,
      );

      if (groupChanges) {
        changes.push(...groupChanges);
      }
    }

    return changes.length ? changes : null;
  }

  private _updateGroup(
    group: LifecycleGroup,
    getEvent: Parameters<LifecycleGroupFilterDefinition['matches']>[1],
    details: WorkflowExecutionDetails | null,
    definitions: readonly LifecycleGroupFilterDefinition[],
  ): LifecycleGroupFilterIndexProjectionChange[] | null {
    const changes: LifecycleGroupFilterIndexProjectionChange[] = [];

    for (const definition of definitions) {
      const members = this._filterIndex.get(definition.key);

      if (!members) {
        throw new Error(`Missing lifecycle group filter ${definition.key}`);
      }

      const matches = definition.dependsOnExecutionDetails
        ? definition.matches(group, getEvent, details)
        : definition.matches(group, getEvent);

      const wasMatching = members.has(group.headEventId);

      if (matches === wasMatching) {
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
