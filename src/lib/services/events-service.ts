import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toEventHistory } from '$lib/models/event-history';

type FetchEvents = NamespaceScopedRequest &
  PaginationCallbacks<GetWorkflowExecutionHistoryResponse> & {
    executionId: string;
    runId: string;
    rawPayloads?: boolean;
  };

export const fetchEvents = async (
  { namespace, executionId, runId, onStart, onUpdate, onComplete }: FetchEvents,
  request = fetch,
): Promise<HistoryEventWithId[]> => {
  const events = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        routeForApi('events', { namespace, executionId, runId }),
        {
          token,
          request,
        },
      );
    },
    { onStart, onUpdate, onComplete },
  ).then(toEventHistory);

  return events;
};

export const fetchRawEvents = async (
  { namespace, executionId, runId, onStart, onUpdate, onComplete }: FetchEvents,
  request = fetch,
): Promise<HistoryEvent[]> => {
  const resp = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        routeForApi('events', { namespace, executionId, runId }),
        {
          token,
          request,
        },
      );
    },
    { onStart, onUpdate, onComplete },
  );

  return resp.history.events;
};
