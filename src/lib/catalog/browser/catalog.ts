import { catalogArtifact } from './catalog.generated.js';
import type {
  BrowserCatalogArtifact,
  BrowserCatalogDescriptor,
  BrowserCatalogWorkspace,
} from './types';

const typedCatalogArtifact: BrowserCatalogArtifact = catalogArtifact;

export const catalog: BrowserCatalogDescriptor[] =
  typedCatalogArtifact.descriptors;

export const catalogWorkspaces: BrowserCatalogWorkspace[] =
  typedCatalogArtifact.workspaces;
