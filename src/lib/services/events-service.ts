import { get } from 'svelte/store';

import type { GetWorkflowExecutionHistoryResponse } from '$types';
import { dataConverterPort } from '$lib/stores/data-converter-config';

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
  {
    namespace,
    executionId,
    runId,
    rawPayloads = false,
    onStart,
    onUpdate,
    onComplete,
  }: FetchEvents,
  request = fetch,
): Promise<HistoryEventWithId[]> => {
  let params = {};

  const port = get(dataConverterPort);

  if (rawPayloads) {
    params = { params: { rawPayloads: JSON.stringify(!!port) } };
  }

  const events = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        routeForApi('events', { namespace, executionId, runId }),
        {
          token,
          request,
          ...params,
        },
      );
    },
    { onStart, onUpdate, onComplete },
  ).then(toEventHistory);

  return events;
};
