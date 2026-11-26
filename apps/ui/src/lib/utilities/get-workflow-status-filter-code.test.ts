import { describe, expect, it } from 'vitest';

import { getStatusFilterCode } from './get-workflow-status-filter-code';

describe('getStatusFilterCode', () => {
  it('should return "1" if the status is "Running"', () => {
    expect(getStatusFilterCode('Running')).toBe('1');
  });

  it('should return "2" if the status is "Completed"', () => {
    expect(getStatusFilterCode('Completed')).toBe('2');
  });

  it('should return "3" if the status is "Failed"', () => {
    expect(getStatusFilterCode('Failed')).toBe('3');
  });

  it('should return "4" if the status is "Canceled"', () => {
    expect(getStatusFilterCode('Canceled')).toBe('4');
  });

  it('should return "5" if the status is "Terminated"', () => {
    expect(getStatusFilterCode('Terminated')).toBe('5');
  });

  it('should return "6" if the status is "ContinuedAsNew"', () => {
    expect(getStatusFilterCode('ContinuedAsNew')).toBe('6');
  });

  it('should return "7" if the status is "TimedOut"', () => {
    expect(getStatusFilterCode('TimedOut')).toBe('7');
  });

  it('should return "7" if the status is "TimedOut"', () => {
    expect(getStatusFilterCode('TimedOut')).toBe('7');
  });

  it('should return undefined if the status is bogus', () => {
    expect(getStatusFilterCode('Bogus')).toBe(undefined);
  });
});
