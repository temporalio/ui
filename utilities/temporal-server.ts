import { join } from 'path';

import waitForPort from 'wait-port';
import { $, chalk } from 'zx';

export type TemporalServer = {
  shutdown: () => Promise<number | null>;
  ready: () => Promise<boolean>;
};

const localCLIPath = join(process.cwd(), 'bin', 'cli', 'temporal');

export type TemporalServerOptions = {
  port?: number;
  uiPort?: number;
  path?: string;
  logLevel?: string;
  codecEndpoint?: string;
  headless?: boolean;
  dbFilename?: string;
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

let temporalServer: TemporalServer;

export const getTemporalServer = (): TemporalServer => temporalServer;

export const createTemporalServer = async ({
  port = 7233,
  uiPort = port + 1000,
  path = localCLIPath,
  logLevel = 'error',
  codecEndpoint,
  headless = false,
  dbFilename,
}: TemporalServerOptions = {}) => {
  const cliPath = await getCLIPath(path);

  const flags = [
    `--port=${port}`,
    `--ui-port=${uiPort}`,
    `--log-level=${logLevel}`,
    `--http-port=${port + 1}`,
  ];

  if (codecEndpoint) {
    flags.push(`--ui-codec-endpoint=${codecEndpoint}`);
  }

  if (headless) {
    flags.push('--headless');
  }

  if (dbFilename) {
    flags.push(`--db-filename=${dbFilename}`);
  }

  [
    { flag: 'frontend.enableUpdateWorkflowExecution', value: 'true' },
    {
      flag: 'frontend.enableUpdateWorkflowExecutionAsyncAccepted',
      value: 'true',
    },
    { flag: 'frontend.workerVersioningDataAPIs', value: 'true' },
    { flag: 'frontend.workerVersioningWorkflowAPIs', value: 'true' },
    { flag: 'worker.buildIdScavengerEnabled', value: 'true' },
    { flag: 'system.enableNexus', value: 'true' },
  ].forEach(({ flag, value }) => {
    flags.push('--dynamic-config-value');
    flags.push(`${flag}=${value}`);
  });

  const temporal = $`${cliPath} server start-dev ${flags}`.quiet();

  temporal.catch(async ({ stdout, stderr, exitCode }) => {
    console.log('EXIT CODE', exitCode);
    if (exitCode) {
      try {
        const { error }: { error: string } = JSON.parse(stdout);

        if (error.includes('address already in use')) {
          return warn(
            `Port ${port} is already in use. Falling back to whatever is running on that port.`,
          );
        }
      } catch {
        console.error(stderr);
      }
    }
  });

  const shutdown = async () => {
    await temporal.kill();
    console.log(
      `🔪 killed temporal server, exited with code: ${await temporal.exitCode}`,
    );
    return await temporal.exitCode;
  };

  const ready = async () => {
    const ports = [
      waitForPort({ port, output: 'silent' }),
      !headless && waitForPort({ port: uiPort, output: 'silent' }),
    ];

    const portsPromise = await Promise.all(ports).then((ports) => {
      console.log(`✨ temporal dev server running on port: ${port}`);

      return ports;
    });

    return portsPromise.every(({ open }) => open);
  };

  temporalServer = {
    ready,
    shutdown,
  };

  return temporalServer;
};
