import { Context } from '@temporalio/activity';
import { ApplicationFailure } from '@temporalio/common';

import type { CatalogWorkspaceControl } from '../browser/metadata-schema.js';

export const crashActivityName = 'dangerousOperation';

export const catalogCrashExitCode = 75;

export type CrashActivityOptions = {
  enabled: boolean;
  exit: (code: number) => void;
  log?: (message: string) => void;
};

export const catalogControlsFromEnvironment = (
  environment: Readonly<Record<string, string | undefined>>,
): CatalogWorkspaceControl[] =>
  environment.CATALOG_CONTROL === 'on' ? ['crash'] : [];

export const effectiveCatalogControls = (
  declared: readonly CatalogWorkspaceControl[] | undefined,
  provided: readonly CatalogWorkspaceControl[],
): CatalogWorkspaceControl[] =>
  (declared ?? []).filter((control) => provided.includes(control));

export const createCrashActivity = ({
  enabled,
  exit,
  log = console.warn,
}: CrashActivityOptions) => ({
  [crashActivityName]: async (): Promise<string> => {
    if (!enabled) {
      throw ApplicationFailure.nonRetryable(
        'This Worker cannot be crashed. The workspace must declare the crash control and the runtime must set CATALOG_CONTROL=on.',
        'CatalogCrashDisabled',
      );
    }

    const { attempt } = Context.current().info;

    if (attempt > 1)
      return `Worker recovered. Attempt ${attempt} ran on a new Worker.`;

    log('Catalog Worker is exiting on purpose to demonstrate a crash.');
    exit(catalogCrashExitCode);
    return 'Worker exited.';
  },
});
