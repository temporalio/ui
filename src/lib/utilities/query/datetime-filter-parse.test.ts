import { startOfDay } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';

import {
  getInitialDateTimes,
  parseDateTimeFilter,
} from './datetime-filter-parse';

const makeFilter = (
  overrides: Partial<SearchAttributeFilter> = {},
): SearchAttributeFilter => ({
  attribute: 'StartTime',
  type: 'Datetime',
  value: '',
  operator: '',
  parenthesis: '',
  conditional: '>=',
  ...overrides,
});

describe('parseDateTimeFilter', () => {
  it('parses a UTC ISO string into date/time components for UTC timezone', () => {
    const result = parseDateTimeFilter('2026-03-05T15:30:45.000Z', 'UTC');

    expect(result.date).toEqual(
      startOfDay(new Date('2026-03-05T00:00:00.000Z')),
    );
    expect(result.hour).toBe('15');
    expect(result.minute).toBe('30');
    expect(result.second).toBe('45');
  });

  it('converts to the specified timezone', () => {
    const result = parseDateTimeFilter(
      '2026-03-05T15:00:00.000Z',
      'America/New_York',
    );

    expect(result.hour).toBe('10');
    expect(result.minute).toBe('0');
    expect(result.second).toBe('0');
  });

  it('handles midnight correctly', () => {
    const result = parseDateTimeFilter('2026-03-05T00:00:00.000Z', 'UTC');

    expect(result.hour).toBe('0');
    expect(result.minute).toBe('0');
    expect(result.second).toBe('0');
  });
});

describe('getInitialDateTimes - start', () => {
  it('returns empty defaults for a non-datetime filter', () => {
    const filter = makeFilter({ type: 'Keyword', attribute: 'WorkflowId' });
    const { start } = getInitialDateTimes(filter, 'UTC');

    expect(start.hour).toBe('');
    expect(start.minute).toBe('');
    expect(start.second).toBe('');
  });

  it('returns empty defaults when filter value is empty', () => {
    const filter = makeFilter({ value: '' });
    const { start } = getInitialDateTimes(filter, 'UTC');

    expect(start.hour).toBe('');
    expect(start.minute).toBe('');
    expect(start.second).toBe('');
  });

  it('parses a single datetime value', () => {
    const filter = makeFilter({
      value: '2026-03-05T09:15:00.000Z',
      conditional: '>=',
      customDate: false,
    });
    const { start } = getInitialDateTimes(filter, 'UTC');

    expect(start.hour).toBe('9');
    expect(start.minute).toBe('15');
    expect(start.second).toBe('0');
  });

  it('parses the start date from a BETWEEN value', () => {
    const filter = makeFilter({
      value:
        'BETWEEN "2026-03-05T09:00:00.000Z" AND "2026-03-05T17:30:00.000Z"',
      conditional: 'BETWEEN',
      customDate: true,
    });
    const { start } = getInitialDateTimes(filter, 'UTC');

    expect(start.hour).toBe('9');
    expect(start.minute).toBe('0');
    expect(start.second).toBe('0');
  });

  it('applies timezone conversion for single datetime', () => {
    const filter = makeFilter({
      value: '2026-03-05T15:00:00.000Z',
      conditional: '>=',
      customDate: false,
    });
    const { start } = getInitialDateTimes(filter, 'America/Chicago');

    expect(start.hour).toBe('9');
    expect(start.minute).toBe('0');
    expect(start.second).toBe('0');
  });
});

describe('getInitialDateTimes - end', () => {
  it('returns empty defaults for a non-BETWEEN filter', () => {
    const filter = makeFilter({
      value: '2026-03-05T09:15:00.000Z',
      conditional: '>=',
      customDate: false,
    });
    const { end } = getInitialDateTimes(filter, 'UTC');

    expect(end.hour).toBe('');
    expect(end.minute).toBe('');
    expect(end.second).toBe('');
  });

  it('returns empty defaults for a non-datetime filter', () => {
    const filter = makeFilter({ type: 'Keyword', attribute: 'WorkflowId' });
    const { end } = getInitialDateTimes(filter, 'UTC');

    expect(end.hour).toBe('');
    expect(end.minute).toBe('');
    expect(end.second).toBe('');
  });

  it('parses the end date from a BETWEEN value', () => {
    const filter = makeFilter({
      value:
        'BETWEEN "2026-03-05T09:00:00.000Z" AND "2026-03-05T17:30:45.000Z"',
      conditional: 'BETWEEN',
      customDate: true,
    });
    const { end } = getInitialDateTimes(filter, 'UTC');

    expect(end.hour).toBe('17');
    expect(end.minute).toBe('30');
    expect(end.second).toBe('45');
  });

  it('applies timezone conversion for BETWEEN end date', () => {
    const filter = makeFilter({
      value:
        'BETWEEN "2026-03-05T09:00:00.000Z" AND "2026-03-05T18:00:00.000Z"',
      conditional: 'BETWEEN',
      customDate: true,
    });
    const { end } = getInitialDateTimes(filter, 'America/Chicago');

    expect(end.hour).toBe('12');
    expect(end.minute).toBe('0');
    expect(end.second).toBe('0');
  });
});
