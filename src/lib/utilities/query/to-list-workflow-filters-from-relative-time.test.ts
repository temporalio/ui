import { describe, expect, it } from 'vitest';
import {
  toListWorkflowFiltersFromRelativeTime,
  toReadableRelativeTime,
} from './to-list-workflow-filters-from-relative-time';

const defaultFilter = {
  attribute: 'StartTime',
  conditional: '',
  operator: '',
  parenthesis: '',
  value: '',
};

describe('toListWorkflowFiltersFromRelativeTime with earliest start time', () => {
  it('should parse earliest start time with seconds', () => {
    const result = toListWorkflowFiltersFromRelativeTime('20s', 'earliest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '>',
        value: '20 seconds',
      },
    ]);
  });

  it('should parse earliest start time with minutes', () => {
    const result = toListWorkflowFiltersFromRelativeTime('5m', 'earliest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '>',
        value: '5 minutes',
      },
    ]);
  });

  it('should parse earliest start time with days', () => {
    const result = toListWorkflowFiltersFromRelativeTime('5day', 'earliest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '>',
        value: '5 days',
      },
    ]);
  });

  it('should parse earliest start time with months', () => {
    const result = toListWorkflowFiltersFromRelativeTime('10M', 'earliest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '>',
        value: '10 months',
      },
    ]);
  });

  it('should parse earliest start time with years', () => {
    const result = toListWorkflowFiltersFromRelativeTime('4y', 'earliest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '>',
        value: '4 years',
      },
    ]);
  });
});

describe('toListWorkflowFiltersFromRelativeTime with latest start time', () => {
  it('should parse latest start time with seconds', () => {
    const result = toListWorkflowFiltersFromRelativeTime('45seconds', 'latest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '<',
        value: '45 seconds',
      },
    ]);
  });

  it('should parse latest start time with minutes', () => {
    const result = toListWorkflowFiltersFromRelativeTime('2minutes', 'latest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '<',
        value: '2 minutes',
      },
    ]);
  });

  it('should parse latest start time with days', () => {
    const result = toListWorkflowFiltersFromRelativeTime('19d', 'latest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '<',
        value: '19 days',
      },
    ]);
  });

  it('should parse latest start time with months', () => {
    const result = toListWorkflowFiltersFromRelativeTime('6months', 'latest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '<',
        value: '6 months',
      },
    ]);
  });

  it('should parse latest start time with years', () => {
    const result = toListWorkflowFiltersFromRelativeTime('27year', 'latest');

    expect(result).toEqual([
      {
        ...defaultFilter,
        conditional: '<',
        value: '27 years',
      },
    ]);
  });
});

describe('toReadableRelativeTime', () => {
  it('should parse earliest start time to readable string', () => {
    const result = toReadableRelativeTime('2 months', 'earliest');

    expect(result).toEqual('Earliest time 2 months');
  });

  it('should parse latest start time to readable string', () => {
    const result = toReadableRelativeTime('45 minutes', 'latest');

    expect(result).toEqual('Latest time 45 minutes');
  });
});
