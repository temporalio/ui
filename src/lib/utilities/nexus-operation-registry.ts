import type { Payload } from '$lib/types';

import { atob } from './atob';
import { decodeBinaryProtobuf } from './decode-binary-protobuf';

export type NexusEmbeddedOperationKind = 'signal-with-start-workflow';

export type NexusOperationDescriptor = {
  kind: NexusEmbeddedOperationKind;
  messageType: string;
  label: string;
  embeddedInput?: Payload[] | null;
  workflowInput?: Payload[] | null;
  signalName?: string;
  workflowId?: string;
};

type D = Record<string, unknown>;

type OperationSpec = {
  kind: NexusEmbeddedOperationKind;
  getLabel: (d: D) => string;
  getInput: (d: D) => Payload[] | null;
  getWorkflowInput?: (d: D) => Payload[] | null;
  getSignalName?: (d: D) => string | undefined;
  getWorkflowId?: (d: D) => string | undefined;
};

const getPayloads = (input: unknown): Payload[] | null => {
  if (!input || typeof input !== 'object') return null;
  const payloads = (input as Record<string, unknown>).payloads;
  return Array.isArray(payloads) ? (payloads as Payload[]) : null;
};

const getString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined;

const NEXUS_OPERATIONS: Record<string, OperationSpec> = {
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest': {
    kind: 'signal-with-start-workflow',
    getLabel: (_d) => 'Signal With Start Workflow Execution',
    getInput: (d) => getPayloads(d.signalInput),
    getWorkflowInput: (d) => getPayloads(d.input),
    getWorkflowId: (d) => getString(d.workflowId),
    getSignalName: (d) => getString(d.signalName),
  },
};

const SYSTEM_NEXUS_RESPONSE_LABELS: Record<string, string> = {
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse':
    'Signal With Start Workflow Execution',
};

export const getSystemNexusLabelFromResponsePayload = (
  payload: Payload,
): string | null => {
  const encoding = atob(String(payload?.metadata?.encoding ?? ''));
  const messageType = atob(String(payload?.metadata?.messageType ?? ''));
  if (encoding !== 'binary/protobuf' || !messageType) return null;
  return SYSTEM_NEXUS_RESPONSE_LABELS[messageType] ?? null;
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
    workflowInput: spec.getWorkflowInput?.(d) ?? undefined,
    signalName: spec.getSignalName?.(d),
    workflowId: spec.getWorkflowId?.(d),
  };
};
