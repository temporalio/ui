import { getHistorySummary } from './history-summary-plucker';

describe(getHistorySummary, () => {
  it('should return back unchanged ev', () => {
    const event = {
      workflowExecutionStartedEventAttributes: {
        attempt: 1,
        workflowRunTimeout: '100s',
        identity: 'some identity',
        input: 'true',
        Parent: undefined,
        workflowType: {
          name: 'Rainbow Workflow',
        },
      },
      eventType: 'WorkflowExecutionStarted',
    };

    expect(getHistorySummary(event)).toStrictEqual({
      'Close Timeout': '100s',
      identity: 'some identity',
      input: 'true',
      Parent: undefined,
      Workflow: 'Rainbow Workflow',
    });
  });
});
