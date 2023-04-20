import Component from './error-boundary.svelte';
import ErrorBoundryFallback from './error-boundary-fallback.svelte';
import { createBoundary } from '@crownframework/svelte-error-boundary';

export const ErrorBoundary = createBoundary(Component);
export const ErrorBoundaryWithFallback = createBoundary(ErrorBoundryFallback);
