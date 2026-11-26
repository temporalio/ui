import { describe, expect, it } from 'vitest';

import { toWorkflowExecution } from '$lib/models/workflow-execution';
import type { WorkflowExecution } from '$lib/types/workflows';

import {
  getWorkflowCurrentTime,
  getWorkflowLatestTime,
} from './workflow-time-skipping';

const wallTime = Date.parse('2026-11-09T12:00:00Z');
const virtualTime = Date.parse('2027-11-09T12:00:00Z');
const workflow = {
  ...toWorkflowExecution(),
  workflowExtendedInfo: {
    timeSkippingInfo: {
      currentTime: new Date(virtualTime).toISOString(),
      effectiveConfig: { enabled: false },
    },
  },
} satisfies WorkflowExecution;

describe('workflow clocks', () => {
  it('uses current virtual time for countdowns but close time for duration endpoints', () => {
    const closeTime = virtualTime - 60_000;
    const closed = { ...workflow, endTime: new Date(closeTime).toISOString() };

    expect(getWorkflowCurrentTime(closed, wallTime)).toBe(virtualTime);
    expect(getWorkflowLatestTime(closed, wallTime, virtualTime + 5000)).toBe(
      closeTime,
    );
  });

  it('uses the latest virtual or received event time without extrapolating browser time', () => {
    expect(getWorkflowCurrentTime(workflow, wallTime)).toBe(virtualTime);
    expect(getWorkflowCurrentTime(workflow, wallTime + 10_000)).toBe(
      virtualTime,
    );
    expect(getWorkflowLatestTime(workflow, wallTime)).toBe(virtualTime);
    expect(getWorkflowLatestTime(workflow, wallTime, virtualTime - 5000)).toBe(
      virtualTime,
    );
    expect(
      getWorkflowLatestTime(workflow, wallTime + 10_000, virtualTime + 5000),
    ).toBe(virtualTime + 5000);
  });

  it('uses the browser fallback for ordinary workflows and ignores the event watermark', () => {
    const ordinary = toWorkflowExecution();

    expect(getWorkflowCurrentTime(ordinary, wallTime)).toBe(wallTime);
    expect(getWorkflowLatestTime(ordinary, wallTime, virtualTime)).toBe(
      wallTime,
    );
    expect(getWorkflowCurrentTime(undefined, wallTime)).toBe(wallTime);
    expect(getWorkflowLatestTime(undefined, wallTime)).toBe(wallTime);
  });
});
