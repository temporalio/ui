import { describe, expect, it } from 'vitest';

import { getScheduleColumnFilter } from './column-search-attributes';

describe('getScheduleColumnFilter', () => {
  const attributes = {
    ScheduleId: 'Keyword',
    TemporalSchedulePaused: 'Bool',
    CustomKeywordField: 'Keyword',
  } as const;

  it('resolves the Schedule ID column to its search attribute', () => {
    expect(getScheduleColumnFilter('Schedule ID', attributes)).toEqual({
      attribute: 'ScheduleId',
      type: 'Keyword',
    });
  });

  it('resolves a custom search attribute column by its name', () => {
    expect(getScheduleColumnFilter('CustomKeywordField', attributes)).toEqual({
      attribute: 'CustomKeywordField',
      type: 'Keyword',
    });
  });

  it.each([
    'Status',
    'Workflow Type',
    'Recent Runs',
    'Upcoming Runs',
    'Schedule Spec',
  ])('offers no filter for %s, which is not a search attribute', (label) => {
    expect(getScheduleColumnFilter(label, attributes)).toBeUndefined();
  });

  it('offers no filter for Schedule ID when the server does not index it', () => {
    expect(
      getScheduleColumnFilter('Schedule ID', { CustomKeywordField: 'Keyword' }),
    ).toBeUndefined();
  });
});
