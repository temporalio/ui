import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getNexusOperationExecution,
  pollNexusOperationExecution,
} from '$lib/services/standalone-nexus-operations';
import type { NexusOperationExecution } from '$lib/types/nexus-operation-execution';

import { StandaloneNexusOperationPoller } from './standalone-nexus-operation-poller.svelte';

vi.mock('$lib/services/standalone-nexus-operations', () => ({
  getNexusOperationExecution: vi.fn(),
  pollNexusOperationExecution: vi.fn(),
}));

const originalInput = {
  metadata: { encoding: 'anNvbi9wbGFpbg==' },
  data: 'MQ==',
};
const newInput = { metadata: { encoding: 'anNvbi9wbGFpbg==' }, data: 'Mg==' };

const execution = (
  overrides: Partial<NexusOperationExecution> = {},
  status: NexusOperationExecution['info']['status'] = 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING',
): NexusOperationExecution =>
  ({
    info: { status },
    longPollToken: 'token',
    ...overrides,
  }) as NexusOperationExecution;

const abortError = () => {
  const error = new Error('aborted');
  error.name = 'AbortError';
  return error;
};

describe('StandaloneNexusOperationPoller', () => {
  let onUpdate: ReturnType<typeof vi.fn>;
  let onError: ReturnType<typeof vi.fn>;

  const createPoller = () =>
    new StandaloneNexusOperationPoller(
      'default',
      'operation-id',
      'run-id',
      new AbortController(),
      onUpdate,
      onError,
    );

  beforeEach(() => {
    vi.resetAllMocks();
    onUpdate = vi.fn();
    onError = vi.fn();
  });

  it('keeps the initial input when a polled update omits it', async () => {
    vi.mocked(getNexusOperationExecution).mockResolvedValue(
      execution({ input: originalInput }),
    );
    vi.mocked(pollNexusOperationExecution)
      .mockResolvedValueOnce(
        execution({}, 'NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED'),
      )
      .mockRejectedValueOnce(abortError());

    await createPoller().start();

    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        input: originalInput,
        info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED' },
      }),
    );
  });

  it('uses the input from a polled update when it is present', async () => {
    vi.mocked(getNexusOperationExecution).mockResolvedValue(
      execution({ input: originalInput }),
    );
    vi.mocked(pollNexusOperationExecution)
      .mockResolvedValueOnce(execution({ input: newInput }))
      .mockRejectedValueOnce(abortError());

    await createPoller().start();

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ input: newInput }),
    );
  });

  it('carries the input from fetchOnce into later polled updates', async () => {
    vi.mocked(getNexusOperationExecution)
      .mockResolvedValueOnce(execution({ input: originalInput }))
      .mockResolvedValueOnce(execution({ input: newInput }));
    vi.mocked(pollNexusOperationExecution).mockImplementation(async () => {
      if (vi.mocked(getNexusOperationExecution).mock.calls.length < 2) {
        await poller.fetchOnce();
        return {} as NexusOperationExecution;
      }
      vi.mocked(pollNexusOperationExecution).mockRejectedValue(abortError());
      return execution();
    });

    const poller = createPoller();
    await poller.start();

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ input: newInput }),
    );
  });
});
