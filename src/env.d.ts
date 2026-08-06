/// <reference types="vite/client" />

type Vitest = import('vitest');

interface ImportMetaEnv {
  readonly VITE_TEMPORAL_UI_BUILD_TARGET: string;
  readonly VITE_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly vitest: Vitest;
}

declare module 'virtual:workflow-catalog-local' {
  import type { WorkflowCatalogRouting } from '$lib/workflow-catalog/browser/routing';
  import type { BrowserWorkflowCatalogDescriptor } from '$lib/workflow-catalog/browser/types';

  export const localWorkflowCatalog: BrowserWorkflowCatalogDescriptor[];
  export const workflowCatalogRouting: WorkflowCatalogRouting;
}
