import { describe, expect, it } from 'vitest';

import type { DescribeFullSchedule } from '$lib/types/schedule';

import { toScheduledActionRequest } from './request-mappings';
import { resolveScheduledAction } from './resolve-scheduled-action';
import type { ScheduledActionFormData } from './types';
import { formWorkflowDetailsSchema } from './workflow/schema';

const buildActionForm = (
  overrides: Record<string, unknown> = {},
): ScheduledActionFormData => ({
  type: 'workflow',
  details: formWorkflowDetailsSchema.parse({
    workflowType: 'MyWorkflow',
    workflowId: 'my-workflow-id',
    taskQueue: 'my-task-queue',
    ...overrides,
  }),
});

const resolveWorkflow = (schedule: DescribeFullSchedule | null) => {
  const resolved = resolveScheduledAction(schedule);
  if (resolved.type === 'unknown') {
    throw new Error('Expected a workflow schedule');
  }

  return resolved;
};

describe('toScheduledActionRequest', () => {
  it('maps a new workflow action', async () => {
    const request = await toScheduledActionRequest(
      buildActionForm(),
      resolveWorkflow(null),
    );

    expect(request.action.startWorkflow).toMatchObject({
      workflowId: 'my-workflow-id',
      workflowType: { name: 'MyWorkflow' },
      taskQueue: { name: 'my-task-queue' },
    });
  });

  it('keeps existing startWorkflow fields the form does not edit', async () => {
    const memo = { fields: { owner: { data: 'b3duZXI=' } } };
    const schedule = {
      schedule: {
        action: {
          startWorkflow: {
            workflowType: { name: 'OldWorkflow' },
            memo,
          },
        },
      },
    } as unknown as DescribeFullSchedule;

    const request = await toScheduledActionRequest(
      buildActionForm(),
      resolveWorkflow(schedule),
    );

    expect(request.action.startWorkflow.memo).toEqual(memo);
    expect(request.action.startWorkflow.workflowType).toEqual({
      name: 'MyWorkflow',
    });
  });

  it('returns only the action-owned policies', async () => {
    const request = await toScheduledActionRequest(
      buildActionForm({ keepOriginalWorkflowId: true }),
      resolveWorkflow(null),
    );

    expect(request.policies).toEqual({ keepOriginalWorkflowId: true });
  });
});
