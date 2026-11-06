import { fetchExecutionDetails } from './fetch-execution-details';
import type { ExecutionDetailsState } from './types';
import type { ExecutionIdentity } from '../identity-keys';

/** Owns selected-execution details and cancels superseded requests. */
export function useExecutionDetails(getIdentity: () => ExecutionIdentity) {
  let state = $state.raw<ExecutionDetailsState>({
    details: null,
    loading: true,
    error: null,
  });

  let controller: AbortController | null = null;

  async function loadDetails(
    identity: ExecutionIdentity,
    currentState: ExecutionDetailsState,
  ): Promise<void> {
    controller?.abort();
    const currentController = new AbortController();
    controller = currentController;

    state = { ...currentState, loading: true, error: null };

    try {
      const details = await fetchExecutionDetails(
        identity,
        currentController.signal,
      );

      if (currentController.signal.aborted) {
        return;
      }

      state = {
        details,
        loading: false,
        error: null,
      };
    } catch (error) {
      if (currentController.signal.aborted) {
        return;
      }

      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : String(error);

      state = {
        ...currentState,
        loading: false,
        error: message,
      };
    }
  }

  $effect(() => {
    const identity = getIdentity();

    void loadDetails(identity, {
      details: null,
      loading: true,
      error: null,
    });

    return () => {
      controller?.abort();
      controller = null;
    };
  });

  return {
    get state(): ExecutionDetailsState {
      return state;
    },

    /** Refreshes details while retaining the last successful response. */
    refresh(): Promise<void> {
      return loadDetails(getIdentity(), state);
    },
  };
}
