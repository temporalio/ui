import { createBoundary } from '@crownframework/svelte-error-boundary';

import ErrorBoundryFallback from './error-boundary-fallback.svelte';
import Component from './error-boundary.svelte';

export const ErrorBoundary = createBoundary(Component);
export const ErrorBoundaryWithFallback = createBoundary(ErrorBoundryFallback);
