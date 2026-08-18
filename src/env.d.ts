/// <reference types="vite/client" />

type Vitest = import('vitest');

interface ImportMetaEnv {
  readonly VITE_TEMPORAL_UI_BUILD_TARGET: string;
  readonly VITE_API: string;
  readonly VITE_TEMPORAL_UI_VISUAL_VERSION?: 'legacy' | 'v2';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly vitest: Vitest;
}

declare module 'virtual:catalog-local' {
  import type { BrowserCatalogDescriptor } from '$lib/catalog/browser/types';

  export const localCatalog: BrowserCatalogDescriptor[];
}
