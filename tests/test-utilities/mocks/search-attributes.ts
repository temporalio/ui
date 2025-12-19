import type { Page } from '@playwright/test';

import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributesResponse,
} from '$src/lib/types/workflows';

export const SEARCH_ATTRIBUTES_API =
  /\/api\/v1\/namespaces\/[^/]+\/search-attributes\?/;

const MOCK_SEARCH_ATTRIBUTES: SearchAttributesResponse = {
  systemAttributes: {
    BatcherUser: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    BinaryChecksums: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    CloseTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
    CustomBoolField: SEARCH_ATTRIBUTE_TYPE.BOOL,
    CustomDatetimeField: SEARCH_ATTRIBUTE_TYPE.DATETIME,
    CustomDoubleField: SEARCH_ATTRIBUTE_TYPE.DOUBLE,
    CustomIntField: SEARCH_ATTRIBUTE_TYPE.INT,
    CustomKeywordField: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    CustomStringField: SEARCH_ATTRIBUTE_TYPE.TEXT,
    CustomTextField: SEARCH_ATTRIBUTE_TYPE.TEXT,
    ExecutionDuration: SEARCH_ATTRIBUTE_TYPE.INT,
    ExecutionStatus: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    ExecutionTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
    HistoryLength: SEARCH_ATTRIBUTE_TYPE.INT,
    RunId: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    StartTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
    StateTransitionCount: SEARCH_ATTRIBUTE_TYPE.INT,
    TaskQueue: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    TemporalChangeVersion: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    WorkflowId: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    WorkflowType: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  },
  customAttributes: {},
  storageSchema: {},
};

const mergeSearchAttributes = (
  searchAttributes: Partial<SearchAttributesResponse>,
) => {
  return {
    ...MOCK_SEARCH_ATTRIBUTES,
    ...searchAttributes,
  };
};

export const mockSearchAttributesApi = (
  page: Page,
  searchAttributes?: Partial<SearchAttributesResponse>,
) => {
  return page.route(SEARCH_ATTRIBUTES_API, (route) => {
    const payload = mergeSearchAttributes(searchAttributes);
    route.fulfill({ json: payload });
  });
};
