import type { Payload } from '$lib/types';

import { atob } from './atob';
import { decodeBinaryProtobuf } from './decode-binary-protobuf';

export type NexusEmbeddedOperationKind = 'signal-with-start-workflow';

export type NexusTargetExecution = {
  namespace?: string;
  workflowId?: string;
  runId?: string;
  eventId?: string;
};

export type NexusOperationDescriptor = {
  kind: NexusEmbeddedOperationKind;
  messageType: string;
  label: string;
  embeddedInput?: Payload[] | null;
  workflowInput?: Payload[] | null;
  signalName?: string;
  workflowId?: string;
  namespace?: string;
  control?: string;
  identity?: string;
};

export type NexusResponseDescriptor = {
  label: string;
  runId?: string;
  started?: boolean;
  target?: NexusTargetExecution;
};

type D = Record<string, unknown>;

type OperationSpec = {
  kind: NexusEmbeddedOperationKind;
  getLabel: (d: D) => string;
  getInput: (d: D) => Payload[] | null;
  getWorkflowInput?: (d: D) => Payload[] | null;
  getSignalName?: (d: D) => string | undefined;
  getWorkflowId?: (d: D) => string | undefined;
  getNamespace?: (d: D) => string | undefined;
  getControl?: (d: D) => string | undefined;
  getIdentity?: (d: D) => string | undefined;
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
    getNamespace: (d) => getString(d.namespace),
    getControl: (d) => getString(d.control),
    getIdentity: (d) => getString(d.identity),
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
    namespace: spec.getNamespace?.(d),
    control: spec.getControl?.(d),
    identity: spec.getIdentity?.(d),
  };
};

const getTargetFromSignalLink = (
  signalLink: unknown,
): NexusTargetExecution | undefined => {
  if (!signalLink || typeof signalLink !== 'object') return undefined;
  const workflowEvent = (signalLink as Record<string, unknown>).workflowEvent;
  if (!workflowEvent || typeof workflowEvent !== 'object') return undefined;

  const w = workflowEvent as Record<string, unknown>;
  const eventRef = (w.eventRef ?? {}) as Record<string, unknown>;
  const target: NexusTargetExecution = {
    namespace: getString(w.namespace),
    workflowId: getString(w.workflowId),
    runId: getString(w.runId),
    eventId:
      eventRef.eventId === undefined ? undefined : String(eventRef.eventId),
  };

  return Object.values(target).some(Boolean) ? target : undefined;
};

export const describeNexusResponse = (
  payload: Payload,
): NexusResponseDescriptor | null => {
  const label = getSystemNexusLabelFromResponsePayload(payload);
  if (!label) return null;

  const decoded = decodeBinaryProtobuf(payload);
  if (!decoded) return { label };

  const d = decoded.data as D;
  const runId = getString(d.runId);

  return {
    label,
    runId,
    started: typeof d.started === 'boolean' ? d.started : undefined,
    target: getTargetFromSignalLink(d.signalLink),
  };
};
