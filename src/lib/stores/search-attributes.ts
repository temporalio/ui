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
