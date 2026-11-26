import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';

export const IN_REPO_TEMPORARY_ROOT = '.catalog-tmp';

const inRepoTemporaryRoot = () => join(process.cwd(), IN_REPO_TEMPORARY_ROOT);

export const createInRepoTemporaryDirectory = async (
  prefix: string,
): Promise<string> => {
  const parentDirectory = inRepoTemporaryRoot();
  await mkdir(parentDirectory, { recursive: true });
  return mkdtemp(join(parentDirectory, prefix));
};

export const clearInRepoTemporaryRoot = async (): Promise<void> => {
  await rm(inRepoTemporaryRoot(), { force: true, recursive: true });
};
