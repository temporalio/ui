let deployment: unknown;
let deploymentVersion: unknown;

export function resetDeploymentsServiceMock({
  fetchDeployment,
  fetchDeploymentVersion,
}: {
  fetchDeployment?: unknown;
  fetchDeploymentVersion?: unknown;
} = {}) {
  deployment = fetchDeployment;
  deploymentVersion = fetchDeploymentVersion;
}

export async function fetchDeployment(): Promise<unknown> {
  return deployment;
}

export async function fetchDeploymentVersion(): Promise<unknown> {
  return deploymentVersion;
}

export async function deleteWorkerDeployment(): Promise<void> {}

export async function deleteWorkerDeploymentVersion(): Promise<void> {}

export async function removeRampingUnversionedWorkers(): Promise<void> {}

export async function setRampingUnversionedWorkers(): Promise<void> {}

// The decoders are pure, so pages read saved groups as they do in the app.
// The relative path skips the alias that points here.
export {
  decodeAgentCoreProviderDetails,
  decodeGcpCloudRunProviderDetails,
  decodeLambdaProviderDetails,
  decodeScalerDetails,
} from '../../services/deployments-service';
