import { join } from 'path';
import waitForPort from 'wait-port';
import { $, chalk } from 'zx';

export type UIServer = {
  shutdown: () => Promise<number | null>;
  ready: () => ReturnType<typeof waitForPort>;
};

const uiServerExecutablePath = join(process.cwd(), 'server', 'ui-server');

const validateUIServerPath = async (): Promise<void> => {
  const stylizedPath = chalk.yellowBright(uiServerExecutablePath);

  console.log(`Checking UI Server at ${stylizedPath}…`);

  const { stdout, exitCode } = await $`${uiServerExecutablePath} -v`
    .quiet()
    .nothrow();

  if (exitCode === 0) {
    console.log(
      chalk.greenBright(
        `UI Server found at ${stylizedPath}\n\t`,
        '→',
        chalk.green(stdout.trim()),
      ),
    );
  } else {
    throw new Error();
  }
};

export const createUIServer = async (port = 8081) => {
  $.cwd = join(process.cwd(), 'server');

  try {
    await validateUIServerPath();
  } catch {
    console.warn(chalk.bgYellow("Couldn't find UI Server. Building"));
    await $`make build-server`;
  }

  const uiServerProcess = $`./ui-server --env development start`;

  const shutdown = async () => {
    await uiServerProcess.kill();
    return await uiServerProcess.exitCode;
  };

  const ready = async () => {
    return waitForPort({ port, output: 'silent' });
  };

  return {
    shutdown,
    ready,
  };
};
