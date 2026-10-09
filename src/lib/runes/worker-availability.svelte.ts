import { isServerlessDeployment } from '$lib/services/worker-availability-service';
import {
  getWorkerAvailability,
  needsServerlessCheck,
  type WorkerAvailability,
  type WorkerAvailabilityInput,
} from '$lib/utilities/worker-availability';

type Input = Omit<WorkerAvailabilityInput, 'serverless'> & {
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
 * falls back to the self-managed message; a cancelled one is ignored.
 */
export const getWorkerAvailabilityState = (
  input: () => Input,
): { readonly current: WorkerAvailability } => {
  let check = $state.raw<ServerlessCheck>();

  const resolved = $derived(input());
  const needsCheck = $derived(needsServerlessCheck(resolved));
  const pendingNamespace = $derived(
    needsCheck ? resolved.namespace : undefined,
  );
  const pendingDeployment = $derived(
    needsCheck ? resolved.deployment : undefined,
  );

  $effect(() => {
    const namespace = pendingNamespace;
    const deployment = pendingDeployment;
    if (!namespace || !deployment) return;

    const controller = new AbortController();
    isServerlessDeployment(namespace, deployment, fetch, controller.signal)
      .then((serverless) => {
        check = { namespace, deployment, serverless };
      })
      .catch(() => {});

    return () => controller.abort();
  });

  const serverless = $derived(
    check?.namespace === resolved.namespace &&
      check.deployment === resolved.deployment
      ? check.serverless
      : undefined,
  );

  const current = $derived(getWorkerAvailability({ ...resolved, serverless }));

  return {
    get current() {
      return current;
    },
  };
};
