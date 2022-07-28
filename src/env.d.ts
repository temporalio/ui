/// <reference types="vite/client" />

type Vitest = import('vitest');

interface ImportMetaEnv {
  readonly VITE_TEMPORAL_UI_BUILD_TARGET: string;
  readonly VITE_API: string;
  readonly DISABLE_WRITE_ACTIONS: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly vitest: Vitest;
}
