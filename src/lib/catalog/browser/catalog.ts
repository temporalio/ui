import { catalogArtifact } from './catalog.generated.js';
import type { BrowserCatalogArtifact, BrowserCatalogDescriptor } from './types';

const typedCatalogArtifact: BrowserCatalogArtifact = catalogArtifact;

export const catalog: BrowserCatalogDescriptor[] =
  typedCatalogArtifact.descriptors;
