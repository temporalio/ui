import { join } from 'path';
import waitForPort from 'wait-port';
import { $ } from 'zx';

const temporalCliPath = join(process.cwd(), 'bin', 'cli', 'temporal');

type TemporalServerOptions = {
  port?: number;
  uiPort?: number;
};

export type TemporalServer = {
  shutdown: () => Promise<number | null>;
  ready: () => Promise<boolean>;
};

export const createTemporalServer = ({
  port = 7233,
  uiPort = port + 1000,
}: TemporalServerOptions = {}) => {
  const temporal = $`${temporalCliPath} server start-dev --port=${port} --ui-port=${uiPort} --log-level="fatal"`;

  temporal.quiet();

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
    shutdown,
    ready,
  };
};
