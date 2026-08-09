export type JsonValue =
  | boolean
  | null
  | number
  | string
  | JsonValue[]
  | JsonObject;

export type JsonObject = { [key: string]: JsonValue };

export type JsonSchema = boolean | JsonObject;

export type RuntimeJsonDocument = {
  defaultValue: JsonValue;
  schema: JsonSchema;
};

export type BrowserWorkflowCatalogMetadata = {
  id: string;
  title: string;
  description: string;
  capabilityTags: string[];
  expectedEvidence: string[];
  input: RuntimeJsonDocument;
  startOptions: RuntimeJsonDocument;
  setupMarkdown?: string;
};

export type BrowserExecutionTarget = {
  targetId: string;
  namespace: string;
  taskQueue: string;
};

export type BrowserWorkflowExecution = BrowserExecutionTarget & {
  kind: 'workflow';
  workflowType: string;
  nexusEndpoints?: string[];
};

export type BrowserStandaloneActivityExecution = BrowserExecutionTarget & {
  kind: 'standalone-activity';
  activityType: string;
  timeouts: JsonObject;
  policies: JsonObject;
};

export type BrowserStandaloneNexusOperationExecution =
  BrowserExecutionTarget & {
    kind: 'standalone-nexus-operation';
    endpoint: string;
    service: string;
    operation: string;
    policies: JsonObject;
  };

export type BrowserWorkflowCatalogExecution =
  | BrowserStandaloneActivityExecution
  | BrowserStandaloneNexusOperationExecution
  | BrowserWorkflowExecution;

export type BrowserWorkflowCatalogSource = {
  id: string;
  label: string;
};

export type BrowserWorkflowCatalogDescriptor =
  BrowserWorkflowCatalogMetadata & {
    source: BrowserWorkflowCatalogSource;
    execution: BrowserWorkflowCatalogExecution;
  };

export type BrowserWorkflowCatalogArtifact = {
  sourceHash: string;
  descriptors: BrowserWorkflowCatalogDescriptor[];
};
