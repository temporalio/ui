import {
  isPayloadInputEncodingType,
  type PayloadInputEncoding,
} from '$lib/models/payload-encoding';
import { nexusOperationError } from '$lib/stores/nexus-operations';
import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
import type {
  NexusOperationIdConflictPolicy,
  NexusOperationIdReusePolicy,
  Payload,
  SearchAttribute,
  StartNexusOperationExecutionResponse,
} from '$lib/types';
import type {
  NexusOperationExecution,
  NexusOperationExecutionInfo,
  NexusOperationExecutionListInfo,
  StartNexusOperationRequest,
} from '$lib/types/nexus-operation-execution';
import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import {
  type ErrorCallback,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { setSearchAttributes } from './workflow-service';

export type ListNexusOperationsResponse = {
  operations: NexusOperationExecutionListInfo[];
  nextPageToken: string;
};

const emptyNexusOperationExecutionInfo: NexusOperationExecutionInfo = {
  status: 'NEXUS_OPERATION_EXECUTION_STATUS_UNSPECIFIED',
  scheduleToCloseTimeout: '',
  scheduleToStartTimeout: '',
  startToCloseTimeout: '',
  executionDuration: '',
  stateTransitionCount: '',
  scheduleTime: '',
  expirationTime: '',
  closeTime: '',
  lastAttemptCompleteTime: '',
  nextAttemptScheduleTime: '',
  searchAttributes: {},
};

const emptyNexusOperationExecution: NexusOperationExecution = {
  info: emptyNexusOperationExecutionInfo,
};

export type PaginatedNexusOperationsPromise = (
  pageSize?: number,
  token?: string,
) => Promise<{
  items: NexusOperationExecutionListInfo[];
  nextPageToken: string;
}>;

export const fetchPaginatedNexusOperations = async (
  namespace: string,
  query: string = '',
  request = fetch,
): Promise<PaginatedNexusOperationsPromise> => {
  return (pageSize = 100, token = '') => {
    nexusOperationError.set('');

    const onError: ErrorCallback = (err) => {
      nexusOperationError.set(
        err?.body?.message ||
          'An error occurred while querying Nexus operations.',
      );
    };

    const route = routeForApi('standalone-nexus-operations', { namespace });

    return requestFromAPI<ListNexusOperationsResponse>(route, {
      params: {
        pageSize: String(pageSize),
        nextPageToken: token,
        ...(query ? { query } : {}),
      },
      request,
      onError,
      handleError: onError,
    }).then((response) => {
      const { operations = [], nextPageToken = '' } = response || {};
      return {
        items: operations,
        nextPageToken: nextPageToken ? String(nextPageToken) : '',
      };
    });
  };
};

export type StartNexusOperationFormData = {
  namespace: string;
  identity: string;
  operationId: string;
  endpoint: string;
  service: string;
  operation: string;
  input?: string;
  encoding?: string;
  messageType?: string;
  scheduleToCloseTimeout?: string;
  scheduleToStartTimeout?: string;
  startToCloseTimeout?: string;
  idReusePolicy?: NexusOperationIdReusePolicy;
  idConflictPolicy?: NexusOperationIdConflictPolicy;
  nexusHeader?: Record<string, string>;
  searchAttributes?: Record<string, unknown>[];
  summary?: string;
  details?: string;
};

const toStartNexusOperationRequest = async (
  formData: StartNexusOperationFormData,
): Promise<StartNexusOperationRequest> => {
  let inputPayload: Payload | undefined = undefined;
  let summaryPayload: Payload | null = null;
  let detailsPayload: Payload | null = null;
  let searchAttributes: SearchAttribute | null = null;

  if (formData.input) {
    const { input, encoding, messageType } = formData;
    try {
      const payloads = await encodePayloads({
        input,
        encoding: encoding as 'json/plain' | 'json/protobuf',
        messageType,
      });
      if (payloads && payloads[0]) {
        inputPayload = payloads[0];
      }
    } catch {
      throw new Error(
        'Could not encode input for starting Nexus operation execution',
      );
    }
  }

  if (formData.summary) {
    try {
      const payloads = await encodePayloads({
        input: stringifyWithBigInt(formData.summary),
        encoding: 'json/plain',
      });
      if (payloads && payloads[0]) {
        summaryPayload = payloads[0];
      }
    } catch {
      throw new Error(
        'Could not encode summary for starting Nexus operation execution',
      );
    }
  }

  if (formData.details) {
    try {
      const payloads = await encodePayloads({
        input: stringifyWithBigInt(formData.details),
        encoding: 'json/plain',
      });
      if (payloads && payloads[0]) {
        detailsPayload = payloads[0];
      }
    } catch {
      throw new Error(
        'Could not encode details for starting Nexus operation execution',
      );
    }
  }

  if (formData.searchAttributes) {
    searchAttributes = {
      indexedFields: {
        ...setSearchAttributes(
          formData.searchAttributes as unknown as SearchAttributesSchema,
        ),
      },
    };
  }

  return {
    namespace: formData.namespace,
    identity: formData.identity,
    requestId: crypto.randomUUID(),
    operationId: formData.operationId,
    endpoint: formData.endpoint,
    service: formData.service,
    operation: formData.operation,
    ...(inputPayload && { input: inputPayload }),
    ...(formData.scheduleToCloseTimeout && {
      scheduleToCloseTimeout: formData.scheduleToCloseTimeout,
    }),
    ...(formData.scheduleToStartTimeout && {
      scheduleToStartTimeout: formData.scheduleToStartTimeout,
    }),
    ...(formData.startToCloseTimeout && {
      startToCloseTimeout: formData.startToCloseTimeout,
    }),
    ...(formData.idReusePolicy && {
      idReusePolicy: formData.idReusePolicy,
    }),
    ...(formData.idConflictPolicy && {
      idConflictPolicy: formData.idConflictPolicy,
    }),
    ...(formData.nexusHeader && { nexusHeader: formData.nexusHeader }),
    ...(searchAttributes && { searchAttributes }),
    ...(summaryPayload || detailsPayload
      ? {
          userMetadata: {
            summary: summaryPayload,
            details: detailsPayload,
          },
        }
      : {}),
  };
};

export const startStandaloneNexusOperation = async (
  formData: StartNexusOperationFormData,
): Promise<StartNexusOperationExecutionResponse> => {
  const { operationId, namespace } = formData;

  const route = routeForApi('standalone-nexus-operation', {
    namespace,
    operationId,
  });

  const request = await toStartNexusOperationRequest(formData);

  return requestFromAPI<StartNexusOperationExecutionResponse>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt(request),
    },
    notifyOnError: false,
  }).then((response) => response ?? {});
};

export const getNexusOperationExecution = (
  namespace: string,
  operationId: string,
  runId: string,
  includeOutcome: boolean = true,
): Promise<NexusOperationExecution> => {
  const route = routeForApi('standalone-nexus-operation', {
    namespace,
    operationId,
  });

  const params = new URLSearchParams({
    runId,
    includeInput: 'true',
    includeOutcome: String(includeOutcome),
  });

  return requestFromAPI<NexusOperationExecution>(route, { params }).then(
    (response) => response ?? emptyNexusOperationExecution,
  );
};

export interface NexusOperationInitialValues {
  input: string;
  encoding: PayloadInputEncoding;
  messageType: string;
  summary: string;
  details: string;
  searchAttributes: Record<string, string | Payload> | undefined;
}

const extractNexusInputValues = async (
  payload: Payload | undefined,
): Promise<
  Pick<NexusOperationInitialValues, 'input' | 'encoding' | 'messageType'>
> => {
  const defaults = {
    input: '',
    encoding: 'json/plain' as PayloadInputEncoding,
    messageType: '',
  };
  if (!payload) return defaults;
  const decoded = await decodePayloadAndParseDataToJSON(payload, false);
  if (!decoded) return defaults;
  const encodingValue = decoded.metadata?.encoding;
  return {
    input: decoded.data ? stringifyWithBigInt(decoded.data) : '',
    encoding:
      encodingValue && isPayloadInputEncodingType(encodingValue)
        ? encodingValue
        : 'json/plain',
    messageType: decoded.metadata?.messageType ?? '',
  };
};

const extractMetadataString = async (
  payload: Payload | null | undefined,
): Promise<string> => {
  if (!payload) return '';
  const decoded = await decodePayloadAndParseDataToJSON(payload);
  return typeof decoded === 'string' ? decoded : '';
};

export const fetchInitialValuesForStartNexusOperation = async (
  namespace: string,
  operationId: string,
  runId: string,
): Promise<NexusOperationInitialValues> => {
  const emptyValues: NexusOperationInitialValues = {
    input: '',
    encoding: 'json/plain',
    messageType: '',
    summary: '',
    details: '',
    searchAttributes: undefined,
  };

  try {
    const operation = await getNexusOperationExecution(
      namespace,
      operationId,
      runId,
      false,
    );
    const { input, encoding, messageType } = await extractNexusInputValues(
      operation.input ?? undefined,
    );
    const summary = await extractMetadataString(
      operation.info.userMetadata?.summary,
    );
    const details = await extractMetadataString(
      operation.info.userMetadata?.details,
    );

    return {
      input,
      encoding,
      messageType,
      summary,
      details,
      searchAttributes: operation.info.searchAttributes?.indexedFields,
    };
  } catch {
    return emptyValues;
  }
};

export const pollNexusOperationExecution = (
  namespace: string,
  operationId: string,
  runId: string,
  token: string,
  signal: AbortSignal,
): Promise<NexusOperationExecution | undefined> => {
  const route = routeForApi('standalone-nexus-operation', {
    namespace,
    operationId,
  });

  const params = new URLSearchParams({
    includeInput: 'false',
    includeOutcome: 'true',
    runId,
    longPollToken: token,
  });

  return requestFromAPI<NexusOperationExecution>(route, {
    params,
    notifyOnError: false,
    options: { signal },
  });
};

export const cancelNexusOperationExecution = async (
  namespace: string,
  operationId: string,
  reason?: string,
  identity?: string,
): Promise<void> => {
  const route = routeForApi('standalone-nexus-operation.cancel', {
    namespace,
    operationId,
  });

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        namespace,
        operationId,
        requestId: crypto.randomUUID(),
        ...(reason && { reason }),
        ...(identity && { identity }),
      }),
    },
  });
};

export const terminateNexusOperationExecution = async (
  namespace: string,
  operationId: string,
  reason?: string,
  identity?: string,
): Promise<void> => {
  const route = routeForApi('standalone-nexus-operation.terminate', {
    namespace,
    operationId,
  });

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        reason: reason || '',
        ...(identity && { identity }),
      }),
    },
  });
};
