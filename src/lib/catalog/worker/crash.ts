import { Context } from '@temporalio/activity';
import { ApplicationFailure } from '@temporalio/common';

export const crashActivityName = 'dangerousOperation';

export const catalogCrashExitCode = 75;

export type CrashActivityOptions = {
  enabled: boolean;
  exit: (code: number) => void;
  log?: (message: string) => void;
};

export const createCrashActivity = ({
  enabled,
  exit,
  log = console.warn,
}: CrashActivityOptions) => ({
  [crashActivityName]: async (): Promise<string> => {
    if (!enabled) {
      throw ApplicationFailure.nonRetryable(
        'This Worker cannot be crashed. Its workspace does not declare the crash control.',
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
