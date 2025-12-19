import { join } from 'path';

import waitForPort from 'wait-port';
import { $ } from 'zx';

export type UIServer = {
  shutdown: () => Promise<number | null>;
  ready: () => ReturnType<typeof waitForPort>;
};

let uiServer: UIServer;

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
  options?: { verbose?: boolean },
) => {
  $.cwd = join(process.cwd(), 'server');

  // Check for verbose mode via env var or options
  const verbose = options?.verbose ?? process.env.UI_SERVER_VERBOSE === 'true';
  const hotReload = process.env.UI_SERVER_HOT_RELOAD === 'true';

  let uiServerProcess: {
    kill: () => Promise<void>;
    exitCode: Promise<number | null>;
  };

  if (hotReload) {
    // Install Air if not already available
    try {
      await $`which air`.quiet();
    } catch {
      console.log('📦 Installing Air for hot reloading...');
      await $`go install github.com/air-verse/air@latest`;
    }

    // Use Air for hot reloading in development
    uiServerProcess = verbose ? $`air` : $`air`.quiet();
    console.log(
      `✨ ui-server running in ${env} mode with hot reload on port ${portForEnv(env)}`,
    );
  } else {
    // Use traditional build for e2e
    await $`make build`;
    uiServerProcess = verbose
      ? $`./ui-server --env ${env} start`
      : $`./ui-server --env ${env} start`.quiet();
    console.log(
      `✨ ui-server running in ${env} mode on port ${portForEnv(env)}`,
    );
  }

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
