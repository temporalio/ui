import { omit } from '$lib/utilities/omit';
import { writable, get, derived } from 'svelte/store';

export const searchAttributes = writable<SearchAttributes>({});

// https://docs.temporal.io/visibility#default-search-attributes
const DEFAULT_SEARCH_ATTRIBUTES: SearchAttributes = {
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
  TemporalChangeVersion: 'Keyword',
  BinaryChecksums: 'Keyword',
  BatcherNamespace: 'Keyword',
  BatcherUser: 'Keyword',
};

export const customSearchAttributes = derived(
  [searchAttributes],
  ([$searchAttributes]) =>
    omit($searchAttributes, ...Object.keys(DEFAULT_SEARCH_ATTRIBUTES)),
);

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
