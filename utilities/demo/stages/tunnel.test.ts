import { createServer, type Server } from 'net';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { canConnect } from './tunnel';

let server: Server;
let port: number;

beforeAll(async () => {
  server = createServer();

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  port = (server.address() as { port: number }).port;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

/**
 * The address is read back out of an appended log, so a previous run's url can
 * satisfy the wait before this run's tunnel exists. That reads as success and
 * hands out a dead address, which then fails inside a cloud provider as a
 * connection refused, far from its cause. Proving the address locally is what
 * catches the whole class.
 */
describe('canConnect', () => {
  it('accepts an address something is listening on', async () => {
    expect(await canConnect(`127.0.0.1:${port}`)).toBe(true);
  });

  it('rejects an address nothing answers, which is the stale-tunnel case', async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));

    expect(await canConnect(`127.0.0.1:${port}`, 2_000)).toBe(false);

    server = createServer();
    await new Promise<void>((resolve) => {
      server.listen(port, '127.0.0.1', () => resolve());
    });
  });

  it('rejects malformed input rather than throwing', async () => {
    expect(await canConnect('no-port-here')).toBe(false);
    expect(await canConnect('127.0.0.1:not-a-number')).toBe(false);
  });
});
