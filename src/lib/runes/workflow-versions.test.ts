import { describe, expect, it } from 'vitest';

import type { PollerWithTaskQueueTypes } from '$lib/services/pollers-service';
import type { TaskQueueResponse } from '$lib/types';
import { VersioningBehaviorEnum } from '$lib/types/deployments';
import type { WorkflowExecution } from '$lib/types/workflows';

import { getWorkflowPollersWithVersions } from './workflow-versions.svelte'; // Update with actual file path

describe('getWorkflowPollersWithVersions', () => {
  const createMockWorkflow = (
    deploymentName?: string,
    deploymentVersion?: string,
    buildId?: string,
    versioningBehavior?: string,
  ): WorkflowExecution =>
    ({
      searchAttributes: {
        indexedFields: {
          ...(deploymentName && { TemporalWorkerDeployment: deploymentName }),
          ...(deploymentVersion && {
            TemporalWorkerDeploymentVersion: deploymentVersion,
          }),
          ...(buildId && { TemporalWorkerBuildId: buildId }),
          ...(versioningBehavior && {
            TemporalWorkflowVersioningBehavior: versioningBehavior,
          }),
        },
      },
    }) as unknown as WorkflowExecution;

  const createMockPoller = (
    deploymentName?: string,
    buildId?: string,
    useDeploymentOptions = true,
  ): PollerWithTaskQueueTypes => {
    if (useDeploymentOptions) {
      return {
        deploymentOptions: {
          deploymentName,
          buildId,
        },
      } as PollerWithTaskQueueTypes;
    } else {
      return {
        workerVersionCapabilities: {
          deploymentSeriesName: deploymentName,
          buildId,
        },
      } as PollerWithTaskQueueTypes;
    }
  };

  const createMockWorkers = (
    pollers: PollerWithTaskQueueTypes[],
    currentDeployment?: { deploymentName: string; buildId: string },
    rampingDeployment?: { deploymentName: string; buildId: string },
  ): TaskQueueResponse =>
    ({
      pollers,
      versioningInfo: {
        currentDeploymentVersion: currentDeployment,
        rampingDeploymentVersion: rampingDeployment,
      },
    }) as TaskQueueResponse;

  describe('Pinned behavior', () => {
    it('should filter pollers matching workflow deployment and build ID when pinned', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
        VersioningBehaviorEnum.Pinned,
      );

      const matchingPoller = createMockPoller('deployment-v1', 'build-123');
      const nonMatchingPoller = createMockPoller('deployment-v2', 'build-456');

      const workers = createMockWorkers([matchingPoller, nonMatchingPoller], {
        deploymentName: 'deployment-v1',
        buildId: 'build-123',
      });

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(1);
      expect(result.pollers[0]).toBe(matchingPoller);
      expect(result.pinned).toBe(true);
      expect(result.autoUpgrade).toBe(false);
    });

    it('should handle pollers with workerVersionCapabilities instead of deploymentOptions', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
        VersioningBehaviorEnum.Pinned,
      );

      const pollerWithCapabilities = createMockPoller(
        'deployment-v1',
        'build-123',
        false,
      );

      const workers = createMockWorkers([pollerWithCapabilities], {
        deploymentName: 'deployment-v1',
        buildId: 'build-123',
      });

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(1);
      expect(result.pollers[0]).toBe(pollerWithCapabilities);
    });
  });

  describe('AutoUpgrade behavior', () => {
    it('should include pollers matching workflow or ramping deployment when auto-upgrade', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
        VersioningBehaviorEnum.AutoUpgrade,
      );

      const workflowPoller = createMockPoller('deployment-v1', 'build-123');
      const rampingPoller = createMockPoller('deployment-v2', 'build-456');
      const unrelatedPoller = createMockPoller('deployment-v3', 'build-789');

      const workers = createMockWorkers(
        [workflowPoller, rampingPoller, unrelatedPoller],
        { deploymentName: 'deployment-v1', buildId: 'build-123' },
        { deploymentName: 'deployment-v2', buildId: 'build-456' },
      );

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(2);
      expect(result.pollers).toContain(workflowPoller);
      expect(result.pollers).toContain(rampingPoller);
      expect(result.pollers).not.toContain(unrelatedPoller);
      expect(result.autoUpgrade).toBe(true);
      expect(result.pinned).toBe(false);
    });
  });

  describe('Default behavior (neither pinned nor auto-upgrade)', () => {
    it('should return all pollers when versioning behavior is not set', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
      );

      const poller1 = createMockPoller('deployment-v1', 'build-123');
      const poller2 = createMockPoller('deployment-v2', 'build-456');

      const workers = createMockWorkers([poller1, poller2]);

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(2);
      expect(result.pollers).toContain(poller1);
      expect(result.pollers).toContain(poller2);
      expect(result.pinned).toBe(false);
      expect(result.autoUpgrade).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle workflow without search attributes', () => {
      const workflow = {} as WorkflowExecution;
      const poller = createMockPoller('deployment-v1', 'build-123');
      const workers = createMockWorkers([poller]);

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(1);
      expect(result.currentDeployment).toBeUndefined();
      expect(result.currentBuildId).toBeUndefined();
    });

    it('should handle workers without pollers', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
      );
      const workers = createMockWorkers([]);

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(0);
    });

    it('should handle workers as undefined', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
      );
      const workers = undefined as unknown as TaskQueueResponse;

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(0);
      expect(result.currentDeployment).toBeUndefined();
      expect(result.currentBuildId).toBeUndefined();
    });

    it('should fallback to getBuildIdFromVersion when TemporalWorkerBuildId is not present', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        undefined, // No buildId
        VersioningBehaviorEnum.Pinned,
      );
      const workers = createMockWorkers([]);

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result).toBeDefined();
    });

    it('should handle errors in pollers filtering gracefully', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
        VersioningBehaviorEnum.Pinned,
      );

      const problematicPoller = null as unknown as PollerWithTaskQueueTypes;
      const normalPoller = createMockPoller('deployment-v1', 'build-123');

      const workers = createMockWorkers([problematicPoller, normalPoller]);

      expect(() => {
        const result = getWorkflowPollersWithVersions(workflow, workers);
        expect(result.pollers).toBeDefined();
      }).not.toThrow();
    });

    it('should handle pollers with missing deployment options or capabilities', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
        VersioningBehaviorEnum.Pinned,
      );

      const incompletePoller = {} as PollerWithTaskQueueTypes;

      const workers = createMockWorkers([incompletePoller]);

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.pollers).toHaveLength(0);
    });
  });

  describe('Deployment version info', () => {
    it('should correctly extract current and ramping deployment info', () => {
      const workflow = createMockWorkflow(
        'deployment-v1',
        'v1.0.0',
        'build-123',
      );

      const workers = createMockWorkers(
        [],
        { deploymentName: 'current-deployment', buildId: 'v1' },
        { deploymentName: 'ramping-deployment', buildId: 'v2' },
      );

      const result = getWorkflowPollersWithVersions(workflow, workers);

      expect(result.currentDeployment).toBe('current-deployment');
      expect(result.currentBuildId).toBe('v1');
      expect(result.rampingDeployment).toBe('ramping-deployment');
      expect(result.rampingBuildId).toBe('v2');
    });
  });
});
