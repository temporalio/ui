import { ApiObservationError } from './observation';
import type {
  BrowserWorkflowCatalogDescriptor,
  BrowserWorkflowCatalogExecution,
  JsonValue,
} from '../browser/types';
import type {
  EvidenceLink,
  LaunchOutcome,
  LaunchReference,
  LaunchTarget,
  ReadinessCheck,
  StartCommand,
  WorkbenchHost,
} from '../browser/workbench-host';

type LaunchRequestBase = {
  target: LaunchTarget;
  input: JsonValue;
  startOptions: JsonValue;
};

export type ApiLaunchRequest =
  | (LaunchRequestBase & {
      kind: 'workflow';
      workflowType: string;
      workflowId: string;
    })
  | (LaunchRequestBase & {
      kind: 'standalone-activity';
      activityType: string;
      activityId: string;
      timeouts: JsonValue;
      policies: JsonValue;
    })
  | (LaunchRequestBase & {
      kind: 'standalone-nexus-operation';
      endpoint: string;
      service: string;
      operation: string;
      operationId: string;
      policies: JsonValue;
    });

export type ApiLaunchResult =
  | { status: 'accepted'; runId?: string }
  | {
      status: 'rejected';
      reason: 'conflict' | 'forbidden' | 'invalid-request' | 'not-found';
    };

export type WorkbenchHostDependencies = {
  descriptors: readonly BrowserWorkflowCatalogDescriptor[];
  launch: (
    request: ApiLaunchRequest,
    signal?: AbortSignal,
  ) => Promise<ApiLaunchResult>;
  observe?: WorkbenchHost['observe'];
  checkWorker: (
    request: {
      namespace: string;
      taskQueue: string;
      taskQueueType: 1 | 2 | 3;
    },
    signal?: AbortSignal,
  ) => Promise<boolean>;
  checkNexusEndpoint: (
    request: { namespace: string; endpoint: string },
    signal?: AbortSignal,
  ) => Promise<boolean>;
  createEvidenceHref: (
    reference: LaunchReference & { runId: string },
  ) => string;
};

const targetFor = (
  execution: BrowserWorkflowCatalogExecution,
): LaunchTarget => ({
  targetId: execution.targetId,
  namespace: execution.namespace,
  taskQueue: execution.taskQueue,
});

const configuredExecutionId = (
  descriptor: BrowserWorkflowCatalogDescriptor,
  startOptions: JsonValue,
): string | undefined => {
  if (
    typeof startOptions !== 'object' ||
    startOptions === null ||
    Array.isArray(startOptions)
  ) {
    return undefined;
  }

  const optionName =
    descriptor.execution.kind === 'workflow'
      ? 'workflowId'
      : descriptor.execution.kind === 'standalone-activity'
        ? 'activityId'
        : 'operationId';
  const value = startOptions[optionName];

  return typeof value === 'string' && value ? value : undefined;
};

const launchRequestFor = (
  descriptor: BrowserWorkflowCatalogDescriptor,
  command: StartCommand,
  executionId: string,
): ApiLaunchRequest => {
  const { execution } = descriptor;
  const base = {
    target: targetFor(execution),
    input: command.input,
    startOptions: command.startOptions,
  };

  if (execution.kind === 'workflow') {
    return {
      ...base,
      kind: execution.kind,
      workflowType: execution.workflowType,
      workflowId: executionId,
    };
  }

  if (execution.kind === 'standalone-activity') {
    return {
      ...base,
      kind: execution.kind,
      activityType: execution.activityType,
      activityId: executionId,
      timeouts: execution.timeouts,
      policies: execution.policies,
    };
  }

  return {
    ...base,
    kind: execution.kind,
    endpoint: execution.endpoint,
    service: execution.service,
    operation: execution.operation,
    operationId: executionId,
    policies: execution.policies,
  };
};

export const assembleWorkbenchHost = ({
  descriptors,
  launch,
  observe,
  checkWorker,
  checkNexusEndpoint,
  createEvidenceHref,
}: WorkbenchHostDependencies): WorkbenchHost => {
  const descriptorsById = new Map(
    descriptors.map((descriptor) => {
      const snapshot = structuredClone(descriptor);

      return [snapshot.id, snapshot] as const;
    }),
  );

  return {
    start: async (command, signal): Promise<LaunchOutcome> => {
      const descriptor = descriptorsById.get(command.exampleId);

      if (!descriptor) {
        throw new Error(
          `Unknown workflow catalog example: ${command.exampleId}`,
        );
      }

      const executionId =
        configuredExecutionId(descriptor, command.startOptions) ??
        command.attempt.executionId;

      const reference: LaunchReference = {
        exampleId: descriptor.id,
        kind: descriptor.execution.kind,
        attempt: { ...command.attempt, executionId },
        target: targetFor(descriptor.execution),
      };

      if (!command.attempt.attemptId || !command.attempt.executionId) {
        return { status: 'rejected', reason: 'invalid-request', reference };
      }

      if (signal?.aborted) {
        return { status: 'rejected', reason: 'aborted', reference };
      }

      let result: ApiLaunchResult;

      try {
        result = await launch(
          launchRequestFor(descriptor, command, executionId),
          signal,
        );
      } catch {
        return {
          status: 'uncertain',
          reason: signal?.aborted
            ? 'aborted-after-dispatch'
            : 'transport-failure',
          reference,
        };
      }

      if (signal?.aborted) {
        return {
          status: 'uncertain',
          reason: 'aborted-after-dispatch',
          reference,
        };
      }

      if (
        result.status === 'accepted' &&
        typeof result.runId === 'string' &&
        result.runId
      ) {
        return {
          status: 'accepted',
          reference: { ...reference, runId: result.runId },
        };
      }

      if (result.status === 'accepted') {
        return {
          status: 'uncertain',
          reason: 'unusable-response',
          reference,
        };
      }

      return {
        status: 'rejected',
        reason: result.reason,
        reference,
      };
    },
    checkReadiness: async (exampleId, signal): Promise<ReadinessCheck[]> => {
      const descriptor = descriptorsById.get(exampleId);

      if (!descriptor) {
        throw new Error(`Unknown workflow catalog example: ${exampleId}`);
      }

      const taskQueueType =
        descriptor.execution.kind === 'workflow'
          ? 1
          : descriptor.execution.kind === 'standalone-activity'
            ? 2
            : 3;
      let state: ReadinessCheck['state'];

      try {
        state = (await checkWorker(
          {
            namespace: descriptor.execution.namespace,
            taskQueue: descriptor.execution.taskQueue,
            taskQueueType,
          },
          signal,
        ))
          ? 'ready'
          : 'unavailable';
      } catch {
        state = 'indeterminate';
      }

      const checks: ReadinessCheck[] = [
        { kind: 'worker', required: false, state, taskQueueType },
      ];

      if (descriptor.execution.kind === 'standalone-nexus-operation') {
        let endpointState: ReadinessCheck['state'];

        try {
          endpointState = (await checkNexusEndpoint(
            {
              namespace: descriptor.execution.namespace,
              endpoint: descriptor.execution.endpoint,
            },
            signal,
          ))
            ? 'ready'
            : 'unavailable';
        } catch {
          endpointState = 'indeterminate';
        }

        checks.push({
          kind: 'nexus-endpoint',
          required: true,
          state: endpointState,
        });
      }

      return checks;
    },
    observe: async (request, signal) => {
      if (!observe) throw new ApiObservationError('invalid-response');

      const descriptor = descriptorsById.get(request.reference.exampleId);
      const expectedTarget = descriptor
        ? targetFor(descriptor.execution)
        : undefined;
      const target = request.reference.target;

      if (
        !descriptor ||
        request.reference.kind !== descriptor.execution.kind ||
        !request.reference.attempt.attemptId ||
        !request.reference.attempt.executionId ||
        !request.reference.runId ||
        target.targetId !== expectedTarget?.targetId ||
        target.namespace !== expectedTarget?.namespace ||
        target.taskQueue !== expectedTarget?.taskQueue
      ) {
        throw new ApiObservationError('invalid-response');
      }

      return observe(request, signal);
    },
    evidenceLink: (outcome): EvidenceLink => ({
      href: createEvidenceHref(outcome.reference),
      label: 'Open details',
    }),
  };
};
