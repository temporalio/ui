import type {
  AttemptIdentity,
  ExecutionTerminalStatus,
  LaunchOutcome,
  LaunchTarget,
} from './workbench-host';

type LaunchLogReference = {
  exampleId: string;
  attempt: AttemptIdentity;
  target: LaunchTarget;
  runId?: string;
};

type LogFields = {
  exampleId: string;
  attemptId: string;
  executionId: string;
  targetId: string;
  namespace: string;
  taskQueue: string;
  runId?: string;
};

type LaunchRequestedEvent = LogFields & {
  component: 'catalog';
  event: 'launch';
  status: 'requested';
};

type LaunchOutcomeEvent = LogFields & {
  component: 'catalog';
  event: 'launch';
  status: LaunchOutcome['status'];
  reason?: string;
};

type ObservationEvent = LogFields & {
  component: 'catalog';
  event: 'observation';
  status: 'terminal' | 'paused';
  reason: ExecutionTerminalStatus | 'observation-error';
};

type LoggedLaunchOutcome =
  | LaunchOutcome
  | {
      status: 'rejected';
      reason: 'unable-to-start';
      reference: LaunchLogReference;
    };

const log = (
  event: LaunchRequestedEvent | LaunchOutcomeEvent | ObservationEvent,
) => console.info(JSON.stringify(event));

const launchFields = (reference: LaunchLogReference) => ({
  exampleId: reference.exampleId,
  attemptId: reference.attempt.attemptId,
  executionId: reference.attempt.executionId,
  targetId: reference.target.targetId,
  namespace: reference.target.namespace,
  taskQueue: reference.target.taskQueue,
  ...(reference.runId === undefined ? {} : { runId: reference.runId }),
});

export const logLaunchRequested = (reference: LaunchLogReference) => {
  log({
    component: 'catalog',
    event: 'launch',
    status: 'requested',
    ...launchFields(reference),
  });
};

export const logLaunchOutcome = (outcome: LoggedLaunchOutcome) => {
  log({
    component: 'catalog',
    event: 'launch',
    status: outcome.status,
    ...launchFields(outcome.reference),
    ...(outcome.status === 'accepted' ? {} : { reason: outcome.reason }),
  });
};

export const logObservationTerminal = (
  reference: LaunchLogReference,
  terminalStatus: ExecutionTerminalStatus,
) => {
  log({
    component: 'catalog',
    event: 'observation',
    status: 'terminal',
    reason: terminalStatus,
    ...launchFields(reference),
  });
};

export const logObservationPaused = (reference: LaunchLogReference) => {
  log({
    component: 'catalog',
    event: 'observation',
    status: 'paused',
    reason: 'observation-error',
    ...launchFields(reference),
  });
};
