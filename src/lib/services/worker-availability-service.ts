import { fetchDeployment } from '$lib/services/deployments-service';
import { deploymentHasComputeConfig } from '$lib/utilities/deployment-has-compute-config';
import {
  getWorkerAvailability,
  type WorkerAvailability,
  type WorkerAvailabilityInput,
} from '$lib/utilities/worker-availability';

// A failed lookup resolves to false so the caller falls back to the
// self-managed message instead of surfacing an error toast.
export const isServerlessDeployment = (
  namespace: string,
  deployment: string,
  request: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<boolean> =>
  fetchDeployment(
    { namespace, deploymentName: deployment },
    request,
    () => {},
    false,
    signal,
  )
    .then((response) =>
      deploymentHasComputeConfig(response?.workerDeploymentInfo),
    )
    .catch(() => false);

export const resolveWorkerAvailability = async (
  namespace: string,
  input: Omit<WorkerAvailabilityInput, 'serverless'>,
  request: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<WorkerAvailability> => {
  const availability = getWorkerAvailability({
    ...input,
    serverless: undefined,
  });
  if (availability.state !== 'checking-deployment') return availability;

  const serverless = await isServerlessDeployment(
    namespace,
    availability.deployment,
    request,
    signal,
  );
  return getWorkerAvailability({ ...input, serverless });
};
