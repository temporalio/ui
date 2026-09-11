import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import waitForPort from 'wait-port';
import { $, chalk } from 'zx';

import type { UiDefinition } from '../definition';
import { type Logger, runDirFor, WORK_DIR } from '../paths';
import { startDetached, type Supervised } from '../process';

export type RunningUi = {
  apiUrl?: string;
  webUrl?: string;
  processes: Supervised[];
};

const CONFIG_DIR_NAME = 'ui-server-config';

const replaceScalar = (yaml: string, key: string, value: string) => {
  const pattern = new RegExp(`^${key}:.*$`, 'm');

  return pattern.test(yaml)
    ? yaml.replace(pattern, `${key}: ${value}`)
    : `${key}: ${value}\n${yaml}`;
};

/**
 * The ui-server reads `temporalGrpcAddress` from YAML only, with no environment
 * override, so a demo on a non-default port needs its own config. Generating a
 * config directory here keeps `server/config` untouched.
 */
const writeConfig = async (ui: UiDefinition, address: string) => {
  const source = join(process.cwd(), 'server', 'config');
  const destination = join(WORK_DIR, CONFIG_DIR_NAME);

  await mkdir(destination, { recursive: true });

  const base = replaceScalar(
    await readFile(join(source, 'base.yaml'), 'utf8'),
    'temporalGrpcAddress',
    address,
  );

  const development = replaceScalar(
    replaceScalar(
      await readFile(join(source, 'development.yaml'), 'utf8'),
      'port',
      String(ui.apiPort),
    ),
    'enableUi',
    'false',
  );

  await writeFile(join(destination, 'base.yaml'), base);
  await writeFile(join(destination, 'development.yaml'), development);

  return destination;
};

const startUiServer = async (
  ui: UiDefinition,
  address: string,
  log: Logger,
  runName: string,
): Promise<Supervised> => {
  const serverDir = join(process.cwd(), 'server');
  const binary = join(serverDir, 'ui-server');
  const configDir = await writeConfig(ui, address);

  if (ui.rebuildUiServer || !existsSync(binary)) {
    log('Building the ui-server binary (make build)');

    const build = await $({ cwd: serverDir })`make build`.quiet().nothrow();

    if (build.exitCode !== 0) {
      throw new Error(`make build failed in server/:\n${build.stderr}`);
    }
  }

  log(`Starting the ui-server on port ${ui.apiPort}, pointed at ${address}`);

  await mkdir(runDirFor(runName), { recursive: true });

  const child = startDetached(
    'ui-server',
    binary,
    [
      '--root',
      WORK_DIR,
      '--config',
      CONFIG_DIR_NAME,
      '--env',
      'development',
      'start',
    ],
    { cwd: serverDir, logFile: join(runDirFor(runName), 'ui-server.log') },
  );

  const ready = await waitForPort({
    port: ui.apiPort,
    output: 'silent',
    timeout: 60_000,
  });

  if (!ready.open) {
    await child.stop();

    throw new Error(
      [
        `The ui-server did not come up on port ${ui.apiPort}.`,
        `Its config is in ${configDir} and its log is at ${child.logFile}.`,
      ].join('\n'),
    );
  }

  return child;
};

const startWeb = async (
  ui: UiDefinition,
  log: Logger,
  runName: string,
): Promise<Supervised> => {
  log(`Starting the UI dev server on port ${ui.webPort}`);

  await mkdir(runDirFor(runName), { recursive: true });

  const child = startDetached(
    'ui',
    'pnpm',
    [
      'exec',
      'vite',
      'dev',
      '--mode',
      'feature-demo',
      '--port',
      String(ui.webPort),
      '--strictPort',
    ],
    {
      env: {
        ...process.env,
        VITE_API: `http://localhost:${ui.apiPort}`,
        VITE_MODE: 'development',
        VITE_TEMPORAL_UI_BUILD_TARGET: 'local',
      },
      logFile: join(runDirFor(runName), 'ui.log'),
    },
  );

  const ready = await waitForPort({
    port: ui.webPort,
    output: 'silent',
    timeout: 120_000,
  });

  if (!ready.open) {
    await child.stop();

    throw new Error(
      `The UI dev server did not come up on port ${ui.webPort}. Its log is at ${child.logFile}.`,
    );
  }

  return child;
};

const reuseIfRunning = async (port: number, label: string, log: Logger) => {
  const running = await waitForPort({ port, timeout: 250, output: 'silent' });

  if (running.open) {
    log(
      chalk.yellow(`Reusing the ${label} already listening on port ${port}.`),
    );
  }

  return running.open;
};

export const startUi = async (
  ui: UiDefinition,
  address: string,
  log: Logger,
  runName: string,
): Promise<RunningUi> => {
  const processes: Supervised[] = [];

  const apiUrl = ui.uiServer ? `http://localhost:${ui.apiPort}` : undefined;
  const webUrl = ui.web ? `http://localhost:${ui.webPort}` : undefined;

  if (ui.uiServer && !(await reuseIfRunning(ui.apiPort, 'ui-server', log))) {
    processes.push(await startUiServer(ui, address, log, runName));
  }

  if (ui.web && !(await reuseIfRunning(ui.webPort, 'UI dev server', log))) {
    processes.push(await startWeb(ui, log, runName));
  }

  return { apiUrl, webUrl, processes };
};
