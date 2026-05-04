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

type Handler = (
  decoded: Record<string, unknown>,
  messageType: string,
) => NexusOperationDescriptor;

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

const HANDLERS: Record<string, Handler> = {
  'temporal.api.workflowservice.v1.StartWorkflowExecutionRequest': (d, mt) => ({
    kind: 'start-workflow',
    messageType: mt,
    label: `Start Workflow: ${getName(d.workflowType) ?? 'Unknown'}`,
    embeddedInput: getPayloads(d.input),
    workflowType: getName(d.workflowType),
    workflowId: typeof d.workflowId === 'string' ? d.workflowId : undefined,
    taskQueue: getName(d.taskQueue),
  }),
  'temporal.api.workflowservice.v1.SignalWorkflowExecutionRequest': (
    d,
    mt,
  ) => ({
    kind: 'signal-workflow',
    messageType: mt,
    label: `Signal Workflow: ${typeof d.signalName === 'string' ? d.signalName : 'Unknown'}`,
    embeddedInput: getPayloads(d.input),
    workflowId: typeof d.workflowId === 'string' ? d.workflowId : undefined,
    signalName: typeof d.signalName === 'string' ? d.signalName : undefined,
  }),
  'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest': (
    d,
    mt,
  ) => ({
    kind: 'signal-with-start-workflow',
    messageType: mt,
    label: `Signal With Start Workflow: ${getName(d.workflowType) ?? 'Unknown'}`,
    embeddedInput: getPayloads(d.input),
    workflowType: getName(d.workflowType),
    workflowId: typeof d.workflowId === 'string' ? d.workflowId : undefined,
    signalName: typeof d.signalName === 'string' ? d.signalName : undefined,
    taskQueue: getName(d.taskQueue),
  }),
  'temporal.api.workflowservice.v1.QueryWorkflowRequest': (d, mt) => ({
    kind: 'query-workflow',
    messageType: mt,
    label: `Query Workflow: ${typeof d.queryType === 'string' ? d.queryType : typeof (d.query as Record<string, unknown>)?.queryType === 'string' ? (d.query as Record<string, unknown>).queryType : 'Unknown'}`,
    embeddedInput: getPayloads((d.query as Record<string, unknown>)?.queryArgs),
    workflowId: typeof d.workflowId === 'string' ? d.workflowId : undefined,
  }),
};

export const describeNexusOperation = (
  payload: Payload,
): NexusOperationDescriptor | null => {
  const messageType = atob(String(payload?.metadata?.messageType ?? ''));
  const handler = HANDLERS[messageType];
  if (!handler) return null;

  const decoded = decodeBinaryProtobuf(payload);
  if (!decoded) return null;

  return handler(decoded.data as Record<string, unknown>, messageType);
};
