import { describe, expect, it } from 'vitest';

import { connectWithRetry } from './connection-retry';

const connectionRefused = () =>
  new Error(
    'tonic::transport::Error(Transport, ConnectError(ConnectError("tcp connect error", 127.0.0.1:7233, Os { code: 61, kind: ConnectionRefused, message: "Connection refused" })))',
  );

describe('connectWithRetry', () => {
  it('returns the connection once the server accepts', async () => {
    let attempts = 0;
    const waits: number[] = [];

    const connection = await connectWithRetry({
      connect: async () => {
        attempts += 1;
        if (attempts < 3) throw connectionRefused();
        return { connected: true };
      },
      wait: async (ms) => {
        waits.push(ms);
      },
    });

    expect(connection).toEqual({ connected: true });
    expect(attempts).toBe(3);
    expect(waits).toEqual([1_000, 1_000]);
  });

  it('reports each wait so the developer knows what is happening', async () => {
    let attempts = 0;
    const reported: number[] = [];

    await connectWithRetry({
      connect: async () => {
        attempts += 1;
        if (attempts < 2) throw connectionRefused();
        return {};
      },
      onWaiting: ({ attempt }) => reported.push(attempt),
      wait: async () => {},
    });

    expect(reported).toEqual([1]);
  });

  it('gives up after the configured attempts with the last error', async () => {
    let attempts = 0;

    await expect(
      connectWithRetry({
        connect: async () => {
          attempts += 1;
          throw connectionRefused();
        },
        attempts: 4,
        wait: async () => {},
      }),
    ).rejects.toThrow('Connection refused');
    expect(attempts).toBe(4);
  });

  it('fails immediately on errors that retrying cannot fix', async () => {
    let attempts = 0;

    await expect(
      connectWithRetry({
        connect: async () => {
          attempts += 1;
          throw new Error('Request unauthorized: invalid API key');
        },
        wait: async () => {},
      }),
    ).rejects.toThrow('invalid API key');
    expect(attempts).toBe(1);
  });
});
