import { existsSync } from 'fs';
import { join } from 'path';

export type Logger = (message: string) => void;

/** Everything this tool generates lives here, outside the source tree. */
export const WORK_DIR = join(process.cwd(), '.feature-demo');

export const runDirFor = (name: string) => join(WORK_DIR, name);

/**
 * Machine-local settings, in the same layering the catalog uses: a gitignored
 * file for your own paths, with real environment variables winning over it.
 */
export const loadLocalEnvironment = () => {
  const path = join(process.cwd(), '.env.feature-demo.local');

  if (!existsSync(path)) return;

  (
    process as NodeJS.Process & { loadEnvFile: (path: string) => void }
  ).loadEnvFile(path);
};
