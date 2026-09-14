import type { Payload, TaskQueueResponse } from '$lib/types';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import {
  routeForStandaloneActivityDetails,
  routeForStandaloneNexusOperationDetails,
  routeForWorkflow,
} from '$lib/utilities/route-for';
import { routeForApi } from '$lib/utilities/route-for-api';

import {
  ApiObservationError,
  toActivityObservation,
  toNexusObservation,
  toWorkflowObservation,
} from './observation';
import {
  type ApiLaunchRequest,
  type ApiLaunchResult,
  assembleWorkbenchHost,
} from './workbench-host';
import type { BrowserCatalogDescriptor, JsonValue } from '../browser/types';
import type {
  ExecutionObservation,
  LaunchReference,
  ObservationRequest,
} from '../browser/workbench-host';

type EncodeInput = (
  input: JsonValue,
  positional: boolean,
) => Promise<Payload[]>;

type ApiWorkbenchHostOptions = {
  descriptors: readonly BrowserCatalogDescriptor[];
  request?: typeof fetch;
  encodeInput?: EncodeInput;
  getIdentity?: () => string | undefined;
  createRequestId?: () => string;
};

const defaultEncodeInput: EncodeInput = async (input, positional) => {
  const values = positional && Array.isArray(input) ? input : [input];
  const encoded = await Promise.all(
    values.map((value) =>
      encodePayloads({
        input: stringifyWithBigInt(value),
        encoding: 'json/plain',
        encodeWithCodec: false,
      }),
    ),
  );

  return encoded.flatMap((payloads) => payloads ?? []);
};

const asRecord = (value: JsonValue): Record<string, JsonValue> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value
    : undefined;

const observationCursor = (
  continuation: JsonValue | undefined,
): string | undefined => {
  if (continuation === undefined) return undefined;

  const record = asRecord(continuation);
  const cursor = record?.value;

  if (record?.kind !== 'cursor' || typeof cursor !== 'string' || !cursor) {
    throw new ApiObservationError('invalid-response');
  }

  return cursor;
};

const waitForObservationDelay = async (
  continuation: JsonValue | undefined,
  signal: AbortSignal,
): Promise<void> => {
  if (continuation === undefined) return;

  const record = asRecord(continuation);
  const afterMs = record?.afterMs;

  if (
    record?.kind !== 'delay' ||
    typeof afterMs !== 'number' ||
    !Number.isFinite(afterMs) ||
    afterMs < 0
  ) {
    throw new ApiObservationError('invalid-response');
  }

  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, afterMs);

    if (signal.aborted) {
      abort();
      return;
    }

    signal.addEventListener('abort', abort, { once: true });
  });
};

const safeObservationError = (
  error: unknown,
  signal: AbortSignal,
): ApiObservationError | unknown => {
  if (error instanceof ApiObservationError) return error;

  if (
    signal.aborted ||
    (error instanceof Error && error.name === 'AbortError')
  ) {
    return error;
  }

  const statusCode = (error as { statusCode?: unknown })?.statusCode;

  if (statusCode === 401 || statusCode === 403) {
    return new ApiObservationError('forbidden');
  }
  if (statusCode === 404) return new ApiObservationError('not-found');
  if (statusCode === 429) return new ApiObservationError('rate-limited');
  if (typeof statusCode === 'number' && statusCode >= 500) {
    return new ApiObservationError('server-error');
  }
  if (typeof statusCode === 'number') {
    return new ApiObservationError('invalid-response');
  }

  return new ApiObservationError('transport-failure');
};

const withoutRouting = (
  options: Record<string, JsonValue>,
): Record<string, JsonValue> => {
  const {
    namespace: _namespace,
    targetId: _targetId,
    taskQueue: _taskQueue,
    workflowId: _workflowId,
    workflowType: _workflowType,
    activityId: _activityId,
    activityType: _activityType,
    operationId: _operationId,
    endpoint: _endpoint,
    service: _service,
    operation: _operation,
    ...editable
  } = options;

  return editable;
};

const knownRejection = (error: unknown): ApiLaunchResult | undefined => {
  const statusCode = (error as { statusCode?: unknown })?.statusCode;

  if (statusCode === 401 || statusCode === 403) {
    return { status: 'rejected', reason: 'forbidden' };
  }
  if (statusCode === 404) return { status: 'rejected', reason: 'not-found' };
  if (statusCode === 409) return { status: 'rejected', reason: 'conflict' };
  if (statusCode === 400 || statusCode === 422) {
    return { status: 'rejected', reason: 'invalid-request' };
  }

  return undefined;
};

const evidenceHref = (
  reference: LaunchReference & { runId: string },
): string => {
  const { namespace } = reference.target;
  const executionId = reference.attempt.executionId;

  if (reference.kind === 'workflow') {
    return routeForWorkflow({
      namespace,
      workflow: executionId,
      run: reference.runId,
    });
  }

  if (reference.kind === 'standalone-activity') {
    return routeForStandaloneActivityDetails({
      namespace,
      activityId: executionId,
      runId: reference.runId,
    });
  }

  return routeForStandaloneNexusOperationDetails({
    namespace,
    operationId: executionId,
    runId: reference.runId,
  });
};

export const createApiWorkbenchHost = ({
  descriptors,
  request = fetch,
  encodeInput = defaultEncodeInput,
  getIdentity = () => undefined,
  createRequestId = () => crypto.randomUUID(),
}: ApiWorkbenchHostOptions) => {
  const identity = getIdentity();
  const requestMetadata = () => ({
    identity,
    requestId: createRequestId(),
  });

  const launch = async (
    launchRequest: ApiLaunchRequest,
    signal?: AbortSignal,
  ): Promise<ApiLaunchResult> => {
    const startOptions = asRecord(launchRequest.startOptions);

    if (!startOptions) {
      return { status: 'rejected', reason: 'invalid-request' };
    }

    let route: string;
    let body: string;

    try {
      if (launchRequest.kind === 'workflow') {
        const payloads = await encodeInput(launchRequest.input, true);
        route = routeForApi('workflow', {
          namespace: launchRequest.target.namespace,
          workflowId: launchRequest.workflowId,
        });
        body = stringifyWithBigInt({
          ...withoutRouting(startOptions),
          ...requestMetadata(),
          workflowId: launchRequest.workflowId,
          workflowType: { name: launchRequest.workflowType },
          taskQueue: { name: launchRequest.target.taskQueue },
          input: { payloads },
        });
      } else if (launchRequest.kind === 'standalone-activity') {
        const timeouts = asRecord(launchRequest.timeouts);
        const policies = asRecord(launchRequest.policies);

        if (!timeouts || !policies) {
          return { status: 'rejected', reason: 'invalid-request' };
        }

        const payloads = await encodeInput(launchRequest.input, false);
        route = routeForApi('standalone-activity', {
          namespace: launchRequest.target.namespace,
          activityId: launchRequest.activityId,
        });
        body = stringifyWithBigInt({
          ...timeouts,
          ...policies,
          ...withoutRouting(startOptions),
          ...requestMetadata(),
          activityId: launchRequest.activityId,
          activityType: { name: launchRequest.activityType },
          taskQueue: { name: launchRequest.target.taskQueue },
          input: { payloads },
        });
      } else {
        const policies = asRecord(launchRequest.policies);

        if (!policies) {
          return { status: 'rejected', reason: 'invalid-request' };
        }

        const [input] = await encodeInput(launchRequest.input, false);
        route = routeForApi('standalone-nexus-operation', {
          namespace: launchRequest.target.namespace,
          operationId: launchRequest.operationId,
        });
        body = stringifyWithBigInt({
          ...policies,
          ...withoutRouting(startOptions),
          ...requestMetadata(),
          operationId: launchRequest.operationId,
          endpoint: launchRequest.endpoint,
          service: launchRequest.service,
          operation: launchRequest.operation,
          input,
        });
      }
    } catch {
      return { status: 'rejected', reason: 'invalid-request' };
    }

    try {
      const response = await requestFromAPI<{ runId?: string }>(route, {
        request,
        notifyOnError: false,
        options: { method: 'POST', body, signal },
      });

      return {
        status: 'accepted',
        runId:
          typeof response?.runId === 'string' && response.runId
            ? response.runId
            : undefined,
      };
    } catch (error) {
      const rejection = knownRejection(error);
      if (rejection) return rejection;
      throw error;
    }
  };

  const observeOnce = async (
    observationRequest: ObservationRequest,
    signal: AbortSignal,
  ): Promise<ExecutionObservation> => {
    const { reference } = observationRequest;

    if (reference.kind === 'workflow') {
      await waitForObservationDelay(observationRequest.continuation, signal);
      const route = routeForApi('workflow', {
        namespace: reference.target.namespace,
        workflowId: reference.attempt.executionId,
      });
      const response = await requestFromAPI<JsonValue>(route, {
        request,
        notifyOnError: false,
        params: { 'execution.runId': reference.runId },
        options: { signal },
      });

      return toWorkflowObservation(response ?? null);
    }

    if (reference.kind === 'standalone-activity') {
      const cursor = observationCursor(observationRequest.continuation);

      const route = routeForApi('standalone-activity', {
        namespace: reference.target.namespace,
        activityId: reference.attempt.executionId,
      });
      const params = new URLSearchParams({
        includeInput: 'false',
        includeOutcome: 'true',
        includeHeartbeatDetails: 'true',
        includeLastFailure: 'true',
        runId: reference.runId,
      });
      if (typeof cursor === 'string') params.set('longPollToken', cursor);
      const response = await requestFromAPI<JsonValue>(route, {
        request,
        notifyOnError: false,
        params,
        options: { signal },
      });

      return toActivityObservation(response ?? null);
    }

    if (reference.kind === 'standalone-nexus-operation') {
      const cursor = observationCursor(observationRequest.continuation);

      const route = routeForApi('standalone-nexus-operation', {
        namespace: reference.target.namespace,
        operationId: reference.attempt.executionId,
      });
      const params = new URLSearchParams({
        includeInput: 'false',
        includeOutcome: 'true',
        runId: reference.runId,
      });
      if (typeof cursor === 'string') params.set('longPollToken', cursor);
      const response = await requestFromAPI<JsonValue>(route, {
        request,
        notifyOnError: false,
        params,
        options: { signal },
      });

      return toNexusObservation(response ?? null);
    }

    throw new ApiObservationError('invalid-response');
  };

  const observe = async (
    observationRequest: ObservationRequest,
    signal: AbortSignal,
  ): Promise<ExecutionObservation> => {
    try {
      return await observeOnce(observationRequest, signal);
    } catch (error) {
      throw safeObservationError(error, signal);
    }
  };

  return assembleWorkbenchHost({
    descriptors,
    launch,
    observe,
    checkWorker: async (
      { namespace, taskQueue, taskQueueType },
      signal,
    ): Promise<boolean> => {
      const route = routeForApi('task-queue', {
        namespace,
        queue: taskQueue,
      });
      const response = await requestFromAPI<TaskQueueResponse>(route, {
        request,
        notifyOnError: false,
        params: { taskQueueType: String(taskQueueType) },
        options: { signal },
      });

      return Boolean(response?.pollers?.length);
    },
    checkNexusEndpoint: async ({ endpoint }, signal) => {
      const route = routeForApi('nexus-endpoints');
      const response = await requestFromAPI<{
        endpoints?: { spec?: { name?: string | null } | null }[];
      }>(route, {
        request,
        notifyOnError: false,
        params: { name: endpoint },
        options: { signal },
      });

      return Boolean(
        response?.endpoints?.some((item) => item.spec?.name === endpoint),
      );
    },
    createEvidenceHref: evidenceHref,
  });
};
