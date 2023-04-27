import type { SearchAttributes, WorkflowExecution } from '$lib/types/workflows';

export type TextFilterAttributes = 'WorkflowId' | 'WorkflowType' | 'RunId';
export type TextFilterKeys = Extract<
  keyof WorkflowExecution,
  'id' | 'name' | 'runId'
>;

export const attributeToHumanReadable: Record<TextFilterAttributes, string> = {
  WorkflowId: 'Workflow ID',
  WorkflowType: 'Type',
  RunId: 'Run ID',
};

export const attributeToId: Record<TextFilterAttributes, string> = {
  WorkflowId: 'workflow-id',
  WorkflowType: 'workflow-type',
  RunId: 'run-id',
};

export const searchAttributeToWorkflowKey: Record<
  TextFilterAttributes,
  TextFilterKeys
> = {
  WorkflowId: 'id',
  WorkflowType: 'name',
  RunId: 'runId',
};

export type WorkflowFilter = {
  attribute: keyof SearchAttributes;
  value: string;
  operator: string;
  parenthesis: string;
  conditional: string;
  customDate?: boolean;
};

export type SortOrder = 'asc' | 'desc';

export type WorkflowSort = {
  attribute: keyof SearchAttributes;
  value: SortOrder;
};
