import { chalk } from 'zx';

import type { Definition } from './definition';
import type { Logger } from './paths';

export type MissingCommand = {
  command: string;
  /** Why the run needs it, so the message is actionable rather than a name. */
  because: string;
};

/**
 * Commands a stage needs by virtue of being enabled, so a definition does not
 * have to restate them. A stage that shells out to a tool owns that tool's
 * requirement.
 */
export const impliedCommands = (
  definition: Definition,
): Record<string, string> => {
  const implied: Record<string, string> = {};

  if (definition.tunnel.enabled && definition.tunnel.provider === 'ngrok') {
    implied.ngrok = 'the tunnel stage publishes the frontend through ngrok';
  }

  if (definition.server.enabled && definition.server.source === 'workspace') {
    implied.go = 'a workspace build compiles the server and CLI from source';
    implied.git = 'a workspace build fetches the server and CLI checkouts';
  }

  return implied;
};

/** Everything the run needs on PATH, with the reason for each. */
export const requiredCommands = (
  definition: Definition,
): Record<string, string> => {
  const declared = Object.fromEntries(
    definition.server.requires.commands.map((command) => [
      command,
      'the definition lists it under requires.commands',
    ]),
  );

  return { ...impliedCommands(definition), ...declared };
};

const onPath = async (command: string): Promise<boolean> => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');

  try {
    await promisify(execFile)('which', [command]);

    return true;
  } catch {
    return false;
  }
};

export const findMissingCommands = async (
  required: Record<string, string>,
): Promise<MissingCommand[]> => {
  const entries = Object.entries(required);

  const results = await Promise.all(
    entries.map(async ([command, because]) => ({
      command,
      because,
      present: await onPath(command),
    })),
  );

  return results
    .filter(({ present }) => !present)
    .map(({ command, because }) => ({ command, because }));
};

/**
 * Fails before any stage starts. A missing tool is cheap to detect and
 * expensive to hit halfway through a build, or worse after a provider has
 * already been handed an address that no longer resolves.
 */
export const runPreflight = async (definition: Definition, log: Logger) => {
  const required = requiredCommands(definition);
  const names = Object.keys(required);

  if (!names.length) return;

  const missing = await findMissingCommands(required);

  if (!missing.length) {
    log(chalk.dim(`Preflight: ${names.sort().join(', ')} present`));

    return;
  }

  throw new Error(
    [
      'This scenario needs commands that are not on PATH:',
      ...missing.map(({ command, because }) => `  ${command} — ${because}`),
      'Install them and run again.',
    ].join('\n'),
  );
};
