import { describe, expect, it } from 'vitest';

import type { NexusOperationExecutionListInfo } from '$lib/types/nexus-operation-execution';
import { sortTableItems } from '$lib/utilities/table-sort';

import {
  getNexusOperationColumnValue,
  getNexusOperationSortColumns,
} from './column-search-attributes';

const operation = {
  operationId: 'my-operation',
  runId: 'my-run',
  endpoint: 'my-endpoint',
  service: 'my-service',
  operation: 'my-op',
  status: 'NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED',
  scheduleTime: '2024-01-02T03:04:05Z',
  closeTime: '2024-01-02T03:09:15.5Z',
  executionDuration: '310.5s',
  stateTransitionCount: '4',
  searchAttributes: {
    indexedFields: {
      CustomKeywordField: 'my-keyword',
    },
  },
} as unknown as NexusOperationExecutionListInfo;

describe('getNexusOperationColumnValue', () => {
  it('sorts raw durations numerically rather than comparing query strings', () => {
    const columns = getNexusOperationSortColumns(['Execution Duration'], {
      ExecutionDuration: 'Int',
    });
    const items = ['100s', '20s', '0s'].map((executionDuration) => ({
      ...operation,
      executionDuration,
    }));
    expect(sortTableItems(items, columns['Execution Duration'])).toEqual([
      items[2],
      items[1],
      items[0],
    ]);
  });
  it('reads the operation fields a mapped column filters on', () => {
    expect(getNexusOperationColumnValue('Operation ID', operation)).toBe(
      'my-operation',
    );
    expect(getNexusOperationColumnValue('Schedule Time', operation)).toBe(
      '2024-01-02T03:04:05Z',
    );
  });

  it('filters status on the readable form, not the enum key', () => {
    expect(getNexusOperationColumnValue('Status', operation)).toBe('Completed');
  });

  it('builds a query duration from the proto seconds string', () => {
    expect(getNexusOperationColumnValue('Execution Duration', operation)).toBe(
      '5m10s500ms',
    );
  });

  it('falls through to a custom search attribute of the same name', () => {
    expect(getNexusOperationColumnValue('CustomKeywordField', operation)).toBe(
      'my-keyword',
    );
  });
});
