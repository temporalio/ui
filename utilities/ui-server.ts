import { join } from 'path';
import waitForPort from 'wait-port';
import { $, chalk } from 'zx';

export type UIServer = {
  shutdown: () => Promise<number | null>;
  ready: () => ReturnType<typeof waitForPort>;
};

let uiServer: UIServer;

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

export const getUIServer = (): UIServer => {
  return uiServer;
};

type Environemt = 'development' | 'e2e';

const portForEnv = (env: Environemt) => {
  if (env === 'development') return 8081;
  if (env === 'e2e') return 8080;
};

export const createUIServer = async (
  env: 'development' | 'e2e' = 'development',
) => {
  $.cwd = join(process.cwd(), 'server');

  try {
    await validateUIServerPath();
  } catch {
    console.warn(chalk.bgYellow("Couldn't find UI Server. Building"));
    await $`make build-server`;
  }

  const uiServerProcess = $`./ui-server --env ${env} start`.quiet();
  console.log(`✨ ui-server running in ${env} mode on port ${portForEnv(env)}`);

  const shutdown = async () => {
    await uiServerProcess.kill();
    console.log('🔪 killed ui-server');
    return await uiServerProcess.exitCode;
  };

  const ready = async () => {
    return waitForPort({ port: portForEnv(env), output: 'silent' });
  };

  uiServer = {
    shutdown,
    ready,
  };

  return uiServer;
};
