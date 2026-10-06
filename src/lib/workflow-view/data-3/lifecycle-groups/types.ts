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
  headEventId: string;
}>;

/** Related history events within one workflow execution. */
export type LifecycleGroup = Readonly<{
  revision: number;
  kind: LifecycleReference['kind'];
  headEventId: string;
  eventIds: ReadonlySet<string>;
}>;

export type LifecycleGroupMutable = Omit<
  LifecycleGroup,
  'eventIds' | 'revision'
> & {
  revision: number;
  eventIds: Set<string>;
};
