import { describe, expect, it } from 'vitest';

import type { WorkerHeartbeat, WorkerListInfo } from '$lib/types';

import { getWorkerHostName } from './get-worker-host-name';

describe('getWorkerHostName', () => {
  it('reads the host name from a worker list entry', () => {
    expect(
      getWorkerHostName({ hostName: 'list-host' } as unknown as WorkerListInfo),
    ).toBe('list-host');
  });

  it('reads the host name from a worker heartbeat', () => {
    expect(
      getWorkerHostName({
        hostInfo: { hostName: 'heartbeat-host' },
      } as unknown as WorkerHeartbeat),
    ).toBe('heartbeat-host');
  });

  it('returns undefined for a missing worker or host', () => {
    expect(getWorkerHostName(undefined)).toBeUndefined();
    expect(getWorkerHostName(null)).toBeUndefined();
    expect(
      getWorkerHostName({ hostInfo: {} } as unknown as WorkerHeartbeat),
    ).toBeUndefined();
  });
});
