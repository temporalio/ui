import { readFileSync } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { createConnection } from 'net';
import { join } from 'path';

import { chalk } from 'zx';

import type { TunnelDefinition } from '../definition';
import { type Logger, runDirFor } from '../paths';
import { startDetached, type Supervised } from '../process';
import { failure, NGROK_DOC, ngrokFixes } from '../remedy';

export type RunningTunnel = {
  process?: Supervised;
  /** host:port a process outside this machine can dial to reach the frontend. */
  publicAddress: string;
};

/**
 * ngrok's JSON log announces the tunnel with the public url once it is
 * established. TCP urls arrive as `tcp://host:port`.
 */
const publicAddressFrom = (logFile: string): string | undefined => {
  try {
    const matches = [
      ...readFileSync(logFile, 'utf8').matchAll(/"url":"tcp:\/\/([^"]+)"/g),
    ];

    return matches.at(-1)?.[1];
  } catch {
    return undefined;
  }
};

type TunnelFailure = { code?: string; reported?: string };

/**
 * What ngrok said, not just that it failed. Its JSON log carries the message
 * on `err` or `msg`, and names the class of problem as ERR_NGROK_nnnn.
 */
const tunnelError = (logFile: string): TunnelFailure | undefined => {
  let text = '';

  try {
    text = readFileSync(logFile, 'utf8');
  } catch {
    return undefined;
  }

  const code = /ERR_NGROK_\d+/.exec(text)?.[0];
  const messages = [...text.matchAll(/"(?:err|msg)":"((?:[^"\\]|\\.)*)"/g)]
    .map(([, value]) => value.replace(/\\"/g, '"').replace(/\\n/g, ' '))
    .filter((value) =>
      /error|fail|denied|unauthor|limit|ERR_NGROK/i.test(value),
    );

  if (!code && !messages.length) return undefined;

  return { code, reported: messages.at(-1) };
};

/** Whether something accepts a TCP connection at host:port. */
export const canConnect = (
  address: string,
  timeoutMs = 10_000,
): Promise<boolean> => {
  const separator = address.lastIndexOf(':');
  const host = address.slice(0, separator);
  const port = Number.parseInt(address.slice(separator + 1), 10);

  if (!host || !Number.isInteger(port)) return Promise.resolve(false);

  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const finish = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('error', () => finish(false));
    socket.once('timeout', () => finish(false));
  });
};

const waitForAddress = async (logFile: string, timeoutMs: number) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const address = publicAddressFrom(logFile);

    if (address) return address;

    if (tunnelError(logFile)) return undefined;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return undefined;
};

/**
 * Publishes the frontend on a public address.
 *
 * A server-scaled Worker runs wherever Temporal launched it — a Lambda, a
 * Cloud Run pool, a Bedrock AgentCore session — and dials the frontend back to
 * poll. That inbound leg is the one thing a dev server on localhost cannot
 * offer, so a scenario covering server-scaled Workers needs this and the
 * outbound leg to the provider is never the problem.
 *
 * The address is not stable across runs: a fresh tunnel means a fresh
 * hostname, so anything holding it (a provider's environment, say) has to be
 * updated per run rather than configured once.
 */
export const startTunnel = async (
  tunnel: TunnelDefinition,
  frontendPort: number,
  log: Logger,
  runName: string,
): Promise<RunningTunnel> => {
  const port = tunnel.targetPort ?? frontendPort;
  const directory = runDirFor(runName);

  await mkdir(directory, { recursive: true });

  const logFile = join(directory, 'tunnel.log');

  // Children append to their log, and the address is read back out of it, so a
  // previous run's url would satisfy the wait before this ngrok has written
  // anything. That reads as success and hands out a dead address, which then
  // fails far away from here as a connection refused inside the provider.
  await rm(logFile, { force: true });

  log(`Opening an ngrok TCP tunnel to 127.0.0.1:${port}`);

  const child = startDetached(
    'tunnel',
    'ngrok',
    ['tcp', String(port), '--log', 'stdout', '--log-format', 'json'],
    { logFile },
  );

  const publicAddress = await waitForAddress(logFile, tunnel.readyTimeoutMs);

  if (!publicAddress) {
    await child.stop();

    const problem = tunnelError(logFile);

    throw failure({
      attempting: `Could not open an ngrok TCP tunnel to 127.0.0.1:${port}, so a Worker running in a cloud provider would have no way to reach the frontend.`,
      reported: problem?.code
        ? [problem.code, problem.reported].filter(Boolean).join(': ')
        : problem?.reported,
      fixes: ngrokFixes(problem?.code),
      seeAlso: [
        `Tunnel log: ${logFile}`,
        ...(problem?.code ? [NGROK_DOC(problem.code)] : []),
        'Run the tunnel by hand to see it fail live: ngrok tcp ' + String(port),
      ],
    });
  }

  // Prove the address before handing it to anything. A tunnel that reports a
  // url and does not carry traffic is indistinguishable from a working one
  // until something remote fails to dial it.
  const reachable = await canConnect(publicAddress);

  if (!reachable) {
    await child.stop();

    throw failure({
      attempting: `The ngrok tunnel reported ${publicAddress}, but nothing accepted a connection there, so a Worker in a cloud provider could not reach the frontend either.`,
      fixes: [
        `Confirm the frontend is listening: nc -z 127.0.0.1 ${port}`,
        'Check for another ngrok agent holding the account session: pkill ngrok, then retry.',
      ],
      seeAlso: [`Tunnel log: ${logFile}`],
    });
  }

  log(chalk.dim(`Tunnel open: ${publicAddress} -> 127.0.0.1:${port}`));

  return { process: child, publicAddress };
};
