import type { Payload } from '$lib/types';

import { atob } from './atob';
import { decodeBinaryProtobuf } from './decode-binary-protobuf';

export type NexusEmbeddedOperationKind =
  | 'start-workflow'
  | 'signal-workflow'
  | 'signal-with-start-workflow'
  | 'query-workflow';

export type NexusOperationDescriptor = {
  kind: NexusEmbeddedOperationKind;
  messageType: string;
  label: string;
  embeddedInput?: Payload[] | null;
  workflowType?: string;
  signalName?: string;
  workflowId?: string;
  taskQueue?: string;
};

type D = Record<string, unknown>;

type OperationSpec = {
  kind: NexusEmbeddedOperationKind;
  getLabel: (d: D) => string;
  getInput: (d: D) => Payload[] | null;
  getWorkflowType?: (d: D) => string | undefined;
  getSignalName?: (d: D) => string | undefined;
  getWorkflowId?: (d: D) => string | undefined;
  getTaskQueue?: (d: D) => string | undefined;
};

const getPayloads = (input: unknown): Payload[] | null => {
  if (!input || typeof input !== 'object') return null;
  const payloads = (input as Record<string, unknown>).payloads;
  return Array.isArray(payloads) ? (payloads as Payload[]) : null;
};

const getName = (obj: unknown): string | undefined => {
  if (!obj || typeof obj !== 'object') return undefined;
  const name = (obj as Record<string, unknown>).name;
  return typeof name === 'string' ? name : undefined;
};

const getString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined;

const NEXUS_OPERATIONS: Record<string, OperationSpec> = {
  'temporal.api.workflowservice.v1.StartWorkflowExecutionRequest': {
    kind: 'start-workflow',
    getLabel: (d) => `Start Workflow: ${getName(d.workflowType) ?? 'Unknown'}`,
    getInput: (d) => getPayloads(d.input),
    getWorkflowType: (d) => getName(d.workflowType),
    getWorkflowId: (d) => getString(d.workflowId),
    getTaskQueue: (d) => getName(d.taskQueue),
  },
  'temporal.api.workflowservice.v1.SignalWorkflowExecutionRequest': {
    kind: 'signal-workflow',
    getLabel: (d) => `Signal Workflow: ${getString(d.signalName) ?? 'Unknown'}`,
    getInput: (d) => getPayloads(d.input),
    getWorkflowId: (d) => getString(d.workflowId),
    getSignalName: (d) => getString(d.signalName),
  },
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest': {
    kind: 'signal-with-start-workflow',
    getLabel: (d) =>
      `Signal With Start Workflow: ${getName(d.workflowType) ?? 'Unknown'}`,
    getInput: (d) => getPayloads(d.input),
    getWorkflowType: (d) => getName(d.workflowType),
    getWorkflowId: (d) => getString(d.workflowId),
    getSignalName: (d) => getString(d.signalName),
    getTaskQueue: (d) => getName(d.taskQueue),
  },
  'temporal.api.workflowservice.v1.QueryWorkflowRequest': {
    kind: 'query-workflow',
    getLabel: (d) => {
      const q = d.query as D | undefined;
      return `Query Workflow: ${getString(d.queryType) ?? getString(q?.queryType) ?? 'Unknown'}`;
    },
    getInput: (d) => getPayloads((d.query as D | undefined)?.queryArgs),
    getWorkflowId: (d) => getString(d.workflowId),
  },
};

export const describeNexusOperation = (
  payload: Payload,
): NexusOperationDescriptor | null => {
  const messageType = atob(String(payload?.metadata?.messageType ?? ''));
  const spec = NEXUS_OPERATIONS[messageType];
  if (!spec) return null;

  const decoded = decodeBinaryProtobuf(payload);
  if (!decoded) return null;

  const d = decoded.data as D;
  return {
    kind: spec.kind,
    messageType,
    label: spec.getLabel(d),
    embeddedInput: spec.getInput(d),
    workflowType: spec.getWorkflowType?.(d),
    signalName: spec.getSignalName?.(d),
    workflowId: spec.getWorkflowId?.(d),
    taskQueue: spec.getTaskQueue?.(d),
  };
};
