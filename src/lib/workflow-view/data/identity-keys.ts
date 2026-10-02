/** Stable serialized key for one logical workflow. */
export type WorkflowKey = `workflow:(${string})`;

/** Identifies one logical workflow within a namespace. */
export type WorkflowIdentity = Readonly<{
  namespace: string;
  workflowId: string;
}>;

/** Returns a stable key for a logical workflow. */
export function getWorkflowKey(identity: WorkflowIdentity): WorkflowKey {
  return `workflow:(${JSON.stringify({
    namespace: identity.namespace,
    workflowId: identity.workflowId,
  })})`;
}

/** Stable serialized key for one workflow execution. */
export type ExecutionKey = `execution:(${string})`;

/** Identifies one workflow execution within a namespace. */
export type ExecutionIdentity = Readonly<
  WorkflowIdentity & {
    runId: string;
  }
>;

/** Returns a stable key for a workflow execution. */
export function getExecutionKey(identity: ExecutionIdentity): ExecutionKey {
  return `execution:(${JSON.stringify({
    namespace: identity.namespace,
    workflowId: identity.workflowId,
    runId: identity.runId,
  })})`;
}

/** Compares numeric event ID strings without converting them to numbers. */
export function compareEventIds(left: string, right: string): number {
  const lengthDifference = left.length - right.length;

  if (lengthDifference) {
    return lengthDifference;
  }

  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

/** Stable execution-qualified key for one history event. */
export type EventKey = `event:(${string})`;

/** Returns an execution-qualified key for a history event. */
export function getEventKey(
  executionKey: ExecutionKey,
  eventId: string,
): EventKey {
  return `event:(${JSON.stringify({ executionKey, eventId })})`;
}

/** Stable execution-qualified key for one event lifecycle. */
export type LifecycleKey = `lifecycle:(${string})`;

/** Returns a stable key for an event lifecycle. */
export function getLifecycleKey(headEventKey: EventKey): LifecycleKey {
  return `lifecycle:(${JSON.stringify({ headEventKey })})`;
}

/** Stable execution-qualified key for an event marker group. */
export type EventMarkerGroupKey = `event-marker-group:(${string})`;

/** Identifies an explicit or implicit event marker. */
export type EventMarkerIdentity = Readonly<{
  type: 'label' | 'inbound-event' | 'inbound-update';
  id: string;
}>;

/** Returns a stable key for an event marker group. */
export function getEventMarkerGroupKey(
  executionKey: ExecutionKey,
  marker: EventMarkerIdentity,
): EventMarkerGroupKey {
  return `event-marker-group:(${JSON.stringify({ executionKey, ...marker })})`;
}

/** Stable serialized key for a named lifecycle filter. */
export type LifecycleFilterKey = `lifecycle-filter:(${string})`;

/** Returns a stable key for a named lifecycle filter. */
export function getLifecycleFilterKey(name: string): LifecycleFilterKey {
  return `lifecycle-filter:(${JSON.stringify({ name })})`;
}
