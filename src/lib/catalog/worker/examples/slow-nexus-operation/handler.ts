import { HandlerError, serviceHandler } from 'nexus-rpc';

import { slowNexusService } from './service.js';

const attemptsByRequest = new Map<string, number>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const slowNexusServiceHandler = serviceHandler(slowNexusService, {
  slowGreeting: async (
    context,
    { name, failedAttempts, completionDelaySeconds },
  ) => {
    const attempt = (attemptsByRequest.get(context.requestId) ?? 0) + 1;
    attemptsByRequest.set(context.requestId, attempt);

    if (attempt <= failedAttempts) {
      throw new HandlerError(
        'INTERNAL',
        `Simulated failure on attempt ${attempt} of ${failedAttempts}`,
        { retryableOverride: true },
      );
    }

    attemptsByRequest.delete(context.requestId);
    await sleep(completionDelaySeconds * 1000);

    return `Hello, ${name}! Completed on attempt ${attempt}.`;
  },
});
