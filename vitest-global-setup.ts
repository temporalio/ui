import { clearInRepoTemporaryRoot } from './scripts/catalog/test-temp-root';

export default async function setup(): Promise<void> {
  await clearInRepoTemporaryRoot();
}
