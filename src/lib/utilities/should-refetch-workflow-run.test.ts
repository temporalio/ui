import { describe, expect, test } from 'vitest';

import { Action as ActivityAction } from '$lib/models/activity-actions';
import { Action as WorkflowAction } from '$lib/models/workflow-actions';
import type { RefreshAction } from '$lib/stores/workflow-run';

import { shouldRefetchWorkflowRun } from './should-refetch-workflow-run';

const refresh = (action: RefreshAction['action'] = null): RefreshAction => ({
  timestamp: 1_700_000_000_000,
  action,
});

describe('shouldRefetchWorkflowRun', () => {
  test('refetches for a zero-valued action even when live updates are paused', () => {
    expect(ActivityAction.Pause).toBe(0);
    expect(
      shouldRefetchWorkflowRun({
        refresh: refresh(ActivityAction.Pause),
        pauseLiveUpdates: true,
        isRunning: true,
      }),
    ).toBe(true);

    expect(WorkflowAction.Cancel).toBe(0);
    expect(
      shouldRefetchWorkflowRun({
        refresh: refresh(WorkflowAction.Cancel),
        pauseLiveUpdates: true,
        isRunning: true,
      }),
    ).toBe(true);
  });

  test('refetches for an action on a workflow that is not running', () => {
    expect(
      shouldRefetchWorkflowRun({
        refresh: refresh(ActivityAction.Pause),
        pauseLiveUpdates: false,
        isRunning: false,
      }),
    ).toBe(true);
  });

  test('refetches for every other action', () => {
    for (const action of [
      ActivityAction.Unpause,
      ActivityAction.Update,
      ActivityAction.Reset,
    ]) {
      expect(
        shouldRefetchWorkflowRun({
          refresh: refresh(action),
          pauseLiveUpdates: true,
          isRunning: false,
        }),
      ).toBe(true);
    }
  });

  test('polls without an action only while live and not paused', () => {
    expect(
      shouldRefetchWorkflowRun({
        refresh: refresh(),
        pauseLiveUpdates: false,
        isRunning: true,
      }),
    ).toBe(true);
    expect(
      shouldRefetchWorkflowRun({
        refresh: refresh(),
        pauseLiveUpdates: true,
        isRunning: true,
      }),
    ).toBe(false);
    expect(
      shouldRefetchWorkflowRun({
        refresh: refresh(),
        pauseLiveUpdates: false,
        isRunning: false,
      }),
    ).toBe(false);
    expect(
      shouldRefetchWorkflowRun({
        refresh: refresh(),
        pauseLiveUpdates: false,
        isRunning: undefined,
      }),
    ).toBe(false);
  });

  test('never refetches for the initial store value', () => {
    for (const action of [null, ActivityAction.Pause, ActivityAction.Update]) {
      expect(
        shouldRefetchWorkflowRun({
          refresh: { timestamp: 0, action },
          pauseLiveUpdates: false,
          isRunning: true,
        }),
      ).toBe(false);
    }
  });
});
