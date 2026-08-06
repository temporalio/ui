import { catalogArtifact } from './catalog.generated.js';
import type {
  BrowserWorkflowCatalogArtifact,
  BrowserWorkflowCatalogDescriptor,
} from './types';

const typedCatalogArtifact: BrowserWorkflowCatalogArtifact = catalogArtifact;

export const workflowCatalog: BrowserWorkflowCatalogDescriptor[] =
  typedCatalogArtifact.descriptors;
