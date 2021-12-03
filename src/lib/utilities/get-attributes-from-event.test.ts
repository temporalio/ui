import { getAttributesFromEvent } from './get-attributes-from-event';

describe(getAttributesFromEvent, () => {
  it('should return back unchanged attributes of result and workflowTaskCompletedEventId', () => {
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

    expect(getAttributesFromEvent(event)).toStrictEqual({
      attributes: { result: null, workflowTaskCompletedEventId: '10' },
      type: 'workflowExecutionCompletedEventAttributes',
    });
  });

  it('should return back unchanged attributes only result', () => {
    const event = {
      eventId: '7',
      eventTime: '2021-12-02T21:51:06.976972251Z',
      eventType: 'ActivityTaskCompleted',
      version: '0',
      taskId: '1048841',
      activityTaskCompletedEventAttributes: {
        result: null,
        scheduledEventId: '5',
        startedEventId: '6',
        identity: '74553@Josephs-MacBook-Pro-2.local@',
      },
      id: '7',
    };
    expect(getAttributesFromEvent(event)).toStrictEqual({
      attributes: { result: null },
      type: 'activityTaskCompletedEventAttributes',
    });
  });
});
