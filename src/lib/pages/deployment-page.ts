import { fetchDeployment } from '$lib/services/deployments-service';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

export function loadDeploymentPage({
  params,
  depends,
}: {
  params: { namespace: string; deployment: string };
  depends: (...deps: `${string}:${string}`[]) => void;
}) {
  depends('data:deployment');
  const deploymentName = decodeURIForSvelte(params.deployment);
  return {
    deploymentPromise: fetchDeployment({
      namespace: params.namespace,
      deploymentName,
    }),
  };
}
