import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export type SupervisedProcess = {
  kill: (signal: NodeJS.Signals) => unknown;
  on: (event: 'exit', listener: (code: number | null) => void) => unknown;
};

export const catalogDevelopmentCommands: readonly {
  label: string;
  command: string;
  args: readonly string[];
}[] = [
  { label: 'ui', command: 'pnpm', args: ['dev'] },
  { label: 'worker', command: 'pnpm', args: ['catalog', 'worker'] },
];

export const superviseCatalogDevelopment = ({
  start,
  onExit,
}: {
  start: (command: string, args: readonly string[]) => SupervisedProcess;
  onExit: (code: number) => void;
}): { stop: (code?: number) => void } => {
  const children = catalogDevelopmentCommands.map(({ command, args }) =>
    start(command, args),
  );
  let settled = false;
  const stop = (code = 0) => {
    if (settled) return;
    settled = true;
    for (const child of children) child.kill('SIGINT');
    onExit(code);
  };

  for (const child of children) {
    child.on('exit', (code) => stop(code ?? 0));
  }

  return { stop };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { stop } = superviseCatalogDevelopment({
    start: (command, args) => {
      const child = spawn(command, [...args], {
        stdio: 'inherit',
        detached: true,
      });

      return {
        kill: (signal) => {
          if (!child.pid) return;
          try {
            process.kill(-child.pid, signal);
          } catch {
            child.kill(signal);
          }
        },
        on: (event, listener) => child.on(event, listener),
      };
    },
    onExit: (code) => {
      process.exitCode = code;
    },
  });

  process.on('SIGINT', () => stop());
  process.on('SIGTERM', () => stop());
}
