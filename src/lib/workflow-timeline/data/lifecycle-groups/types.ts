import type { EventKey, ExecutionKey, LifecycleKey } from '../identity-keys';

/** The semantic kind of a history event lifecycle. */
export type LifecycleKind =
  | 'activity'
  | 'child-workflow'
  | 'external-signal'
  | 'nexus-operation'
  | 'timer'
  | 'update'
  | 'workflow-task'
  | 'event';

/** Identifies a lifecycle within one workflow execution. */
export type LifecycleReference = Readonly<{
  kind: LifecycleKind;
  headEventId: string;
}>;

/** An immutable group of related history event keys. */
export type LifecycleGroup = Readonly<{
  lifecycleKey: LifecycleKey;
  executionKey: ExecutionKey;
  headEventKey: EventKey;
  kind: LifecycleKind;
  eventKeys: readonly EventKey[];
}>;

/** Notifies subscribers that lifecycle groups were added or replaced. */
export type LifecycleGroupsUpsertedNotification = Readonly<{
  type: 'LIFECYCLE_GROUPS_UPSERTED';
  groups: readonly LifecycleGroup[];
}>;

/** Provides a subscriber with the repository's current lifecycle groups. */
export type LifecycleGroupsSnapshotNotification = Readonly<{
  type: 'LIFECYCLE_GROUPS_SNAPSHOT';
  groups: readonly LifecycleGroup[];
}>;

/** A notification published by a lifecycle-group repository. */
export type LifecycleGroupRepositoryNotification =
  | LifecycleGroupsSnapshotNotification
  | LifecycleGroupsUpsertedNotification;

/** Receives notifications from a lifecycle group repository. */
export type LifecycleGroupRepositorySubscriber = (
  notification: LifecycleGroupRepositoryNotification,
) => void;
