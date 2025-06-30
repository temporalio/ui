import type {
  GetPollersResponse,
  PollerWithTaskQueueTypes,
} from '$lib/services/pollers-service';
import { VersioningBehaviorEnum } from '$lib/types/deployments';
import type { WorkflowExecution } from '$lib/types/workflows';
import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';

type PollersWithVersions = {
  pollers: PollerWithTaskQueueTypes[];
  pinned: boolean;
  autoUpgrade: boolean;
  currentDeployment: string;
  currentBuildId: string;
  rampingDeployment: string;
  rampingBuildId: string;
};

export function getWorkflowPollersWithVersions(
  workflow: WorkflowExecution,
  workers: GetPollersResponse,
): PollersWithVersions {
  const workflowDeploymentName = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'],
  );

  const workflowDeploymentVersion = $derived(
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkerDeploymentVersion'
    ],
  );

  const workflowVersioningBuildId = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerBuildId'] ??
      getBuildIdFromVersion(workflowDeploymentVersion),
  );

  const versioningBehavior = $derived(
    workflow?.searchAttributes?.indexedFields?.[
      'TemporalWorkflowVersioningBehavior'
    ],
  );

  const pinnedBehavior = $derived(
    versioningBehavior === VersioningBehaviorEnum.Pinned,
  );
  const autoUpgradeBehavior = $derived(
    versioningBehavior === VersioningBehaviorEnum.AutoUpgrade,
  );

  const currentDeployment = $derived(
    workers?.versioningInfo?.currentDeploymentVersion?.deploymentName,
  );
  const currentBuildId = $derived(
    workers?.versioningInfo?.currentDeploymentVersion?.buildId,
  );
  const rampingDeployment = $derived(
    workers?.versioningInfo?.rampingDeploymentVersion?.deploymentName,
  );
  const rampingBuildId = $derived(
    workers?.versioningInfo?.rampingDeploymentVersion?.buildId,
  );

  const getPollerDeploymentName = (poller: PollerWithTaskQueueTypes) => {
    const deployment =
      poller?.deploymentOptions?.deploymentName ??
      poller?.workerVersionCapabilities?.deploymentSeriesName;
    return deployment ?? '';
  };

  const getPollerBuildId = (poller: PollerWithTaskQueueTypes) => {
    const buildId =
      poller?.deploymentOptions?.buildId ??
      poller?.workerVersionCapabilities?.buildId;
    return buildId ?? '';
  };

  const pollerHasWorkflowBuildId = $derived(
    (poller) =>
      getPollerDeploymentName(poller) === workflowDeploymentName &&
      getPollerBuildId(poller) === workflowVersioningBuildId,
  );

  const pollerHasRampingBuildId = $derived(
    (poller: PollerWithTaskQueueTypes) =>
      getPollerDeploymentName(poller) === rampingDeployment &&
      getPollerBuildId(poller) === rampingBuildId,
  );

  const pollers = $derived.by(() => {
    try {
      if (pinnedBehavior) {
        return workers?.pollers?.filter(pollerHasWorkflowBuildId) ?? [];
      } else if (autoUpgradeBehavior) {
        return (
          workers?.pollers?.filter(
            (p) => pollerHasWorkflowBuildId(p) || pollerHasRampingBuildId(p),
          ) ?? []
        );
      }
      return workers?.pollers ?? [];
    } catch (error) {
      return workers?.pollers ?? [];
    }
  });

  return {
    pollers,
    pinned: pinnedBehavior,
    autoUpgrade: autoUpgradeBehavior,
    currentDeployment,
    currentBuildId,
    rampingDeployment,
    rampingBuildId,
  };
}
