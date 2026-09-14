import type { BrowserCatalogExecution, JsonValue } from './types';

export type AttemptIdentity = {
  attemptId: string;
  executionId: string;
};

export type LaunchTarget = {
  targetId: string;
  namespace: string;
  taskQueue: string;
};

export type StartCommand = {
  exampleId: string;
  attempt: AttemptIdentity;
  input: JsonValue;
  startOptions: JsonValue;
};

export type LaunchReference = {
  exampleId: string;
  kind: BrowserCatalogExecution['kind'];
  attempt: AttemptIdentity;
  target: LaunchTarget;
  runId?: string;
};

export type AcceptedLaunchOutcome = {
  status: 'accepted';
  reference: LaunchReference & { runId: string };
};

export type RejectedLaunchOutcome = {
  status: 'rejected';
  reason:
    | 'aborted'
    | 'conflict'
    | 'forbidden'
    | 'invalid-request'
    | 'not-found';
  reference: LaunchReference;
};

export type UncertainLaunchOutcome = {
  status: 'uncertain';
  reason: 'aborted-after-dispatch' | 'transport-failure' | 'unusable-response';
  reference: LaunchReference;
};

export type LaunchOutcome =
  | AcceptedLaunchOutcome
  | RejectedLaunchOutcome
  | UncertainLaunchOutcome;

export type ExecutionTerminalStatus =
  | 'canceled'
  | 'completed'
  | 'continued-as-new'
  | 'failed'
  | 'terminated'
  | 'timed-out';

export type ObservationRequest = {
  reference: AcceptedLaunchOutcome['reference'];
  continuation?: JsonValue;
};

export type RunningObservation = {
  state: 'running';
  snapshot: JsonValue;
  continuation: JsonValue;
};

export type TerminalObservation = {
  state: 'terminal';
  status: ExecutionTerminalStatus;
  snapshot: JsonValue;
};

export type ExecutionObservation = RunningObservation | TerminalObservation;

export type ReadinessState =
  | 'indeterminate'
  | 'ready'
  | 'skipped'
  | 'unavailable';

export type WorkerReadinessCheck = {
  kind: 'worker';
  required: false;
  state: ReadinessState;
  taskQueueType: 1 | 2 | 3;
};

export type NexusEndpointReadinessCheck = {
  kind: 'nexus-endpoint';
  required: true;
  state: ReadinessState;
  endpoint: string;
};

export type ReadinessCheck = NexusEndpointReadinessCheck | WorkerReadinessCheck;

export type EvidenceLink = {
  href: string;
  label: string;
};

export type WorkbenchHost = {
  start: (
    command: StartCommand,
    signal?: AbortSignal,
  ) => Promise<LaunchOutcome>;
  checkReadiness: (
    exampleId: string,
    signal?: AbortSignal,
  ) => Promise<ReadinessCheck[]>;
  observe: (
    request: ObservationRequest,
    signal: AbortSignal,
  ) => Promise<ExecutionObservation>;
  evidenceLink: (outcome: AcceptedLaunchOutcome) => EvidenceLink;
};

export type CatalogStartPolicy = {
  disableWriteActions: boolean;
  workflowStartsDisabled: boolean;
  namespaceWriteDisabled: (namespace: string) => boolean;
};

export const catalogStartAllowed = (
  descriptor: {
    execution: Pick<BrowserCatalogExecution, 'kind' | 'namespace'>;
  },
  policy: CatalogStartPolicy,
): boolean =>
  !policy.disableWriteActions &&
  !policy.namespaceWriteDisabled(descriptor.execution.namespace) &&
  !(descriptor.execution.kind === 'workflow' && policy.workflowStartsDisabled);

export const createAttemptIdentity = (
  createId: () => string = () => crypto.randomUUID(),
): AttemptIdentity => ({
  attemptId: createId(),
  executionId: createId(),
});
