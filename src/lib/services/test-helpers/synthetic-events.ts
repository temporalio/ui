import type { HistoryEvent } from '$lib/types/events';

const TIME = '2024-01-01T00:00:00.000000000Z';

function base(eventId: number, eventType: string): HistoryEvent {
  return {
    eventId: String(eventId),
    eventTime: TIME,
    eventType,
    version: '0',
    taskId: String(eventId * 10),
    links: [],
  } as unknown as HistoryEvent;
}

// ---------------------------------------------------------------------------
// Individual event builders
// ---------------------------------------------------------------------------

export function makeWorkflowStarted(eventId: number): HistoryEvent {
  return {
    ...base(eventId, 'WorkflowExecutionStarted'),
    workflowExecutionStartedEventAttributes: {
      workflowType: { name: 'TestWorkflow' },
      taskQueue: { name: 'default', kind: 'Normal' },
      input: null,
      attempt: 1,
      firstExecutionRunId: 'run-1',
      originalExecutionRunId: 'run-1',
    },
  } as unknown as HistoryEvent;
}

export function makeWorkflowCompleted(eventId: number): HistoryEvent {
  return {
    ...base(eventId, 'WorkflowExecutionCompleted'),
    workflowExecutionCompletedEventAttributes: { result: null },
  } as unknown as HistoryEvent;
}

export function makeActivityScheduled(
  eventId: number,
  name = 'TestActivity',
): HistoryEvent {
  return {
    ...base(eventId, 'ActivityTaskScheduled'),
    activityTaskScheduledEventAttributes: {
      activityId: String(eventId),
      activityType: { name },
      taskQueue: { name: 'default', kind: 'Normal' },
      namespace: '',
      input: null,
    },
  } as unknown as HistoryEvent;
}

export function makeActivityStarted(
  eventId: number,
  scheduledEventId: number,
): HistoryEvent {
  return {
    ...base(eventId, 'ActivityTaskStarted'),
    activityTaskStartedEventAttributes: {
      scheduledEventId: String(scheduledEventId),
      identity: 'worker@host',
      requestId: `req-${eventId}`,
      attempt: 1,
      lastFailure: null,
    },
  } as unknown as HistoryEvent;
}

export function makeActivityCompleted(
  eventId: number,
  scheduledEventId: number,
  startedEventId: number,
): HistoryEvent {
  return {
    ...base(eventId, 'ActivityTaskCompleted'),
    activityTaskCompletedEventAttributes: {
      result: null,
      scheduledEventId: String(scheduledEventId),
      startedEventId: String(startedEventId),
      identity: 'worker@host',
    },
  } as unknown as HistoryEvent;
}

export function makeTimerStarted(
  eventId: number,
  timerId?: string,
): HistoryEvent {
  return {
    ...base(eventId, 'TimerStarted'),
    timerStartedEventAttributes: {
      timerId: timerId ?? String(eventId),
      startToFireTimeout: '10s',
      workflowTaskCompletedEventId: String(eventId - 1),
    },
  } as unknown as HistoryEvent;
}

export function makeTimerFired(
  eventId: number,
  startedEventId: number,
): HistoryEvent {
  return {
    ...base(eventId, 'TimerFired'),
    timerFiredEventAttributes: {
      timerId: String(startedEventId),
      startedEventId: String(startedEventId),
    },
  } as unknown as HistoryEvent;
}

export function makeWorkflowTaskScheduled(eventId: number): HistoryEvent {
  return {
    ...base(eventId, 'WorkflowTaskScheduled'),
    workflowTaskScheduledEventAttributes: {
      taskQueue: { name: 'default', kind: 'Normal' },
      startToCloseTimeout: '10s',
    },
  } as unknown as HistoryEvent;
}

export function makeWorkflowTaskStarted(
  eventId: number,
  scheduledEventId: number,
): HistoryEvent {
  return {
    ...base(eventId, 'WorkflowTaskStarted'),
    workflowTaskStartedEventAttributes: {
      scheduledEventId: String(scheduledEventId),
      identity: 'worker@host',
      requestId: `req-${eventId}`,
    },
  } as unknown as HistoryEvent;
}

export function makeWorkflowTaskFailed(
  eventId: number,
  scheduledEventId: number,
  cause = 'WorkflowWorkerUnhandledFailure',
): HistoryEvent {
  return {
    ...base(eventId, 'WorkflowTaskFailed'),
    workflowTaskFailedEventAttributes: {
      scheduledEventId: String(scheduledEventId),
      startedEventId: String(scheduledEventId + 1),
      cause,
      failure: null,
      identity: 'worker@host',
    },
  } as unknown as HistoryEvent;
}

export function makeWorkflowTaskCompleted(
  eventId: number,
  scheduledEventId: number,
): HistoryEvent {
  return {
    ...base(eventId, 'WorkflowTaskCompleted'),
    workflowTaskCompletedEventAttributes: {
      scheduledEventId: String(scheduledEventId),
      startedEventId: String(scheduledEventId + 1),
      identity: 'worker@host',
    },
  } as unknown as HistoryEvent;
}

// ---------------------------------------------------------------------------
// Composite group builders (return events in ascending ID order)
// ---------------------------------------------------------------------------

/** Returns [Scheduled, Started, Completed] at IDs [startId, startId+1, startId+2] */
export function makeActivityGroup(
  startId: number,
  name = 'TestActivity',
): [HistoryEvent, HistoryEvent, HistoryEvent] {
  return [
    makeActivityScheduled(startId, name),
    makeActivityStarted(startId + 1, startId),
    makeActivityCompleted(startId + 2, startId, startId + 1),
  ];
}

/** Returns [Started, Fired] at IDs [startId, startId+1] */
export function makeTimerGroup(startId: number): [HistoryEvent, HistoryEvent] {
  return [makeTimerStarted(startId), makeTimerFired(startId + 1, startId)];
}

/** Returns [Scheduled, Started, Completed] at IDs [startId, startId+1, startId+2] */
export function makeWorkflowTaskGroup(
  startId: number,
): [HistoryEvent, HistoryEvent, HistoryEvent] {
  return [
    makeWorkflowTaskScheduled(startId),
    makeWorkflowTaskStarted(startId + 1, startId),
    makeWorkflowTaskCompleted(startId + 2, startId),
  ];
}

// ---------------------------------------------------------------------------
// Bulk generators
// ---------------------------------------------------------------------------

/**
 * Generates N events in a deterministic repeating pattern:
 *   [WorkflowExecutionStarted]
 *   [ActivityScheduled, ActivityStarted, ActivityCompleted] × repeat
 *   [TimerStarted, TimerFired] × repeat
 *   (last events padded with solo WorkflowExecutionCompleted)
 *
 * All events have sequential ascending IDs from 1..N.
 * The resulting array is sorted ascending by eventId.
 */
export function makeSyntheticEvents(n: number): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  let id = 1;

  // Event 1: workflow started (solo)
  if (n >= 1) {
    events.push(makeWorkflowStarted(id++));
  }

  // Fill remaining with alternating activity groups (3 events) and timer groups (2 events)
  // Pattern period = 5 events
  let useActivity = true;
  while (id <= n) {
    if (useActivity && id + 2 <= n) {
      events.push(...makeActivityGroup(id));
      id += 3;
    } else if (!useActivity && id + 1 <= n) {
      events.push(...makeTimerGroup(id));
      id += 2;
    } else if (id <= n) {
      // Pad with solo completed event
      events.push(makeWorkflowCompleted(id++));
    }
    useActivity = !useActivity;
  }

  return events;
}

/**
 * Same as makeSyntheticEvents but interleaves WorkflowTask groups (WFT)
 * so tests that filter WFT groups have something to filter.
 * Pattern: [WFT group (3)] [Activity group (3)] repeating.
 */
export function makeSyntheticEventsWithWorkflowTasks(
  n: number,
): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  let id = 1;

  if (n >= 1) {
    events.push(makeWorkflowStarted(id++));
  }

  let useWft = true;
  while (id <= n) {
    if (useWft && id + 2 <= n) {
      events.push(...makeWorkflowTaskGroup(id));
      id += 3;
    } else if (!useWft && id + 2 <= n) {
      events.push(...makeActivityGroup(id));
      id += 3;
    } else {
      events.push(makeWorkflowCompleted(id++));
    }
    useWft = !useWft;
  }

  return events;
}
