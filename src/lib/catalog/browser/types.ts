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

export type BrowserCatalogMetadata = {
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

export type BrowserCatalogExecution =
  | BrowserStandaloneActivityExecution
  | BrowserStandaloneNexusOperationExecution
  | BrowserWorkflowExecution;

export type BrowserCatalogSource = {
  id: string;
  label: string;
};

export type BrowserCatalogDescriptor = BrowserCatalogMetadata & {
  source: BrowserCatalogSource;
  execution: BrowserCatalogExecution;
};

export type BrowserCatalogArtifact = {
  sourceHash: string;
  descriptors: BrowserCatalogDescriptor[];
};
