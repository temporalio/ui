import type { Readable, Writable } from 'svelte/store';

import { createCountPoller } from '$lib/runes/count-poller.svelte';
import type {
  CountWorkflowExecutionsResponse,
  WorkflowStatus,
} from '$lib/types/workflows';
import type { ActivityStatus } from '$lib/utilities/get-activity-status-and-count';

export type Status = WorkflowStatus | ActivityStatus;
export type StatusCount = { status: Status; count: number };
export type StatusCountItem = StatusCount & { difference: number };
export type CountStore = Writable<{ count: number; newCount: number }>;
export type StatusCountFetcher = (opts: {
  namespace: string;
  query: string;
}) => Promise<Required<CountWorkflowExecutionsResponse>>;
export type GetStatusAndCount = (
  groups: CountWorkflowExecutionsResponse['groups'],
) => StatusCount[];

interface StatusCountsStateOptions {
  getNamespace: () => string;
  getQuery: () => string;
  getPerPage: () => string | null;
  getRefresh: () => number;
  getCountStore: () => CountStore;
  isRefreshDisabled: () => boolean;
  getFetchCounts: () => StatusCountFetcher;
  getStatusAndCount: () => GetStatusAndCount;
}

export function createStatusCountsState(options: StatusCountsStateOptions) {
  let statusGroups = $state<StatusCount[]>([]);
  let newStatusGroups = $state<StatusCount[]>([]);

  const allStatusGroups = $derived(
    newStatusGroups.length > statusGroups.length
      ? [
          ...statusGroups,
          ...newStatusGroups
            .filter(
              (group) =>
                !statusGroups.some(({ status }) => status === group.status),
            )
            .map((group) => ({ status: group.status, count: 0 })),
        ]
      : statusGroups,
  );

  const items = $derived(
    allStatusGroups.map(({ count, status }) => {
      const updatedGroup = newStatusGroups.find(
        (group) => group.status === status,
      );

      return {
        count,
        status,
        difference: updatedGroup ? updatedGroup.count - count : 0,
      };
    }),
  );

  const countPoller = createCountPoller({
    getStore: options.getCountStore,
    fetch: () =>
      options.getFetchCounts()({
        namespace: options.getNamespace(),
        query: options.getQuery(),
      }),
    transform: (response) => Number.parseInt(response.count, 10),
    disabled: options.isRefreshDisabled,
    onInitialFetch(_count, response) {
      statusGroups = options.getStatusAndCount()(response.groups);
    },
    onPollFetch(_newCount, response) {
      newStatusGroups = options.getStatusAndCount()(response.groups);
    },
    onReset() {
      newStatusGroups = [];
    },
    watch() {
      void options.getNamespace();
      void options.getQuery();
      void options.getPerPage();
      void options.getRefresh();
    },
  });

  return {
    get items(): StatusCountItem[] {
      return items;
    },
    get loading(): boolean {
      return countPoller.loading;
    },
    get refreshTime(): number {
      return countPoller.refreshTime;
    },
  };
}

export interface StatusCountDataProps {
  staticQuery?: string;
  refreshTime?: Date;
  countStore?: CountStore;
  refresh?: Writable<number>;
  fetchCounts?: StatusCountFetcher;
  getStatusAndCount?: GetStatusAndCount;
  'data-testid'?: string;
  disableRefresh?: Readable<boolean>;
  class?: string;
}
