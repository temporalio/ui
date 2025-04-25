import { join } from 'path';

import waitForPort from 'wait-port';
import { $ } from 'zx';

export type UIServer = {
  shutdown: () => Promise<number | null>;
  ready: () => ReturnType<typeof waitForPort>;
};

export type ValidEnv = 'development' | 'e2e' | 'with-auth';

let uiServer: UIServer;

export const getUIServer = (): UIServer => {
  return uiServer;
};

const portForEnv = (env: ValidEnv) => {
  if (env === 'e2e') return 8080;
  return 8081;
};

export const createUIServer = async (env: ValidEnv = 'development') => {
  $.cwd = join(process.cwd(), 'server');

  await $`make build`;

  const uiServerProcess = $`./ui-server --env ${env} start`; //.quiet();
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
