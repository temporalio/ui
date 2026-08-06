import type { JsonValue } from '../browser/types';
import type {
  ExecutionObservation,
  ExecutionTerminalStatus,
} from '../browser/workbench-host';

export type OssObservationErrorReason =
  | 'forbidden'
  | 'invalid-response'
  | 'not-found'
  | 'rate-limited'
  | 'server-error'
  | 'transport-failure';

export class OssObservationError extends Error {
  reason: OssObservationErrorReason;

  constructor(reason: OssObservationErrorReason) {
    super('Observation paused');
    this.name = 'OssObservationError';
    this.reason = reason;
  }
}

const asRecord = (
  value: JsonValue | undefined,
): Record<string, JsonValue> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value
    : undefined;

const terminalStatuses: Record<string, ExecutionTerminalStatus> = {
  CANCELED: 'canceled',
  COMPLETED: 'completed',
  CONTINUED_AS_NEW: 'continued-as-new',
  FAILED: 'failed',
  TERMINATED: 'terminated',
  TIMED_OUT: 'timed-out',
};

const terminalStatusFor = (
  status: JsonValue | undefined,
  prefix: string,
): ExecutionTerminalStatus | undefined =>
  typeof status === 'string' && status.startsWith(prefix)
    ? terminalStatuses[status.slice(prefix.length)]
    : undefined;

export const toWorkflowObservation = (
  response: JsonValue,
): ExecutionObservation => {
  const status = asRecord(asRecord(response)?.workflowExecutionInfo)?.status;

  if (
    status === 'WORKFLOW_EXECUTION_STATUS_RUNNING' ||
    status === 'WORKFLOW_EXECUTION_STATUS_PAUSED'
  ) {
    return {
      state: 'running',
      snapshot: response,
      continuation: { kind: 'delay', afterMs: 1_000 },
    };
  }

  const terminalStatus = terminalStatusFor(
    status,
    'WORKFLOW_EXECUTION_STATUS_',
  );

  if (terminalStatus) {
    return {
      state: 'terminal',
      status: terminalStatus,
      snapshot: response,
    };
  }

  throw new OssObservationError('invalid-response');
};

const toLongPollObservation = (
  response: JsonValue,
  prefix: 'ACTIVITY_EXECUTION_STATUS_' | 'NEXUS_OPERATION_EXECUTION_STATUS_',
): ExecutionObservation => {
  const record = asRecord(response);
  const status = asRecord(record?.info)?.status;
  const token = record?.longPollToken;

  if (status === `${prefix}RUNNING` && typeof token === 'string' && token) {
    const { longPollToken: _longPollToken, ...snapshot } = record;

    return {
      state: 'running',
      snapshot,
      continuation: { kind: 'cursor', value: token },
    };
  }

  const terminalStatus = terminalStatusFor(status, prefix);

  if (terminalStatus) {
    const { longPollToken: _longPollToken, ...snapshot } = record ?? {};

    return { state: 'terminal', status: terminalStatus, snapshot };
  }

  throw new OssObservationError('invalid-response');
};

export const toActivityObservation = (
  response: JsonValue,
): ExecutionObservation =>
  toLongPollObservation(response, 'ACTIVITY_EXECUTION_STATUS_');

export const toNexusObservation = (response: JsonValue): ExecutionObservation =>
  toLongPollObservation(response, 'NEXUS_OPERATION_EXECUTION_STATUS_');
