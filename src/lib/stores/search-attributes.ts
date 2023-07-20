import { derived, get, type Readable, writable } from 'svelte/store';

import type { SearchAttributes, WorkflowExecution } from '$lib/types/workflows';

type SearchAttributesStore = {
  customAttributes: SearchAttributes;
  systemAttributes: SearchAttributes;
};

export const allSearchAttributes = writable<SearchAttributesStore>({
  customAttributes: {},
  systemAttributes: {},
});

export const searchAttributes: Readable<SearchAttributes> = derived(
  [allSearchAttributes],
  ([$allSearchAttributes]) => ({
    ...$allSearchAttributes.customAttributes,
    ...$allSearchAttributes.systemAttributes,
  }),
);

export const internalSearchAttributes: Readable<SearchAttributes> = derived(
  [allSearchAttributes],
  ([$allSearchAttributes]) => $allSearchAttributes.systemAttributes,
);

export const customSearchAttributes: Readable<SearchAttributes> = derived(
  [allSearchAttributes],
  ([$allSearchAttributes]) => $allSearchAttributes.customAttributes,
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

export const sortedSearchAttributeOptions = () => {
  const popularOptions = [
    'ExecutionStatus',
    'WorkflowId',
    'WorkflowType',
    'RunId',
    'StartTime',
    'CloseTime',
  ];

  return searchAttributeOptions()
    .sort((a, b) => {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    })
    .sort((a, b) => {
      const indexA = popularOptions.indexOf(a.value);
      const indexB = popularOptions.indexOf(b.value);

      if (indexA < 0) return 1;
      if (indexB < 0) return -1;
      return indexA - indexB;
    });
};
