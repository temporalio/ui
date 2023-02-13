import { join } from 'path';
import waitForPort from 'wait-port';
import { $, chalk } from 'zx';

const temporalCliPath = join(process.cwd(), 'bin', 'cli', 'temporal');

type TemporalServerOptions = {
  port?: number;
  uiPort?: number;
  logLevel?: string;
};

const warn = (message: string) => {
  console.warn(`${chalk.bgYellow.black('WARN')}: ${message}`);
};

export type TemporalServer = {
  shutdown: () => Promise<number | null>;
  ready: () => Promise<boolean>;
};

export const createTemporalServer = async ({
  port = 7233,
  uiPort = port + 1000,
  logLevel = 'fatal',
}: TemporalServerOptions = {}) => {
  const flags = [
    `--port=${port}`,
    `--ui-port=${uiPort}`,
    `--log-level=${logLevel}`,
  ];

  const temporal = $`${temporalCliPath} server start-dev ${flags}`.quiet();

  temporal.catch(async ({ stdout }) => {
    const { error }: { error: string } = JSON.parse(stdout);
    if (error.includes('address already in use')) {
      return warn(
        `Port ${port} is already in use. Falling back to whatever is running on that port.`,
      );
    }

    throw new Error(stdout);
  });

  const shutdown = async () => {
    await temporal.kill();
    return await temporal.exitCode;
  };

  const ready = async () => {
    const ports = await Promise.all([
      waitForPort({ port, output: 'silent' }),
      waitForPort({ port: uiPort, output: 'silent' }),
    ]);
    return ports.every(({ open }) => open);
  };

  return {
    ready,
    shutdown,
  };
};
