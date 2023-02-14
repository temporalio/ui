import { join } from 'path';
import waitForPort from 'wait-port';
import { $, chalk } from 'zx';

export type TemporalServer = {
  shutdown: () => Promise<number | null>;
  ready: () => Promise<boolean>;
};

const localCLIPath = join(process.cwd(), 'bin', 'cli', 'temporal');

type TemporalServerOptions = {
  port?: number;
  uiPort?: number;
  path?: string;
  logLevel?: string;
};

const warn = (message: Parameters<typeof console.warn>[0]) => {
  console.warn(`${chalk.bgYellow.black('WARN')}: ${message}`);
};

const getCLIPath = async (cliPath = localCLIPath): Promise<string | void> => {
  const stylizedPath = chalk.yellowBright(cliPath);

  console.log(chalk.yellow(`Checking Temporal CLI at ${stylizedPath}…`));

  const { stdout, exitCode } = await $`${cliPath} -v`.quiet().nothrow();

  if (exitCode === 0) {
    console.log(
      chalk.greenBright(
        `Temporal CLI found at ${stylizedPath}:\n\t`,
        '→',
        chalk.green(stdout.trim()),
      ),
    );

    return cliPath;
  }

  const { stdout: globalPath } = await $`which temporal`.nothrow();

  if (globalPath && cliPath !== globalPath.trim())
    return getCLIPath(globalPath.trim());

  warn("Couldn't find Temporal CLI. Skipping…");
};

export const createTemporalServer = async ({
  port = 7233,
  uiPort = port + 1000,
  path = localCLIPath,
  logLevel = 'fatal',
}: TemporalServerOptions = {}) => {
  const cliPath = await getCLIPath(path);

  const flags = [
    `--port=${port}`,
    `--ui-port=${uiPort}`,
    `--log-level=${logLevel}`,
  ];

  const temporal = $`${cliPath} server start-dev ${flags}`.quiet();

  temporal.catch(async ({ stdout, stderr, exitCode }) => {
    if (exitCode) {
      try {
        const { error }: { error: string } = JSON.parse(stdout);

        if (error.includes('address already in use')) {
          return warn(
            `Port ${port} is already in use. Falling back to whatever is running on that port.`,
          );
        }

        throw new Error(stderr ?? stdout);
      } catch (error) {
        throw new Error(stderr ?? stdout);
      }
    }
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
