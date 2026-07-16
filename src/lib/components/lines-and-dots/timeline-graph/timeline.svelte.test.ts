import { describe, expect, it } from 'vitest';

import type { WorkflowEvents } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

import { Timeline } from './timeline.svelte';

const T0 = Date.UTC(2022, 0, 1, 0, 0, 0);
const iso = (offsetMs: number): string => new Date(T0 + offsetMs).toISOString();

function makeTimeline({
  fullEventHistory = [],
  currentTimeMs = T0 + 100_000,
  workflow,
}: {
  fullEventHistory?: WorkflowEvents;
  currentTimeMs?: number;
  workflow?: Partial<WorkflowExecution>;
} = {}): Timeline {
  const resolvedWorkflow = {
    executionTime: iso(0),
    startTime: iso(0),
    endTime: iso(100_000),
    ...workflow,
  } as unknown as WorkflowExecution;

  return new Timeline({
    getFullEventHistory: () => fullEventHistory,
    getWorkflow: () => resolvedWorkflow,
    getEventGroups: () => [],
    getCurrentTimeMs: () => currentTimeMs,
  });
}

const eventAt = (offsetMs: number) =>
  ({ eventTime: iso(offsetMs) }) as unknown as WorkflowEvents[number];

describe('Timeline.workflowTimespan', () => {
  it('starts at the earliest of the event history and executionTime', () => {
    const cleanup = $effect.root(() => {
      const timeline = makeTimeline({
        fullEventHistory: [eventAt(5_000), eventAt(20_000)],
        workflow: { executionTime: iso(2_000) },
      });
      expect(timeline.workflowTimespan.startTimeMs).toBe(T0 + 2_000);
      expect(timeline.workflowTimespan.endTimeMs).toBe(T0 + 100_000);
    });
    cleanup();
  });

  it('does not throw and falls back to startTime when executionTime is missing', () => {
    const cleanup = $effect.root(() => {
      const timeline = makeTimeline({
        fullEventHistory: [],
        workflow: { executionTime: undefined, startTime: iso(3_000) },
      });
      expect(() => timeline.workflowTimespan).not.toThrow();
      expect(timeline.workflowTimespan.startTimeMs).toBe(T0 + 3_000);
    });
    cleanup();
  });

  it('uses event times when executionTime is missing but history exists', () => {
    const cleanup = $effect.root(() => {
      const timeline = makeTimeline({
        fullEventHistory: [eventAt(4_000), eventAt(9_000)],
        workflow: { executionTime: undefined, startTime: iso(8_000) },
      });
      // earliest event (4s) precedes startTime (8s)
      expect(timeline.workflowTimespan.startTimeMs).toBe(T0 + 4_000);
    });
    cleanup();
  });

  it('falls back to the end time when no start time can be derived', () => {
    const cleanup = $effect.root(() => {
      const timeline = makeTimeline({
        fullEventHistory: [],
        currentTimeMs: T0 + 50_000,
        workflow: {
          executionTime: undefined,
          startTime: undefined,
          endTime: undefined,
        },
      });
      expect(() => timeline.workflowTimespan).not.toThrow();
      // end falls back to the current time, and start falls back to end
      expect(timeline.workflowTimespan.startTimeMs).toBe(T0 + 50_000);
      expect(timeline.workflowTimespan.endTimeMs).toBe(T0 + 50_000);
      expect(timeline.workflowTimespan.endUnbounded).toBe(true);
    });
    cleanup();
  });

  it('is endUnbounded and ends at the current time when the workflow has no end time', () => {
    const cleanup = $effect.root(() => {
      const timeline = makeTimeline({
        currentTimeMs: T0 + 75_000,
        workflow: { endTime: undefined },
      });
      expect(timeline.workflowTimespan.endTimeMs).toBe(T0 + 75_000);
      expect(timeline.workflowTimespan.endUnbounded).toBe(true);
    });
    cleanup();
  });

  it('clamps start to end instead of throwing when an event precedes no valid bound but follows the end', () => {
    const cleanup = $effect.root(() => {
      const timeline = makeTimeline({
        fullEventHistory: [eventAt(120_000)],
        workflow: { executionTime: iso(110_000), endTime: iso(100_000) },
      });
      expect(() => timeline.workflowTimespan).not.toThrow();
      expect(timeline.workflowTimespan.startTimeMs).toBe(T0 + 100_000);
      expect(timeline.workflowTimespan.endTimeMs).toBe(T0 + 100_000);
    });
    cleanup();
  });
});
