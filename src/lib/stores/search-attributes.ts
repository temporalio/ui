import { derived, get, type Readable, writable } from 'svelte/store';

import { z } from 'zod/v3';

import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
  type SearchAttributeType,
  type WorkflowExecution,
} from '$lib/types/workflows';

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

export const scheduleSearchAttributes: Readable<SearchAttributes> = derived(
  [allSearchAttributes],
  ([$allSearchAttributes]) => ({
    ScheduleId: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    ...$allSearchAttributes.customAttributes,
  }),
);

export const activityExecutionSearchAttributes: Readable<SearchAttributes> =
  derived(searchAttributes, ($searchAttributes) => ({
    ...$searchAttributes,
    ActivityId: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    ActivityType: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  }));

export const internalSearchAttributes: Readable<SearchAttributes> = derived(
  [allSearchAttributes],
  ([$allSearchAttributes]) => $allSearchAttributes.systemAttributes,
);

export const customSearchAttributes: Readable<SearchAttributes> = derived(
  [allSearchAttributes],
  ([$allSearchAttributes]) => {
    return $allSearchAttributes.customAttributes;
  },
);

export const customSearchAttributeOptions: Readable<
  {
    label: string;
    value: string;
    type: SearchAttributeType;
  }[]
> = derived([customSearchAttributes], ([$customSearchAttributes]) => {
  return Object.entries($customSearchAttributes).map(([key, value]) => ({
    label: key,
    value: key,
    type: value,
  }));
});

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

export type SearchAttributeOption = {
  label: string;
  value: string;
  type: SearchAttributeType;
};

type BaseSearchAttributeInput = {
  label: string;
};

type BoolSearchAttributeInput = BaseSearchAttributeInput & {
  value: boolean;
  type: typeof SEARCH_ATTRIBUTE_TYPE.BOOL;
};

type NumberSearchAttributeInput = BaseSearchAttributeInput & {
  value: number;
  type: typeof SEARCH_ATTRIBUTE_TYPE.INT | typeof SEARCH_ATTRIBUTE_TYPE.DOUBLE;
};

type StringSearchAttributeInput = BaseSearchAttributeInput & {
  value: string;
  type:
    | typeof SEARCH_ATTRIBUTE_TYPE.TEXT
    | typeof SEARCH_ATTRIBUTE_TYPE.KEYWORD
    | typeof SEARCH_ATTRIBUTE_TYPE.DATETIME;
};

type ListSearchAttributeInput = BaseSearchAttributeInput & {
  value: string[];
  type: typeof SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST;
};
export type SearchAttributeInput =
  | {
      label: null;
      value: null;
      type: typeof SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED;
    }
  | BoolSearchAttributeInput
  | NumberSearchAttributeInput
  | StringSearchAttributeInput
  | ListSearchAttributeInput;

export const searchAttributeSchema = z
  .object({
    value: z.any(),
    label: z.string(),
    type: z.enum([
      SEARCH_ATTRIBUTE_TYPE.BOOL,
      SEARCH_ATTRIBUTE_TYPE.INT,
      SEARCH_ATTRIBUTE_TYPE.DOUBLE,
      SEARCH_ATTRIBUTE_TYPE.TEXT,
      SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      SEARCH_ATTRIBUTE_TYPE.DATETIME,
      SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
      SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED,
    ]),
  })
  .superRefine((data, context) => {
    if (data.type && data.label && data.value === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: 'Search Attribute Value is required.',
      });
    }
  });

export type SearchAttributeSchema = z.infer<typeof searchAttributeSchema>;
export const searchAttributesSchema = z.array(searchAttributeSchema);
export type SearchAttributesSchema = z.infer<typeof searchAttributesSchema>;

export const searchAttributeOptions: Readable<SearchAttributeOption[]> =
  derived([searchAttributes], ([$searchAttributes]) => {
    return $searchAttributes
      ? Object.entries($searchAttributes).map(([key, value]) => {
          return {
            label: key,
            value: key,
            type: value,
          };
        })
      : [];
  });

export const sortedSearchAttributeOptions: Readable<SearchAttributeOption[]> =
  derived([searchAttributeOptions], ([$searchAttributeOptions]) => {
    const popularOptions = [
      'ExecutionStatus',
      'WorkflowId',
      'WorkflowType',
      'RunId',
      'StartTime',
      'CloseTime',
    ];
    return $searchAttributeOptions
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
  });

export const activitySearchAttributeOptions: Readable<SearchAttributeOption[]> =
  derived(customSearchAttributeOptions, ($customSearchAttributeOptions) => {
    return [
      {
        label: 'ExecutionStatus',
        value: 'ExecutionStatus',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      },
      {
        label: 'ActivityId',
        value: 'ActivityId',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      },
      {
        label: 'ActivityType',
        value: 'ActivityType',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      },
      { label: 'RunId', value: 'RunId', type: SEARCH_ATTRIBUTE_TYPE.KEYWORD },
      {
        label: 'TaskQueue',
        value: 'TaskQueue',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      },
      {
        label: 'StartTime',
        value: 'StartTime',
        type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      },
      {
        label: 'ExecutionTime',
        value: 'ExecutionTime',
        type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      },
      {
        label: 'CloseTime',
        value: 'CloseTime',
        type: SEARCH_ATTRIBUTE_TYPE.DATETIME,
      },
      {
        label: 'ExecutionDuration',
        value: 'ExecutionDuration',
        type: SEARCH_ATTRIBUTE_TYPE.INT,
      },
      {
        label: 'StateTransitionCount',
        value: 'StateTransitionCount',
        type: SEARCH_ATTRIBUTE_TYPE.INT,
      },
      ...$customSearchAttributeOptions,
    ].sort((a, b) => {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    });
  });
