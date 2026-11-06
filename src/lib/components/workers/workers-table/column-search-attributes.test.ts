import { describe, expect, it } from 'vitest';

import { getWorkerColumnFilter } from './column-search-attributes';

describe('getWorkerColumnFilter', () => {
  const attributes = {
    WorkerStatus: 'Keyword',
    WorkerInstanceKey: 'Keyword',
    StartTime: 'Datetime',
    SdkName: 'Keyword',
  } as const;

  it('resolves a column to the search attribute and type it filters on', () => {
    expect(getWorkerColumnFilter('Status', attributes)).toEqual({
      attribute: 'WorkerStatus',
      type: 'Keyword',
    });
    expect(getWorkerColumnFilter('Instance', attributes)).toEqual({
      attribute: 'WorkerInstanceKey',
      type: 'Keyword',
    });
    expect(getWorkerColumnFilter('Start Time', attributes)).toEqual({
      attribute: 'StartTime',
      type: 'Datetime',
    });
  });

  it('offers no filter for a column without a search attribute type', () => {
    expect(getWorkerColumnFilter('Host Name', attributes)).toBeUndefined();
  });

  it('offers no filter for the SDK column, which spans two attributes', () => {
    expect(getWorkerColumnFilter('SDK', attributes)).toBeUndefined();
  });
});
