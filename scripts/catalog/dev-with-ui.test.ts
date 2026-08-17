import { describe, expect, it } from 'vitest';

import {
  catalogDevelopmentCommands,
  superviseCatalogDevelopment,
  type SupervisedProcess,
} from './dev-with-ui';

type FakeProcess = SupervisedProcess & {
  killedWith: NodeJS.Signals[];
  emitExit: (code: number | null) => void;
};

const createFakeProcess = (): FakeProcess => {
  const listeners: ((code: number | null) => void)[] = [];

  return {
    killedWith: [],
    kill(signal) {
      this.killedWith.push(signal);
    },
    on(_event, listener) {
      listeners.push(listener);
    },
    emitExit(code) {
      for (const listener of listeners) listener(code);
    },
  };
};

describe('catalog development supervisor', () => {
  it('starts the dev server and the catalog worker together', () => {
    const started: string[] = [];
    superviseCatalogDevelopment({
      start: (command, args) => {
        started.push(`${command} ${args.join(' ')}`);
        return createFakeProcess();
      },
      onExit: () => undefined,
    });

    expect(catalogDevelopmentCommands.map(({ label }) => label)).toEqual([
      'ui',
      'worker',
    ]);
    expect(started).toEqual(['pnpm dev', 'pnpm catalog worker']);
  });

  it('stops every process and reports the exit code when one exits', () => {
    const processes: FakeProcess[] = [];
    const exitCodes: number[] = [];
    superviseCatalogDevelopment({
      start: () => {
        const child = createFakeProcess();
        processes.push(child);
        return child;
      },
      onExit: (code) => exitCodes.push(code),
    });

    processes[1].emitExit(7);

    expect(exitCodes).toEqual([7]);
    for (const child of processes) {
      expect(child.killedWith).toEqual(['SIGINT']);
    }

    processes[0].emitExit(0);
    expect(exitCodes).toEqual([7]);
  });

  it('treats a manual stop as a clean shutdown', () => {
    const exitCodes: number[] = [];
    const { stop } = superviseCatalogDevelopment({
      start: () => createFakeProcess(),
      onExit: (code) => exitCodes.push(code),
    });

    stop();
    stop();

    expect(exitCodes).toEqual([0]);
  });
});
