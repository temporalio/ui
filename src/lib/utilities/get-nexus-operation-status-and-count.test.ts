import { describe, expect, it, vi } from 'vitest';

import {
  getNexusOperationStatusAndCountOfGroup,
  nexusOperationStatuses,
  toNexusOperationStatus,
} from './get-nexus-operation-status-and-count';

vi.mock('$lib/utilities/decode-payload', () => ({
  parseRawPayloadToJSON: vi.fn((payload) => payload),
}));

describe('toNexusOperationStatus', () => {
  it('maps RUNNING to Running', () => {
    expect(
      toNexusOperationStatus('NEXUS_OPERATION_EXECUTION_STATUS_RUNNING'),
    ).toBe('Running');
  });

  it('maps UNSPECIFIED to Running', () => {
    expect(
      toNexusOperationStatus('NEXUS_OPERATION_EXECUTION_STATUS_UNSPECIFIED'),
    ).toBe('Running');
  });

  it('maps COMPLETED to Completed', () => {
    expect(
      toNexusOperationStatus('NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED'),
    ).toBe('Completed');
  });

  it('maps FAILED to Failed', () => {
    expect(
      toNexusOperationStatus('NEXUS_OPERATION_EXECUTION_STATUS_FAILED'),
    ).toBe('Failed');
  });

  it('maps CANCELED to Canceled', () => {
    expect(
      toNexusOperationStatus('NEXUS_OPERATION_EXECUTION_STATUS_CANCELED'),
    ).toBe('Canceled');
  });

  it('maps TERMINATED to Terminated', () => {
    expect(
      toNexusOperationStatus('NEXUS_OPERATION_EXECUTION_STATUS_TERMINATED'),
    ).toBe('Terminated');
  });

  it('maps TIMED_OUT to TimedOut', () => {
    expect(
      toNexusOperationStatus('NEXUS_OPERATION_EXECUTION_STATUS_TIMED_OUT'),
    ).toBe('TimedOut');
  });
});

describe('nexusOperationStatuses', () => {
  it('contains all expected statuses in order', () => {
    expect(nexusOperationStatuses).toEqual([
      'Running',
      'Completed',
      'Failed',
      'Canceled',
      'Terminated',
      'TimedOut',
    ]);
  });
});

describe('getNexusOperationStatusAndCountOfGroup', () => {
  it('returns empty array for undefined groups', () => {
    expect(getNexusOperationStatusAndCountOfGroup(undefined)).toEqual([]);
  });

  it('returns empty array for empty groups', () => {
    expect(getNexusOperationStatusAndCountOfGroup([])).toEqual([]);
  });

  it('parses a single group', () => {
    const groups = [{ groupValues: ['Running'], count: '5' }];
    const result = getNexusOperationStatusAndCountOfGroup(groups);
    expect(result).toEqual([{ status: 'Running', count: 5 }]);
  });

  it('sorts groups by nexusOperationStatuses order', () => {
    const groups = [
      { groupValues: ['Failed'], count: '3' },
      { groupValues: ['Running'], count: '10' },
      { groupValues: ['Completed'], count: '7' },
    ];
    const result = getNexusOperationStatusAndCountOfGroup(groups);
    expect(result).toEqual([
      { status: 'Running', count: 10 },
      { status: 'Completed', count: 7 },
      { status: 'Failed', count: 3 },
    ]);
  });

  it('parses count as integer', () => {
    const groups = [{ groupValues: ['TimedOut'], count: '42' }];
    const result = getNexusOperationStatusAndCountOfGroup(groups);
    expect(result[0].count).toBe(42);
  });
});
