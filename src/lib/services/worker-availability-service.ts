import { fetchDeployment } from '$lib/services/deployments-service';
import { deploymentHasComputeConfig } from '$lib/utilities/deployment-has-compute-config';
import {
  getWorkerAvailability,
  type WorkerAvailability,
  type WorkerAvailabilityInput,
} from '$lib/utilities/worker-availability';

// The workflow header and the call stack or query tab ask about the same
// deployment within moments of each other; share one request between them.
const RESULT_TTL_MS = 30_000;

type Lookup = { result: Promise<boolean>; expires: number };

const lookups = new Map<string, Lookup>();

const removeExpired = (now: number) => {
  for (const [key, lookup] of lookups) {
    if (lookup.expires <= now) lookups.delete(key);
  }
};

// A failed lookup resolves to false so the caller falls back to the
// self-managed message instead of surfacing an error toast. It evicts only
// its own entry, never a newer lookup stored under the same key.
const lookUpServerless = (
  namespace: string,
  deployment: string,
  request: typeof fetch,
  key: string,
  now: number,
): Lookup => {
  const lookup = { expires: now + RESULT_TTL_MS } as Lookup;
  lookup.result = fetchDeployment(
    { namespace, deploymentName: deployment },
    request,
    undefined,
    false,
  )
    .then((response) =>
      deploymentHasComputeConfig(response?.workerDeploymentInfo),
    )
    .catch(() => {
      if (lookups.get(key) === lookup) lookups.delete(key);
      return false;
    });
  return lookup;
};

const abortReason = (signal: AbortSignal) =>
  signal.reason ?? new DOMException('Aborted', 'AbortError');

const unlessAborted = <T>(result: Promise<T>, signal?: AbortSignal) => {
  if (!signal) return result;
  if (signal.aborted) return Promise.reject(abortReason(signal));

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortReason(signal));
    signal.addEventListener('abort', onAbort, { once: true });
    result.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', onAbort);
    });
  });
};

// Rejects with the signal's reason when aborted, so a cancelled caller never
// mistakes cancellation for "not serverless".
export const isServerlessDeployment = (
  namespace: string,
  deployment: string,
  request: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<boolean> => {
  const key = `${namespace}/${deployment}`;
  const now = Date.now();
  removeExpired(now);
  let lookup = lookups.get(key);
  if (!lookup) {
    lookup = lookUpServerless(namespace, deployment, request, key, now);
    lookups.set(key, lookup);
  }

  return unlessAborted(lookup.result, signal);
};

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
