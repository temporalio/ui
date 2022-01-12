import { getWorkflowFilterParameters } from './get-workflow-filter-parameters';

describe(getWorkflowFilterParameters, () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should always have an earliest_time set', () => {
    const result = getWorkflowFilterParameters();
    expect(result['start_time_filter.earliest_time']).toBeDefined();
  });

  it('should always have a default earliest_time of 24 hours', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
    const OneDayEarlier = '2019-12-31T00:00:00Z';

    const result = getWorkflowFilterParameters();
    expect(result['start_time_filter.earliest_time']).toBe(OneDayEarlier);
  });

  it('should adjust the start time based on a duration', () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01').getTime());
    const NinetyDaysEarlier = '2019-10-03T00:00:00Z';

    const result = getWorkflowFilterParameters({ timeRange: { days: 90 } });
    expect(result['start_time_filter.earliest_time']).toBe(NinetyDaysEarlier);
  });

  it('should pass through a workflow ID', () => {
    const result = getWorkflowFilterParameters({ workflowId: 'string value' });
    expect(result['execution_filter.workflow_id']).toBe('string value');
  });

  it('should pass through a workflow type', () => {
    const result = getWorkflowFilterParameters({
      workflowType: 'string value',
    });
    expect(result['type_filter.name']).toBe('string value');
  });

  it('should not include a workflow ID filter if none is provided', () => {
    const result = getWorkflowFilterParameters();
    expect(result['execution_filter.workflow_id']).toBeUndefined();
  });

  it('should not include a workflow ID filter if null is provided', () => {
    const result = getWorkflowFilterParameters({ workflowId: null });
    expect(result['execution_filter.workflow_id']).toBeUndefined();
  });

  it('should not include a workflow ID filter if an empty string is provided', () => {
    const result = getWorkflowFilterParameters({ workflowId: '' });
    expect(result['execution_filter.workflow_id']).toBeUndefined();
  });

  it('should not include a workflow type filter if none is provided', () => {
    const result = getWorkflowFilterParameters();
    expect(result['type_filter.name']).toBeUndefined();
  });

  it('should not include a workflow type filter if null is provided', () => {
    const result = getWorkflowFilterParameters({ workflowType: null });
    expect(result['type_filter.name']).toBeUndefined();
  });

  it('should not include a workflow type filter if an empty string is provided', () => {
    const result = getWorkflowFilterParameters({ workflowType: '' });
    expect(result['type_filter.name']).toBeUndefined();
  });

  it('should return a status filter if one is provided', () => {
    const result = getWorkflowFilterParameters({ executionStatus: 'Running' });
    expect(result['status_filter.status']).toBe('1');
  });
});
