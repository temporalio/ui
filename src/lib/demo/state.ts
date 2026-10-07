import { existsSync } from 'fs';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';

import { runDirFor } from './paths';

export type RunState = {
  name: string;
  startedAt: string;
  address: string;
  webUrl?: string;
  /** Ports this run started, so a stop can sweep what outlived its pid. */
  ports: number[];
  processes: { label: string; pid: number }[];
};

const stateFile = (name: string) => join(runDirFor(name), 'run.json');

export const writeState = async (state: RunState) => {
  await mkdir(runDirFor(state.name), { recursive: true });
  await writeFile(stateFile(state.name), `${JSON.stringify(state, null, 2)}\n`);
};

export const readState = async (name: string): Promise<RunState | null> => {
  const path = stateFile(name);

  if (!existsSync(path)) return null;

  try {
    return JSON.parse(await readFile(path, 'utf8')) as RunState;
  } catch {
    return null;
  }
};

export const clearState = async (name: string) => {
  await rm(stateFile(name), { force: true });
};

export const isRunning = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
