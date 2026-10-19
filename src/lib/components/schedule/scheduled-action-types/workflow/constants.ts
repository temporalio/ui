import type { DurationString } from '$lib/types/schedule';

export const MAX_TASK_TIMEOUT_SECONDS = 120;
export const DEFAULT_TASK_TIMEOUT: DurationString = '10s';
// Run/execution timeouts default to empty, meaning "use the server default"
// (unlimited). An empty value is omitted from the request entirely.
export const DEFAULT_RUN_TIMEOUT = '';
export const DEFAULT_EXECUTION_TIMEOUT = '';
