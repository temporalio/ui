import type { SearchAttributes, WorkflowExecution } from '$lib/types/workflows';

export type TextFilterAttributes =
  | 'WorkflowId'
  | 'WorkflowType'
  | 'RunId'
  | 'TemporalWorkerDeployment'
  | 'TemporalWorkerDeploymentVersion'
  | 'TemporalWorkerBuildId'
  | 'TemporalWorkflowVersioningBehavior';
export type TextFilterKeys =
  | Extract<keyof WorkflowExecution, 'id' | 'name' | 'runId'>
  | 'deployment'
  | 'deploymentVersion'
  | 'buildId'
  | 'versioningBehavior';

export const attributeToHumanReadable: Record<TextFilterAttributes, string> = {
  WorkflowId: 'Workflow ID',
  WorkflowType: 'Type',
  RunId: 'Run ID',
  TemporalWorkerDeployment: 'Deployment',
  TemporalWorkerDeploymentVersion: 'Deployment Version',
  TemporalWorkerBuildId: 'Build ID',
  TemporalWorkflowVersioningBehavior: 'Versioning Behavior',
};

export const attributeToId: Record<TextFilterAttributes, string> = {
  WorkflowId: 'workflow-id',
  WorkflowType: 'workflow-type',
  RunId: 'run-id',
  TemporalWorkerDeployment: 'deployment',
  TemporalWorkerDeploymentVersion: 'deployment-version',
  TemporalWorkerBuildId: 'worker-build-id',
  TemporalWorkflowVersioningBehavior: 'workflow-versioning-behavior',
};

export const searchAttributeToWorkflowKey: Record<
  TextFilterAttributes,
  TextFilterKeys
> = {
  WorkflowId: 'id',
  WorkflowType: 'name',
  RunId: 'runId',
  TemporalWorkerDeployment: 'deployment',
  TemporalWorkerDeploymentVersion: 'deploymentVersion',
  TemporalWorkerBuildId: 'buildId',
  TemporalWorkflowVersioningBehavior: 'versioningBehavior',
};

export type SortOrder = 'asc' | 'desc';

export type WorkflowSort = {
  attribute: keyof SearchAttributes;
  value: SortOrder;
};
