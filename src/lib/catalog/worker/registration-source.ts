import type { CatalogRegistry } from './registry';
import type { BrowserCatalogSource } from '../browser/types';

export type CatalogRegistrationSource = {
  source: BrowserCatalogSource;
  sourceFiles: string[];
  register: (registry: CatalogRegistry) => void;
};
