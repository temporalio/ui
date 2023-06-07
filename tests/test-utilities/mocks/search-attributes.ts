import type { Page } from '@playwright/test';
import type { SearchAttributesResponse } from '$src/lib/types/workflows';

export const SEARCH_ATTRIBUTES_API =
  'http://localhost:8233/api/v1/namespaces/*/search-attributes**';
const MOCK_SEARCH_ATTRIBUTES: SearchAttributesResponse = {
  systemAttributes: {
    BatcherNamespace: 'Keyword',
    BatcherUser: 'Keyword',
    BinaryChecksums: 'Keyword',
    CloseTime: 'Datetime',
    CustomBoolField: 'Bool',
    CustomDatetimeField: 'Datetime',
    CustomDoubleField: 'Double',
    CustomIntField: 'Int',
    CustomKeywordField: 'Keyword',
    CustomStringField: 'Text',
    CustomTextField: 'Text',
    ExecutionDuration: 'Int',
    ExecutionStatus: 'Keyword',
    ExecutionTime: 'Datetime',
    HistoryLength: 'Int',
    RunId: 'Keyword',
    StartTime: 'Datetime',
    StateTransitionCount: 'Int',
    TaskQueue: 'Keyword',
    TemporalChangeVersion: 'Keyword',
    WorkflowId: 'Keyword',
    WorkflowType: 'Keyword',
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
    route.fulfill({ json: mergeSearchAttributes(searchAttributes) });
  });
};
