import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';

export type Supervised = {
  label: string;
  pid: number;
  logFile?: string;
  stop: () => Promise<void>;
};

const signalGroup = (pid: number, signal: NodeJS.Signals) => {
  try {
    process.kill(-pid, signal);
  } catch {
    try {
      process.kill(pid, signal);
    } catch {
      // Already gone.
    }
  }
};

export const stopPid = async (pid: number) => {
  signalGroup(pid, 'SIGINT');

  await new Promise((resolve) => setTimeout(resolve, 500));

  signalGroup(pid, 'SIGKILL');
};

/**
 * Starts a long-running child in its own process group. A wrapper such as
 * `pnpm exec vite` would otherwise leave its real work running when only the
 * wrapper is signalled, and `demo stop` needs one pid it can rely on.
 */
/** Whatever still listens on a port, so a stop is not limited to known pids. */
export const listenersOn = async (port: number): Promise<number[]> => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');

  try {
    const { stdout } = await promisify(execFile)('lsof', [
      '-nP',
      `-iTCP:${port}`,
      '-sTCP:LISTEN',
      '-t',
    ]);

    return stdout
      .split('\n')
      .map((line) => Number.parseInt(line.trim(), 10))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  } catch {
    // lsof exits non-zero when nothing is listening.
    return [];
  }
};

export const startDetached = (
  label: string,
  command: string,
  args: readonly string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv; logFile?: string } = {},
): Supervised => {
  const log = options.logFile ? openSync(options.logFile, 'a') : 'ignore';

  const child = spawn(command, [...args], {
    stdio: ['ignore', log, log],
    detached: true,
    cwd: options.cwd,
    env: options.env ?? process.env,
  });

  child.unref();
  child.on('error', () => {});

  const pid = child.pid;

  if (!pid) throw new Error(`Could not start ${label}.`);

  return { label, pid, logFile: options.logFile, stop: () => stopPid(pid) };
};
