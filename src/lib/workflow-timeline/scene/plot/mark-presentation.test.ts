import { describe, expect, it } from 'vitest';

import { colorScales } from '$lib/theme/io/themes';

import { getEventPresentation, getMarkPresentation } from './mark-presentation';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import type { LifecycleKind } from '../../data/lifecycle-groups/types';

type EventType = QualifiedHistoryEvent['eventType'];

const durationKinds: LifecycleKind[] = [
  'activity',
  'timer',
  'child-workflow',
  'nexus-operation',
];
const pointKinds: LifecycleKind[] = ['event', 'external-signal', 'update'];

describe('getMarkPresentation', () => {
  it.each([0, 1, 8, 9, 100])(
    'keeps workflow marks noncompact at width %s',
    (width) => {
      expect(getMarkPresentation('workflow', 20, 20 + width)).toEqual({
        isWorkflow: true,
        isPoint: false,
        isCompact: false,
        showLine: width > 0,
      });
    },
  );

  it('does not show a workflow line for reversed bounds', () => {
    expect(getMarkPresentation('workflow', 20, 10).showLine).toBe(false);
  });

  describe.each(durationKinds)('%s duration marks', (kind) => {
    it.each([-1, 0, 7.999, 8, 8.001, 9])(
      'uses the inclusive compact threshold at width %s',
      (width) => {
        expect(getMarkPresentation(kind, 20, 20 + width)).toEqual({
          isWorkflow: false,
          isPoint: false,
          isCompact: width <= 8,
          showLine: width > 8,
        });
      },
    );
  });

  describe.each(pointKinds)('%s point marks', (kind) => {
    it.each([-10, 0, 8, 9, 100])(
      'stays a noncompact point independent of width %s',
      (width) => {
        expect(getMarkPresentation(kind, 20, 20 + width)).toEqual({
          isWorkflow: false,
          isPoint: true,
          isCompact: false,
          showLine: false,
        });
      },
    );
  });
});

describe('getEventPresentation', () => {
  it.each<[EventType, string]>([
    ['WorkflowExecutionCompleted', colorScales.green[9]],
    ['WorkflowExecutionFailed', colorScales.red[11]],
    ['WorkflowExecutionTerminated', colorScales.red[11]],
    ['WorkflowExecutionTimedOut', colorScales.persimmon[9]],
    ['WorkflowExecutionCanceled', colorScales.amber[9]],
    ['WorkflowExecutionContinuedAsNew', colorScales.indigo[9]],
  ])('colors workflow terminal %s as an outcome', (eventType, color) => {
    expect(getEventPresentation('workflow', eventType)).toEqual({
      color,
      isOutcome: true,
    });
  });

  it.each<EventType>([
    'WorkflowExecutionStarted',
    'WorkflowExecutionSignaled',
    'WorkflowTaskScheduled',
    'WorkflowTaskStarted',
    'WorkflowTaskCompleted',
    'WorkflowTaskFailed',
    'WorkflowTaskTimedOut',
    'ActivityTaskCompleted',
    'ActivityTaskFailed',
    'TimerFired',
  ])('keeps workflow-row %s muted and not an outcome', (eventType) => {
    expect(getEventPresentation('workflow', eventType)).toEqual({
      color: colorScales.neutral[8],
      isOutcome: false,
    });
  });

  it.each<[LifecycleKind, EventType, string]>([
    ['activity', 'ActivityTaskCompleted', colorScales.green[9]],
    ['activity', 'ActivityTaskFailed', colorScales.red[11]],
    ['activity', 'ActivityTaskTimedOut', colorScales.persimmon[9]],
    ['activity', 'ActivityTaskCanceled', colorScales.amber[9]],
    ['child-workflow', 'ChildWorkflowExecutionCompleted', colorScales.green[9]],
    ['child-workflow', 'ChildWorkflowExecutionTerminated', colorScales.red[11]],
    ['nexus-operation', 'NexusOperationCompleted', colorScales.green[9]],
    ['nexus-operation', 'NexusOperationFailed', colorScales.red[11]],
    ['timer', 'TimerFired', colorScales.tangerine[9]],
    ['timer', 'TimerCanceled', colorScales.amber[9]],
    ['update', 'WorkflowExecutionUpdateCompleted', colorScales.green[9]],
    [
      'external-signal',
      'SignalExternalWorkflowExecutionFailed',
      colorScales.red[11],
    ],
    ['event', 'WorkflowExecutionContinuedAsNew', colorScales.indigo[9]],
  ])('colors %s event %s as an outcome', (kind, eventType, color) => {
    expect(getEventPresentation(kind, eventType)).toEqual({
      color,
      isOutcome: true,
    });
  });

  it.each<[LifecycleKind, EventType, string]>([
    ['activity', 'ActivityTaskStarted', colorScales.zaffre[9]],
    ['child-workflow', 'ChildWorkflowExecutionStarted', colorScales.zaffre[9]],
    ['nexus-operation', 'NexusOperationStarted', colorScales.zaffre[9]],
    ['timer', 'TimerStarted', colorScales.zaffre[9]],
    ['activity', 'ActivityTaskScheduled', colorScales.neutral[8]],
    ['update', 'WorkflowExecutionUpdateAccepted', colorScales.neutral[8]],
    ['event', 'MarkerRecorded', colorScales.neutral[8]],
    ['event', 'WorkflowExecutionSignaled', colorScales.pink[9]],
    [
      'external-signal',
      'ExternalWorkflowExecutionSignaled',
      colorScales.pink[9],
    ],
  ])(
    'colors ordinary %s event %s without an outcome',
    (kind, eventType, color) => {
      expect(getEventPresentation(kind, eventType)).toEqual({
        color,
        isOutcome: false,
      });
    },
  );
});
