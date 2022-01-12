import {
  toListWorkflowQuery,
  fromListWorkflowQuery,
} from './list-workflow-query';

describe(toListWorkflowQuery, () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should convert an executionStatus', () => {
    const query = toListWorkflowQuery({ executionStatus: 'Running' });
    expect(query).toBe('ExecutionStatus="Running"');
  });

  it('should convert an timeRange with a Duration as a value', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
    const twentyFourHoursEarlier = '2019-12-31T00:00:00Z';

    const query = toListWorkflowQuery({ timeRange: { hours: 24 } });

    expect(query).toBe(`StartTime="${twentyFourHoursEarlier}"`);
  });

  it('should convert an two values using an "and"', () => {
    const query = toListWorkflowQuery({
      executionStatus: 'Running',
      workflowId: 'abcdef123',
    });

    expect(query).toBe('ExecutionStatus="Running" and WorkflowId="abcdef123"');
  });

  it('should convert an three values using an "and"', () => {
    const query = toListWorkflowQuery({
      executionStatus: 'Running',
      workflowId: 'abcdef123',
      workflowType: 'ImportantBusinessTransaction',
    });

    expect(query).toBe(
      'ExecutionStatus="Running" and WorkflowId="abcdef123" and WorkflowType="ImportantBusinessTransaction"',
    );
  });
});
