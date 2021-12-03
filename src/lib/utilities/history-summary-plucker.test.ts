import { getHistorySummary } from './history-summary-plucker';

describe(getHistorySummary, () => {
  it('should return back unchanged ev', () => {
    const event = {
      eventId: '11',
      eventTime: '2021-12-02T21:51:06.992475543Z',
      eventType: 'WorkflowExecutionCompleted',
      version: '0',
      taskId: '1048850',
      workflowExecutionCompletedEventAttributes: {
        result: null,
        workflowTaskCompletedEventId: '10',
      },
      id: '11',
    };

    expect(getHistorySummary(event)).toStrictEqual({
      result: null,
    });
  });
});
