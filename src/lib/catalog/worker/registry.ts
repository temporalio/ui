import { isDeepStrictEqual, types as nodeTypes } from 'node:util';

import type { ServiceHandler } from 'nexus-rpc';

import { withSharedCatalogStartOptions } from '../browser/start-options.js';
import type {
  BrowserCatalogDescriptor,
  BrowserCatalogMetadata,
  JsonObject,
  JsonSchema,
  RuntimeJsonDocument,
} from '../browser/types';

type BrowserCatalogDescriptorWithoutSource = Omit<
  BrowserCatalogDescriptor,
  'source'
>;

export type WorkflowImplementation = (...args: never[]) => unknown;
export type ActivityImplementation = (...args: never[]) => unknown;

export type CatalogTarget = {
  id: string;
  namespace: string;
  taskQueue: string;
  workflowsPath: string;
  workflowExports: Readonly<Record<string, WorkflowImplementation>>;
};

type ExampleMetadata = BrowserCatalogMetadata & {
  targetId: string;
};

type WorkflowExecution = {
  kind: 'workflow';
  workflowType: string;
  workflow: WorkflowImplementation;
  activities: Readonly<Record<string, ActivityImplementation>>;
  nexusEndpoints?: readonly string[];
  nexusServices?: readonly ServiceHandler[];
};

type StandaloneActivityExecution = {
  kind: 'standalone-activity';
  activityType: string;
  activity: ActivityImplementation;
  timeouts: JsonObject;
  policies: JsonObject;
};

type StandaloneNexusOperationExecution = {
  kind: 'standalone-nexus-operation';
  endpoint: string;
  service: string;
  operation: string;
  handler: ServiceHandler;
  policies: JsonObject;
};

export type WorkflowExampleRegistration = ExampleMetadata & {
  execution: WorkflowExecution;
};

export type StandaloneActivityExampleRegistration = ExampleMetadata & {
  execution: StandaloneActivityExecution;
};

export type StandaloneNexusOperationExampleRegistration = ExampleMetadata & {
  execution: StandaloneNexusOperationExecution;
};

export type CatalogExampleRegistration =
  | StandaloneActivityExampleRegistration
  | StandaloneNexusOperationExampleRegistration
  | WorkflowExampleRegistration;

export type CatalogExampleDefinition =
  CatalogExampleRegistration extends infer Registration
    ? Registration extends { targetId: string }
      ? Omit<Registration, 'targetId'>
      : never
    : never;

export type CatalogRegistry = {
  registerTarget: (target: CatalogTarget) => void;
  registerExample: (example: CatalogExampleRegistration) => void;
  readonly targets: readonly CatalogTarget[];
  readonly examples: readonly CatalogExampleRegistration[];
};

export type CatalogWorkerBinding = {
  target: CatalogTarget;
  examples: {
    id: string;
    execution: CatalogExampleRegistration['execution'];
  }[];
  activities: Record<string, ActivityImplementation>;
  nexusServices: ServiceHandler[];
};

const hasOnlyJsonDataProperties = (
  value: unknown,
  ancestors = new Set<object>(),
): boolean => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (
    typeof value !== 'object' ||
    nodeTypes.isProxy(value) ||
    ancestors.has(value)
  ) {
    return false;
  }

  const isArray = Array.isArray(value);
  const prototype = Object.getPrototypeOf(value);

  if (!isArray && prototype !== Object.prototype && prototype !== null) {
    return false;
  }

  const keys = Reflect.ownKeys(value);

  if (isArray) {
    if (keys.length !== value.length + 1) return false;
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) return false;
    }
  }

  ancestors.add(value);

  for (const key of keys) {
    if (isArray && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (
      typeof key === 'symbol' ||
      !descriptor?.enumerable ||
      !('value' in descriptor) ||
      !hasOnlyJsonDataProperties(descriptor.value, ancestors)
    ) {
      ancestors.delete(value);
      return false;
    }
  }

  ancestors.delete(value);
  return true;
};

const isJsonSerializable = (value: unknown): boolean => {
  if (!hasOnlyJsonDataProperties(value)) return false;

  try {
    const serialized = JSON.stringify(value);

    return (
      serialized !== undefined &&
      isDeepStrictEqual(value, JSON.parse(serialized))
    );
  } catch {
    return false;
  }
};

const hasOnlyEnumerableDataProperties = (value: object): boolean => {
  if (nodeTypes.isProxy(value)) return false;

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;

  return Reflect.ownKeys(value).every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    return (
      typeof key === 'string' &&
      descriptor?.enumerable === true &&
      'value' in descriptor
    );
  });
};

const hasOnlyKnownFields = (
  value: object,
  knownFields: ReadonlySet<string>,
): boolean =>
  Reflect.ownKeys(value).every((key) => knownFields.has(String(key)));

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const isFunctionRecord = (
  value: unknown,
): value is Record<string, ActivityImplementation> =>
  typeof value === 'object' &&
  value !== null &&
  hasOnlyEnumerableDataProperties(value) &&
  Object.values(value).every((entry) => typeof entry === 'function');

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  isJsonSerializable(value);

const isJsonSchema = (value: unknown): value is JsonSchema =>
  typeof value === 'boolean' || isJsonObject(value);

const runtimeJsonDocumentFields = new Set(['defaultValue', 'schema']);

const isRuntimeJsonDocument = (
  value: unknown,
): value is RuntimeJsonDocument => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !hasOnlyEnumerableDataProperties(value) ||
    Reflect.ownKeys(value).length !== runtimeJsonDocumentFields.size ||
    !hasOnlyKnownFields(value, runtimeJsonDocumentFields)
  ) {
    return false;
  }

  return isJsonSchema((value as Record<string, unknown>).schema);
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  isJsonSerializable(value) &&
  value.every((entry) => typeof entry === 'string');

const isNexusHandler = (value: unknown): value is ServiceHandler =>
  typeof value === 'object' &&
  value !== null &&
  'definition' in value &&
  typeof value.definition === 'object' &&
  value.definition !== null &&
  'name' in value.definition &&
  isNonEmptyString(value.definition.name) &&
  'operations' in value.definition &&
  typeof value.definition.operations === 'object' &&
  value.definition.operations !== null;

const exampleFields = new Set([
  'id',
  'title',
  'description',
  'targetId',
  'capabilityTags',
  'expectedEvidence',
  'input',
  'startOptions',
  'setupMarkdown',
  'execution',
]);

const targetFields = new Set([
  'id',
  'namespace',
  'taskQueue',
  'workflowsPath',
  'workflowExports',
]);

const workflowExecutionFields = new Set([
  'kind',
  'workflowType',
  'workflow',
  'activities',
  'nexusEndpoints',
  'nexusServices',
]);

const standaloneActivityExecutionFields = new Set([
  'kind',
  'activityType',
  'activity',
  'timeouts',
  'policies',
]);

const standaloneNexusExecutionFields = new Set([
  'kind',
  'endpoint',
  'service',
  'operation',
  'handler',
  'policies',
]);

const executionKinds = new Set([
  'workflow',
  'standalone-activity',
  'standalone-nexus-operation',
]);

export const createCatalogRegistry = (): CatalogRegistry => {
  const targets: CatalogTarget[] = [];
  const examples: CatalogExampleRegistration[] = [];

  return {
    registerTarget: (target) => targets.push(target),
    registerExample: (example) => examples.push(example),
    targets,
    examples,
  };
};

export const generateCatalog = (registry: CatalogRegistry) => {
  for (const target of registry.targets) {
    if (!hasOnlyEnumerableDataProperties(target)) {
      throw new Error(
        'Catalog target registrations must use enumerable data properties',
      );
    }

    if (!hasOnlyKnownFields(target, targetFields)) {
      throw new Error(`Catalog target "${target.id}" contains unknown fields`);
    }

    if (
      !isNonEmptyString(target.id) ||
      !isNonEmptyString(target.namespace) ||
      !isNonEmptyString(target.taskQueue)
    ) {
      throw new Error(
        `Catalog target "${target.id}" has invalid identity or routing fields`,
      );
    }

    if (!isNonEmptyString(target.workflowsPath)) {
      throw new Error(
        `Catalog target "${target.id}" has an invalid packaged workflowsPath`,
      );
    }

    if (
      typeof target.workflowExports !== 'object' ||
      target.workflowExports === null ||
      !hasOnlyEnumerableDataProperties(target.workflowExports)
    ) {
      throw new Error(
        'Catalog workflow exports must use enumerable data properties',
      );
    }

    if (
      !Object.values(target.workflowExports).every(
        (workflow) => typeof workflow === 'function',
      )
    ) {
      throw new Error(
        `Catalog target "${target.id}" has invalid workflow exports`,
      );
    }
  }

  for (const example of registry.examples) {
    if (!hasOnlyEnumerableDataProperties(example)) {
      throw new Error(
        'Catalog example registrations must use enumerable data properties',
      );
    }

    if (!hasOnlyKnownFields(example, exampleFields)) {
      throw new Error(
        `Catalog example "${example.id}" contains unknown fields`,
      );
    }

    if (
      !isNonEmptyString(example.id) ||
      !isNonEmptyString(example.title) ||
      !isNonEmptyString(example.description) ||
      !isNonEmptyString(example.targetId) ||
      !isStringArray(example.capabilityTags) ||
      !isStringArray(example.expectedEvidence) ||
      !isRuntimeJsonDocument(example.input) ||
      !isRuntimeJsonDocument(example.startOptions) ||
      (example.setupMarkdown !== undefined &&
        !isNonEmptyString(example.setupMarkdown))
    ) {
      throw new Error(
        `Catalog example "${example.id}" has invalid metadata fields`,
      );
    }

    if (!hasOnlyEnumerableDataProperties(example.execution)) {
      throw new Error(
        'Catalog execution registrations must use enumerable data properties',
      );
    }

    if (!executionKinds.has(example.execution.kind)) {
      throw new Error(
        `Catalog example "${example.id}" has unknown execution kind "${String(example.execution.kind)}"`,
      );
    }

    if (
      example.execution.kind === 'workflow' &&
      !hasOnlyKnownFields(example.execution, workflowExecutionFields)
    ) {
      throw new Error(
        `Catalog workflow execution for example "${example.id}" contains unknown fields`,
      );
    }

    if (
      example.execution.kind === 'standalone-activity' &&
      !hasOnlyKnownFields(example.execution, standaloneActivityExecutionFields)
    ) {
      throw new Error(
        `Catalog standalone activity execution for example "${example.id}" contains unknown fields`,
      );
    }

    if (
      example.execution.kind === 'standalone-nexus-operation' &&
      !hasOnlyKnownFields(example.execution, standaloneNexusExecutionFields)
    ) {
      throw new Error(
        `Catalog standalone Nexus execution for example "${example.id}" contains unknown fields`,
      );
    }

    if (
      example.execution.kind === 'standalone-nexus-operation' &&
      (!isNonEmptyString(example.execution.endpoint) ||
        !isNonEmptyString(example.execution.service) ||
        !isNonEmptyString(example.execution.operation) ||
        !isNexusHandler(example.execution.handler) ||
        !isJsonObject(example.execution.policies))
    ) {
      throw new Error(
        `Catalog standalone Nexus execution for example "${example.id}" has invalid field types`,
      );
    }

    if (example.execution.kind === 'standalone-nexus-operation') {
      const { definition } = example.execution.handler;

      if (example.execution.service !== definition.name) {
        throw new Error(
          `Catalog Nexus service "${example.execution.service}" for example "${example.id}" does not match handler service "${definition.name}"`,
        );
      }

      if (!Object.hasOwn(definition.operations, example.execution.operation)) {
        throw new Error(
          `Catalog Nexus operation "${example.execution.operation}" for example "${example.id}" is not defined by service "${definition.name}"`,
        );
      }
    }

    if (
      example.execution.kind === 'standalone-activity' &&
      (!isNonEmptyString(example.execution.activityType) ||
        typeof example.execution.activity !== 'function' ||
        !isJsonObject(example.execution.timeouts) ||
        !isJsonObject(example.execution.policies))
    ) {
      throw new Error(
        `Catalog standalone activity execution for example "${example.id}" has invalid field types`,
      );
    }

    if (
      example.execution.kind === 'workflow' &&
      (!isNonEmptyString(example.execution.workflowType) ||
        typeof example.execution.workflow !== 'function' ||
        !isFunctionRecord(example.execution.activities))
    ) {
      throw new Error(
        `Catalog workflow execution for example "${example.id}" has invalid field types`,
      );
    }

    if (
      example.execution.kind === 'workflow' &&
      example.execution.nexusEndpoints !== undefined &&
      (!Array.isArray(example.execution.nexusEndpoints) ||
        example.execution.nexusEndpoints.length === 0 ||
        !example.execution.nexusEndpoints.every(isNonEmptyString))
    ) {
      throw new Error(
        `Catalog workflow execution for example "${example.id}" declares invalid Nexus endpoints`,
      );
    }

    if (
      example.execution.kind === 'workflow' &&
      example.execution.nexusServices !== undefined &&
      (!Array.isArray(example.execution.nexusServices) ||
        example.execution.nexusServices.length === 0 ||
        !example.execution.nexusServices.every(isNexusHandler))
    ) {
      throw new Error(
        `Catalog workflow execution for example "${example.id}" declares invalid Nexus services`,
      );
    }

    if (
      example.execution.kind === 'workflow' &&
      !hasOnlyEnumerableDataProperties(example.execution.activities)
    ) {
      throw new Error(
        'Catalog activity registrations must use enumerable data properties',
      );
    }
  }

  const targetIds = new Set<string>();

  for (const { id } of registry.targets) {
    if (targetIds.has(id)) {
      throw new Error(`Duplicate catalog target id "${id}"`);
    }

    targetIds.add(id);
  }

  const exampleIds = new Set<string>();

  for (const { execution, id, targetId } of registry.examples) {
    if (exampleIds.has(id)) {
      throw new Error(`Duplicate catalog example id "${id}"`);
    }

    exampleIds.add(id);

    const target = registry.targets.find((target) => target.id === targetId);

    if (!target) {
      throw new Error(
        `Unknown catalog target id "${targetId}" for example "${id}"`,
      );
    }

    if (
      execution.kind === 'workflow' &&
      !Object.hasOwn(target.workflowExports, execution.workflowType)
    ) {
      throw new Error(
        `Workflow type "${execution.workflowType}" for example "${id}" is not exported by target "${targetId}"`,
      );
    }

    if (
      execution.kind === 'workflow' &&
      target.workflowExports[execution.workflowType] !== execution.workflow
    ) {
      throw new Error(
        `Workflow implementation "${execution.workflowType}" for example "${id}" does not match target "${targetId}" static export`,
      );
    }
  }

  const workerBindings: CatalogWorkerBinding[] = registry.targets
    .filter((target) =>
      registry.examples.some((example) => example.targetId === target.id),
    )
    .map((target) => {
      const examples = registry.examples.filter(
        (example) => example.targetId === target.id,
      );
      const activities: Record<string, ActivityImplementation> = {};
      const nexusServices: ServiceHandler[] = [];
      const nexusServiceHandlers = new Map<string, ServiceHandler>();
      const addActivity = (
        activityType: string,
        implementation: ActivityImplementation,
      ) => {
        const existing = activities[activityType];

        if (existing && existing !== implementation) {
          throw new Error(
            `Activity "${activityType}" has conflicting implementations on target "${target.id}"`,
          );
        }

        activities[activityType] = implementation;
      };

      const addNexusService = (handler: ServiceHandler) => {
        const { name } = handler.definition;
        const existing = nexusServiceHandlers.get(name);

        if (existing && existing !== handler) {
          throw new Error(
            `Catalog Nexus service "${name}" has conflicting handlers on target "${target.id}"`,
          );
        }

        if (!existing) {
          nexusServiceHandlers.set(name, handler);
          nexusServices.push(handler);
        }
      };

      for (const { execution } of examples) {
        if (execution.kind === 'workflow') {
          for (const [activityType, implementation] of Object.entries(
            execution.activities,
          )) {
            addActivity(activityType, implementation);
          }

          for (const handler of execution.nexusServices ?? []) {
            addNexusService(handler);
          }
        } else if (execution.kind === 'standalone-activity') {
          addActivity(execution.activityType, execution.activity);
        } else {
          addNexusService(execution.handler);
        }
      }

      return {
        target,
        examples: examples.map(({ id, execution }) => ({ id, execution })),
        activities,
        nexusServices,
      };
    });

  const browserDescriptors: BrowserCatalogDescriptorWithoutSource[] =
    registry.examples.map(({ targetId, execution, ...metadata }) => {
      const target = registry.targets.find(({ id }) => id === targetId)!;

      if (execution.kind === 'standalone-activity') {
        return {
          ...metadata,
          execution: {
            kind: execution.kind,
            targetId: target.id,
            namespace: target.namespace,
            taskQueue: target.taskQueue,
            activityType: execution.activityType,
            timeouts: execution.timeouts,
            policies: execution.policies,
          },
        };
      }

      if (execution.kind === 'standalone-nexus-operation') {
        return {
          ...metadata,
          execution: {
            kind: execution.kind,
            targetId: target.id,
            namespace: target.namespace,
            taskQueue: target.taskQueue,
            endpoint: execution.endpoint,
            service: execution.service,
            operation: execution.operation,
            policies: execution.policies,
          },
        };
      }

      return {
        ...metadata,
        startOptions: {
          ...metadata.startOptions,
          schema: withSharedCatalogStartOptions(metadata.startOptions.schema),
        },
        execution: {
          kind: execution.kind,
          targetId: target.id,
          namespace: target.namespace,
          taskQueue: target.taskQueue,
          workflowType: execution.workflowType,
          ...(execution.nexusEndpoints?.length
            ? { nexusEndpoints: [...execution.nexusEndpoints] }
            : {}),
        },
      };
    });

  for (const descriptor of browserDescriptors) {
    if (!isJsonSerializable(descriptor)) {
      throw new Error(
        `Catalog descriptor "${descriptor.id}" is not JSON-serializable`,
      );
    }
  }

  const browserSnapshots = browserDescriptors.map(
    (descriptor) => JSON.parse(JSON.stringify(descriptor)) as typeof descriptor,
  );

  return { browserDescriptors: browserSnapshots, workerBindings };
};
