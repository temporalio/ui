import { describe, expect, it } from 'vitest';

import { isWorkflowDelayed } from './delayed-workflows';

describe('isWorkflowDelayed', () => {
  it('should return true if the execution time has not yet passed', () => {
    expect(isWorkflowDelayed({ executionTime: Date.now() + 10000 })).toEqual(
      true,
    );
  });
  it('should return false if the execution time is not defined', () => {
    expect(isWorkflowDelayed({})).toEqual(false);
  });
  it('should return false if the execution time has passed', () => {
    expect(isWorkflowDelayed({ executionTime: Date.now() })).toEqual(false);
    expect(isWorkflowDelayed({ executionTime: Date.now() - 10000 })).toEqual(
      false,
    );
  });
});
