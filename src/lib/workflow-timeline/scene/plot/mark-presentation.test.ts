import { describe, expect, it } from 'vitest';

import { colorScales } from '$lib/theme/io/themes';

import {
  getEventDescription,
  getEventLabel,
  getEventPresentation,
  getMarkPresentation,
  outcomeColors,
} from './mark-presentation';
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
    ['WorkflowExecutionUpdateCompleted', colorScales.green[9]],
    ['WorkflowExecutionFailed', colorScales.red[11]],
    ['WorkflowExecutionTerminated', colorScales.red[11]],
    ['WorkflowExecutionTimedOut', colorScales.persimmon[9]],
    ['WorkflowExecutionCanceled', colorScales.amber[9]],
    ['WorkflowExecutionContinuedAsNew', colorScales.indigo[9]],
  ])('colors workflow terminal %s as an outcome', (eventType, color) => {
    expect(getEventPresentation('workflow', eventType)).toEqual({
      color,
      isOutcome: true,
      shape: eventType.includes('Update') ? 'diamond' : 'circle',
    });
  });

  it.each<EventType>([
    'WorkflowExecutionStarted',
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
      shape: 'circle',
    });
  });

  it.each<[LifecycleKind, EventType, string, 'circle' | 'diamond']>([
    ['activity', 'ActivityTaskCompleted', colorScales.green[9], 'circle'],
    ['activity', 'ActivityTaskFailed', colorScales.red[11], 'circle'],
    ['activity', 'ActivityTaskTimedOut', colorScales.persimmon[9], 'circle'],
    ['activity', 'ActivityTaskCanceled', colorScales.amber[9], 'circle'],
    [
      'child-workflow',
      'ChildWorkflowExecutionCompleted',
      colorScales.green[9],
      'circle',
    ],
    [
      'child-workflow',
      'ChildWorkflowExecutionFailed',
      colorScales.red[11],
      'circle',
    ],
    [
      'child-workflow',
      'ChildWorkflowExecutionTerminated',
      colorScales.red[11],
      'circle',
    ],
    [
      'child-workflow',
      'ChildWorkflowExecutionTimedOut',
      colorScales.persimmon[9],
      'circle',
    ],
    [
      'child-workflow',
      'ChildWorkflowExecutionCanceled',
      colorScales.amber[9],
      'circle',
    ],
    [
      'nexus-operation',
      'NexusOperationCompleted',
      colorScales.green[9],
      'circle',
    ],
    ['nexus-operation', 'NexusOperationFailed', colorScales.red[11], 'circle'],
    [
      'nexus-operation',
      'NexusOperationTimedOut',
      colorScales.persimmon[9],
      'circle',
    ],
    [
      'nexus-operation',
      'NexusOperationCanceled',
      colorScales.amber[9],
      'circle',
    ],
    ['timer', 'TimerFired', colorScales.green[9], 'circle'],
    ['timer', 'TimerCanceled', colorScales.amber[9], 'circle'],
    [
      'update',
      'WorkflowExecutionUpdateCompleted',
      colorScales.green[9],
      'diamond',
    ],
    [
      'external-signal',
      'SignalExternalWorkflowExecutionFailed',
      colorScales.red[11],
      'diamond',
    ],
    [
      'event',
      'WorkflowExecutionContinuedAsNew',
      colorScales.indigo[9],
      'circle',
    ],
  ])('colors %s event %s as an outcome', (kind, eventType, color, shape) => {
    expect(getEventPresentation(kind, eventType)).toEqual({
      color,
      isOutcome: true,
      shape,
    });
  });

  it.each<[LifecycleKind, EventType, 'circle' | 'diamond' | 'square']>([
    ['activity', 'ActivityTaskStarted', 'circle'],
    ['child-workflow', 'ChildWorkflowExecutionStarted', 'circle'],
    ['nexus-operation', 'NexusOperationStarted', 'circle'],
    ['timer', 'TimerStarted', 'circle'],
    ['activity', 'ActivityTaskScheduled', 'circle'],
    ['update', 'WorkflowExecutionUpdateAccepted', 'diamond'],
    ['event', 'MarkerRecorded', 'square'],
    ['workflow', 'MarkerRecorded', 'square'],
    ['event', 'WorkflowExecutionStarted', 'circle'],
    ['event', 'WorkflowExecutionSignaled', 'diamond'],
    ['workflow', 'WorkflowExecutionSignaled', 'diamond'],

    ['event', 'WorkflowExecutionUpdateAdmitted', 'diamond'],
    ['event', 'WorkflowExecutionUpdateAccepted', 'diamond'],
    ['external-signal', 'ExternalWorkflowExecutionSignaled', 'diamond'],
    ['external-signal', 'SignalExternalWorkflowExecutionInitiated', 'diamond'],
    ['external-signal', 'ActivityTaskStarted', 'diamond'],
    ['update', 'ActivityTaskStarted', 'diamond'],
  ])(
    'keeps ordinary %s event %s neutral with shape %s',
    (kind, eventType, shape) => {
      expect(getEventPresentation(kind, eventType)).toEqual({
        color: colorScales.neutral[8],
        isOutcome: false,
        shape,
      });
    },
  );

  it.each<LifecycleKind>(['event', 'workflow', 'external-signal', 'update'])(
    'keeps local markers square for kind %s',
    (kind) => {
      expect(getEventPresentation(kind, 'MarkerRecorded')).toEqual({
        color: colorScales.neutral[8],
        isOutcome: false,
        shape: 'square',
      });
    },
  );
});

describe('outcomeColors', () => {
  it('exports the standardized legend palette', () => {
    expect(outcomeColors).toEqual({
      completed: colorScales.green[9],
      failed: colorScales.red[11],
      timedOut: colorScales.persimmon[9],
      canceled: colorScales.amber[9],
      continuedAsNew: colorScales.indigo[9],
    });
  });
});

describe('getEventLabel', () => {
  it.each<[EventType, string]>([
    ['ActivityTaskCompleted', 'Activity task completed'],
    ['WorkflowExecutionContinuedAsNew', 'Workflow execution continued as new'],
    ['WorkflowExecutionTimedOut', 'Workflow execution timed out'],
    ['WorkflowExecutionSignaled', 'Workflow execution signaled'],
    ['WorkflowExecutionUpdateAccepted', 'Workflow execution update accepted'],
    ['MarkerRecorded', 'Marker recorded'],
    ['TimerFired', 'Timer fired'],
  ])('formats %s as %s', (eventType, label) => {
    expect(getEventLabel(eventType)).toBe(label);
  });
});

describe('getEventDescription', () => {
  it.each([0, 1])('uses only the label for count %s', (count) => {
    expect(getEventDescription('ActivityTaskCompleted', count)).toBe(
      'Activity task completed',
    );
  });

  it.each([2, 10, 100])('includes the cluster count %s', (count) => {
    expect(getEventDescription('WorkflowExecutionContinuedAsNew', count)).toBe(
      `${count} events · Workflow execution continued as new`,
    );
  });
});
