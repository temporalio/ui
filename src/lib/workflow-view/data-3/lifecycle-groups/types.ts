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
export type LifecycleIdentity = Readonly<{
  kind: LifecycleKind;
  headEventId: HistoryEventId;
}>;

/** An observed closing outcome; absence does not prove a lifecycle is running. */
export type LifecycleTerminalOutcome =
  | 'completed'
  | 'failed'
  | 'timed-out'
  | 'canceled'
  | 'terminated'
  | 'continued-as-new';

/** Related history events and incrementally maintained lifecycle facts. */
export type LifecycleGroup = Readonly<{
  revision: number;
  kind: LifecycleIdentity['kind'];
  headEventId: HistoryEventId;
  eventIds: ReadonlySet<HistoryEventId>;
  hasPendingEvent: boolean;
  terminalEventId: HistoryEventId | null;
  terminalOutcome: LifecycleTerminalOutcome | null;
  activityId: string | null;
}>;

export type LifecycleGroupMutable = {
  -readonly [K in keyof Omit<LifecycleGroup, 'eventIds'>]: LifecycleGroup[K];
} & {
  eventIds: Set<HistoryEventId>;
};

type LifecycleGroupChange = Readonly<{
  type: 'LIFECYCLE_GROUP_CHANGED';
  headEventId: HistoryEventId;
}>;

export type LifecycleGroupsProjectionChange = LifecycleGroupChange;
