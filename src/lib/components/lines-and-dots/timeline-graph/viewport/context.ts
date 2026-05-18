import { createContext } from 'svelte';

import type { ViewportModel } from './model.svelte';

export const [getViewportContext, setViewportContext] =
  createContext<ViewportModel>();
