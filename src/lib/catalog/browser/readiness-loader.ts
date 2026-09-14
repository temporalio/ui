import type { WorkbenchHost } from './workbench-host';

const isAbortError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'name' in error &&
  error.name === 'AbortError';

export const createReadinessLoader = (getHost: () => WorkbenchHost) => {
  let epoch = 0;
  let controller: AbortController | undefined;

  return {
    cancel: () => {
      epoch += 1;
      controller?.abort();
      controller = undefined;
    },
    load: async (exampleId: string) => {
      controller?.abort();
      controller = new AbortController();
      const requestEpoch = ++epoch;

      try {
        const checks = await getHost().checkReadiness(
          exampleId,
          controller.signal,
        );

        return requestEpoch === epoch
          ? ({ state: 'current', checks } as const)
          : ({ state: 'stale' } as const);
      } catch (error) {
        if (requestEpoch !== epoch || isAbortError(error)) {
          return { state: 'stale' } as const;
        }

        return { state: 'error' } as const;
      }
    },
  };
};
