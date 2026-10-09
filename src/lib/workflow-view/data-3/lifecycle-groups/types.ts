import type { HistoryEventId } from '../history-events/types';

/** The semantic kind of a history event lifecycle. */
type LifecycleKind =
  | 'workflow'
  | 'activity'
  | 'child-workflow'
  | 'external-signal'
  | 'nexus-operation'
  | 'timer'
  | 'update'
  | 'event';

/** Identifies a lifecycle within one workflow execution. */
export type LifecycleReference = Readonly<{
  kind: LifecycleKind;
  headEventId: HistoryEventId;
}>;

/** Related history events within one workflow execution. */
export type LifecycleGroup = Readonly<{
  revision: number;
  kind: LifecycleReference['kind'];
  headEventId: HistoryEventId;
  eventIds: ReadonlySet<HistoryEventId>;
}>;

export type LifecycleGroupMutable = Omit<
  LifecycleGroup,
  'eventIds' | 'revision'
> & {
  revision: number;
  eventIds: Set<HistoryEventId>;
};

type LifecycleGroupChange = Readonly<{
  type: 'LIFECYCLE_GROUP_CHANGED';
  headEventId: HistoryEventId;
}>;

export type LifecycleGroupsProjectionChange = LifecycleGroupChange;
