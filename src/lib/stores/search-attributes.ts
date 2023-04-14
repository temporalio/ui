import { omit } from '$lib/utilities/omit';
import { writable, get, derived, type Readable } from 'svelte/store';
import type { WorkflowExecution, SearchAttributes } from 'src/types/workflows';

export const searchAttributes = writable<SearchAttributes>({});

// https://docs.temporal.io/visibility#default-search-attributes
export const DEFAULT_SEARCH_ATTRIBUTES: SearchAttributes = {
  WorkflowType: 'Keyword',
  WorkflowId: 'Keyword',
  ExecutionStatus: 'Keyword',
  StartTime: 'Datetime',
  CloseTime: 'Datetime',
  ExecutionTime: 'Datetime',
  RunId: 'Keyword',
  ExecutionDuration: 'Int',
  HistoryLength: 'Int',
  HistorySizeBytes: 'Keyword',
  StateTransitionCount: 'Int',
  TaskQueue: 'Keyword',
  BinaryChecksums: 'Keyword',
  BatcherNamespace: 'Keyword',
  BatcherUser: 'Keyword',
};

export const INTERNAL_SEARCH_ATTRIBUTES: SearchAttributes = {
  TemporalChangeVersion: 'Keyword',
  TemporalNamespaceDivision: 'Keyword',
  TemporalSchedulePaused: 'Keyword',
  TemporalScheduledById: 'Keyword',
  TemporalScheduledStartTime: 'Datetime',
};

export const customSearchAttributes: Readable<SearchAttributes> = derived(
  [searchAttributes],
  ([$searchAttributes]) =>
    omit(
      $searchAttributes,
      ...Object.keys(DEFAULT_SEARCH_ATTRIBUTES),
      ...Object.keys(INTERNAL_SEARCH_ATTRIBUTES),
    ),
);

export const isCustomSearchAttribute = (key: string) => {
  const customSearchAttrs = get(customSearchAttributes);
  return key in customSearchAttrs;
};

export const workflowIncludesSearchAttribute = (
  workflow: WorkflowExecution,
  searchAttribute: string,
): boolean => {
  return searchAttribute in (workflow?.searchAttributes?.indexedFields ?? {});
};

export const searchAttributeOptions = () => {
  const attributes = get(searchAttributes);
  return attributes
    ? Object.entries(attributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];
};
