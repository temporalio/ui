import Component from './error-boundary.svelte';
import { createBoundary } from '@crownframework/svelte-error-boundary';
export const ErrorBoundary = createBoundary(Component);
