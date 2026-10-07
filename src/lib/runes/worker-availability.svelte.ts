import { isServerlessDeployment } from '$lib/services/worker-availability-service';
import {
  getWorkerAvailability,
  needsServerlessCheck,
  type WorkerAvailability,
  type WorkerAvailabilityInput,
} from '$lib/utilities/worker-availability';

type Input = Omit<WorkerAvailabilityInput, 'serverless' | 'now'> & {
  namespace: string;
};

type ServerlessCheck = {
  namespace: string;
  deployment: string;
  serverless: boolean;
};

/**
 * Resolves whether an empty task queue belongs to a serverless deployment,
 * fetching the deployment only when no worker is polling. A failed lookup
 * falls back to the self-managed message.
 */
export const getWorkerAvailabilityState = (
  input: () => Input,
): { readonly current: WorkerAvailability } => {
  let check = $state.raw<ServerlessCheck>();

  const pendingNamespace = $derived(
    needsServerlessCheck(input()) ? input().namespace : undefined,
  );
  const pendingDeployment = $derived(
    needsServerlessCheck(input()) ? input().deployment : undefined,
  );

  $effect(() => {
    const namespace = pendingNamespace;
    const deployment = pendingDeployment;
    if (!namespace || !deployment) return;

    const controller = new AbortController();
    isServerlessDeployment(
      namespace,
      deployment,
      fetch,
      controller.signal,
    ).then((serverless) => {
      if (controller.signal.aborted) return;
      check = { namespace, deployment, serverless };
    });

    return () => controller.abort();
  });

  const serverless = $derived.by(() => {
    const { namespace, deployment } = input();
    return check?.namespace === namespace && check.deployment === deployment
      ? check.serverless
      : undefined;
  });

  return {
    get current() {
      return getWorkerAvailability({ ...input(), serverless });
    },
  };
};
