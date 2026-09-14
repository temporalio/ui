import type { CatalogRegistrationSource } from './registration-source';

export const catalogRegistrationSource: CatalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: ['src/lib/catalog/worker/local-registration-fallback.ts'],
  register: () => undefined,
};
