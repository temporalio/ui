import { describe, expect, it } from 'vitest';

import { getEventLinkHref, getEventLinkValue } from './event-link-href';

describe('getEventLinkHref', () => {
  it('should return event history event route when eventId exists', () => {
    const link = {
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
        eventRef: {
          eventId: '42',
        },
      },
    };

    const result = getEventLinkHref(link);
    expect(result).toBe(
      '/namespaces/test-ns/workflows/test-wf/test-run/history/events/42',
    );
  });

  it('should return event history event route with eventId 1 for workflow execution started', () => {
    const link = {
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
        eventRef: {
          eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
        },
      },
    };

    const result = getEventLinkHref(link);
    expect(result).toBe(
      '/namespaces/test-ns/workflows/test-wf/test-run/history/events/1',
    );
  });

  it('should return event history event route with requestId when requestId exists', () => {
    const link = {
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
        requestIdRef: {
          requestId: 'req-123',
        },
      },
    };

    const result = getEventLinkHref(link);
    expect(result).toBe(
      '/namespaces/test-ns/workflows/test-wf/test-run/history/events/req-123',
    );
  });

  it('should return event history route as fallback', () => {
    const link = {
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
      },
    };

    const result = getEventLinkHref(link);
    expect(result).toBe(
      '/namespaces/test-ns/workflows/test-wf/test-run/history',
    );
  });

  it('should prioritize eventId over other conditions', () => {
    const link = {
      workflowEvent: {
        namespace: 'test-ns',
        workflowId: 'test-wf',
        runId: 'test-run',
        eventRef: {
          eventId: '99',
          eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
        },
        requestIdRef: {
          requestId: 'req-456',
        },
      },
    };

    const result = getEventLinkHref(link);
    expect(result).toBe(
      '/namespaces/test-ns/workflows/test-wf/test-run/history/events/99',
    );
  });
});

describe('getEventLinkValue', () => {
  it('should return workflow path with eventId when eventId exists', () => {
    const link = {
      workflowEvent: {
        workflowId: 'test-workflow',
        eventRef: {
          eventId: '42',
        },
      },
    };

    const result = getEventLinkValue(link);
    expect(result).toBe('test-workflow/history/events/42');
  });

  it('should return workflow path with eventId 1 for workflow execution started', () => {
    const link = {
      workflowEvent: {
        workflowId: 'test-workflow',
        eventRef: {
          eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
        },
      },
    };

    const result = getEventLinkValue(link);
    expect(result).toBe('test-workflow/history/events/1');
  });

  it('should return workflow path with requestId when requestId exists', () => {
    const link = {
      workflowEvent: {
        workflowId: 'test-workflow',
        requestIdRef: {
          requestId: 'req-789',
        },
      },
    };

    const result = getEventLinkValue(link);
    expect(result).toBe('test-workflow/history/events/req-789');
  });

  it('should return workflow history path as fallback', () => {
    const link = {
      workflowEvent: {
        workflowId: 'test-workflow',
      },
    };

    const result = getEventLinkValue(link);
    expect(result).toBe('test-workflow/history');
  });

  it('should prioritize eventId over other conditions', () => {
    const link = {
      workflowEvent: {
        workflowId: 'test-workflow',
        eventRef: {
          eventId: '100',
          eventType: 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED',
        },
        requestIdRef: {
          requestId: 'req-999',
        },
      },
    };

    const result = getEventLinkValue(link);
    expect(result).toBe('test-workflow/history/events/100');
  });

  it('should handle undefined nested properties safely', () => {
    const link = {
      workflowEvent: {
        workflowId: 'test-workflow',
        eventRef: {},
        requestIdRef: {},
      },
    };

    const result = getEventLinkValue(link);
    expect(result).toBe('test-workflow/history');
  });
});
