import { AsyncLocalStorage } from 'node:async_hooks';

export interface LLMCallDetails {
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  cost?: number;
  score?: number;
  traceUrl?: string;
  spanId?: string;
}

export interface ActivityCompletionDetails {
  llm?: LLMCallDetails;
}

// Simulates the future activity.set_completion_details() SDK API.
// Uses AsyncLocalStorage so each activity execution gets its own details.
// In the real SDK, this will write to proto fields on
// ActivityTaskCompletedEventAttributes outside the payload pipeline.
const store = new AsyncLocalStorage<{
  details: ActivityCompletionDetails | null;
}>();

export function setCompletionDetails(details: ActivityCompletionDetails): void {
  const ctx = store.getStore();
  if (ctx) {
    ctx.details = details;
  }
}

export function getCompletionDetails(): ActivityCompletionDetails | null {
  return store.getStore()?.details ?? null;
}

export function runWithDetailsContext<T>(fn: () => T): T {
  return store.run({ details: null }, fn);
}
