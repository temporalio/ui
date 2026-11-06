import { beforeEach, describe, expect, it, vi } from 'vitest';

import { recordLiveTimelineTick } from './activity.js';
import { catalogExample } from './example.js';
import { timelineLiveWorkflow } from './workflow.js';
import validateJsonSchema from '../../../browser/schema-validator.js';

const mocks = vi.hoisted(() => ({
  activity: vi.fn<(tick: number) => Promise<string>>(),
  condition:
    vi.fn<(predicate: () => boolean, timeout: number) => Promise<boolean>>(),
  continueAsNew: vi.fn<(...args: number[]) => Promise<never>>(),
  proxyActivities: vi.fn(),
  setHandler: vi.fn<
    (
      definition: { name: string },
      handler: () => void | {
        ticksThisRun: number;
        remainingDurationSeconds: number;
        stopRequested: boolean;
      },
    ) => void
  >(),
}));

vi.mock('@temporalio/workflow', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@temporalio/workflow')>();
  mocks.proxyActivities.mockReturnValue({
    recordLiveTimelineTick: mocks.activity,
  });
  return {
    ...original,
    proxyActivities: mocks.proxyActivities,
    condition: mocks.condition,
    continueAsNew: mocks.continueAsNew,
    setHandler: mocks.setHandler,
  };
});

function stopWorkflow() {
  const handler = mocks.setHandler.mock.calls.find(
    ([definition]) => definition.name === 'timelineLiveStop',
  )?.[1];
  expect(handler).toBeDefined();
  handler?.();
}

function progress() {
  return mocks.setHandler.mock.calls.find(
    ([definition]) => definition.name === 'timelineLiveProgress',
  )?.[1]();
}

beforeEach(() => {
  mocks.activity.mockReset().mockResolvedValue('Recorded tick');
  mocks.condition.mockReset().mockResolvedValue(false);
  mocks.continueAsNew
    .mockReset()
    .mockRejectedValue(new Error('Continue as new'));
  mocks.setHandler.mockClear();
});

describe('timeline live workflow', () => {
  it('uses safe activity options', () => {
    expect(mocks.proxyActivities).toHaveBeenCalledWith({
      startToCloseTimeout: '5 seconds',
      retry: { maximumAttempts: 3 },
    });
  });

  it('defaults to 24 hours with 5-second intervals and 10-minute runs', async () => {
    await expect(timelineLiveWorkflow()).rejects.toThrow('Continue as new');
    expect(mocks.activity).toHaveBeenCalledTimes(120);
    expect(mocks.activity).toHaveBeenNthCalledWith(1, 1);
    expect(mocks.activity).toHaveBeenNthCalledWith(120, 120);
    expect(
      mocks.condition.mock.calls.every(([, timeout]) => timeout === 5000),
    ).toBe(true);
    expect(mocks.continueAsNew).toHaveBeenCalledWith(85800, 5, 120);
  });

  it('records immediately and waits the exact final remainder', async () => {
    mocks.activity.mockImplementation(async () => {
      expect(mocks.condition).not.toHaveBeenCalled();
      return 'Recorded tick';
    });
    await expect(timelineLiveWorkflow(1, 60, 1000)).resolves.toContain(
      'configured duration',
    );
    expect(mocks.condition).toHaveBeenCalledWith(expect.any(Function), 1000);
    expect(mocks.continueAsNew).not.toHaveBeenCalled();
  });

  it('accounts for full intervals and a partial final interval', async () => {
    await timelineLiveWorkflow(11, 5, 20);
    expect(mocks.activity.mock.calls).toEqual([[1], [2], [3]]);
    expect(mocks.condition.mock.calls.map(([, timeout]) => timeout)).toEqual([
      5000, 5000, 1000,
    ]);
    expect(progress()).toEqual({
      ticksThisRun: 3,
      remainingDurationSeconds: 0,
      stopRequested: false,
    });
  });

  it('completes instead of continuing when duration ends at the run boundary', async () => {
    await timelineLiveWorkflow(40, 2, 20);
    expect(mocks.activity).toHaveBeenCalledTimes(20);
    expect(mocks.continueAsNew).not.toHaveBeenCalled();
  });

  it('carries a one-second remainder into a new run', async () => {
    await expect(timelineLiveWorkflow(41, 2, 20)).rejects.toThrow(
      'Continue as new',
    );
    expect(mocks.continueAsNew).toHaveBeenCalledWith(1, 2, 20);
    mocks.activity.mockClear();
    mocks.condition.mockClear();
    await timelineLiveWorkflow(1, 2, 20);
    expect(mocks.activity.mock.calls).toEqual([[1]]);
    expect(mocks.condition.mock.calls.map(([, timeout]) => timeout)).toEqual([
      1000,
    ]);
  });

  it('stops a pending timer successfully without continuing as new', async () => {
    mocks.condition.mockImplementation(async (predicate) => {
      stopWorkflow();
      return predicate();
    });
    await expect(timelineLiveWorkflow()).resolves.toBe(
      'Live timeline stopped by signal and completed',
    );
    expect(mocks.activity).toHaveBeenCalledTimes(1);
    expect(mocks.continueAsNew).not.toHaveBeenCalled();
    expect(progress()).toEqual({
      ticksThisRun: 1,
      remainingDurationSeconds: 86400,
      stopRequested: true,
    });
  });

  it('does not continue if a stop arrives at the run boundary', async () => {
    mocks.condition.mockImplementation(async () => {
      if (mocks.activity.mock.calls.length === 20) stopWorkflow();
      return false;
    });
    await expect(timelineLiveWorkflow(100, 2, 20)).resolves.toContain(
      'stopped by signal',
    );
    expect(mocks.activity).toHaveBeenCalledTimes(20);
    expect(mocks.continueAsNew).not.toHaveBeenCalled();
  });

  it('accepts the maximum bounds', async () => {
    mocks.condition.mockImplementation(async (predicate) => {
      stopWorkflow();
      return predicate();
    });
    await expect(timelineLiveWorkflow(604800, 60, 1000)).resolves.toContain(
      'stopped by signal',
    );
    expect(mocks.condition).toHaveBeenCalledWith(expect.any(Function), 60000);
  });

  it.each([
    [0, 5, 120],
    [604801, 5, 120],
    [1.5, 5, 120],
    [NaN, 5, 120],
    [Infinity, 5, 120],
    [1, 1, 120],
    [1, 61, 120],
    [1, 2.5, 120],
    [1, NaN, 120],
    [1, Infinity, 120],
    [1, 5, 19],
    [1, 5, 1001],
    [1, 5, 20.5],
    [1, 5, NaN],
    [1, 5, Infinity],
  ])(
    'rejects invalid arguments (%s, %s, %s) without starting work',
    async (duration, interval, ticks) => {
      await expect(
        timelineLiveWorkflow(duration, interval, ticks),
      ).rejects.toMatchObject({ nonRetryable: true });
      expect(mocks.activity).not.toHaveBeenCalled();
      expect(mocks.condition).not.toHaveBeenCalled();
      expect(mocks.setHandler).not.toHaveBeenCalled();
    },
  );
});

describe('timeline live catalog example', () => {
  it('exposes the exact workflow and activity names', async () => {
    expect(catalogExample.id).toBe('timeline-live');
    expect(catalogExample.title).toBe('Timeline live: long-running workflow');
    expect(catalogExample.execution).toEqual({
      kind: 'workflow',
      workflowType: 'timelineLiveWorkflow',
      workflow: timelineLiveWorkflow,
      activities: { recordLiveTimelineTick },
    });
    await expect(recordLiveTimelineTick(3)).resolves.toBe(
      'Recorded live timeline tick 3',
    );
  });

  it('provides valid defaults and matching schema bounds', async () => {
    expect(catalogExample.input.defaultValue).toEqual([86400, 5, 120]);
    await expect(
      validateJsonSchema(
        catalogExample.input.schema,
        catalogExample.input.defaultValue,
      ),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(catalogExample.input.schema, [1, 2, 20]),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(catalogExample.input.schema, [604800, 60, 1000]),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(catalogExample.startOptions.schema, {}),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(catalogExample.startOptions.schema, {
        workflowId: 'timeline-live-test',
      }),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(catalogExample.startOptions.schema, {
        workflowId: '',
      }),
    ).resolves.toBe(false);
  });

  it.each([
    [0, 5, 120],
    [604801, 5, 120],
    [1.5, 5, 120],
    [1, 1, 120],
    [1, 61, 120],
    [1, 2.5, 120],
    [1, 5, 19],
    [1, 5, 1001],
    [1, 5, 20.5],
    [86400],
    [86400, 5, 120, 1],
  ])('rejects invalid descriptor input %j', async (...input) => {
    await expect(
      validateJsonSchema(catalogExample.input.schema, input),
    ).resolves.toBe(false);
  });
});
