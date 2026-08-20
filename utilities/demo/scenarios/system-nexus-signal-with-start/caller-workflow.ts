import protoPkg from '@temporalio/proto';
import { createNexusServiceClient, workflowInfo } from '@temporalio/workflow';
import * as nexus from 'nexus-rpc';

const { temporal } = protoPkg;

type Request = InstanceType<
  typeof temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest
>;
type Response = InstanceType<
  typeof temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionResponse
>;

/**
 * The system endpoint serves the workflowservice contract, so the operation is
 * named exactly as the proto names it.
 */
const workflowService = nexus.service(
  'temporal.api.workflowservice.v1.WorkflowService',
  {
    SignalWithStartWorkflowExecution: nexus.operation<Request, Response>(),
  },
);

export type CallerInput = {
  targetWorkflowId: string;
  targetWorkflowType: string;
  targetTaskQueue: string;
  signalName: string;
  signalInput: unknown;
  workflowInput: unknown[];
  memo: Record<string, unknown>;
  /** Defaults to this workflow's id. The UI shows it on the initiated event. */
  identity?: string;
};

/**
 * The inner payloads the target receives. A workflow has no payload converter
 * of its own, and `json/plain` is what the default converter produces for these
 * values, so the caller builds them directly.
 */
const jsonPayload = (value: unknown) => ({
  metadata: { encoding: new TextEncoder().encode('json/plain') },
  data: new TextEncoder().encode(JSON.stringify(value)),
});

export type CallerOutput = {
  started: boolean;
  runId: string;
};

/**
 * Invokes SignalWithStartWorkflowExecution on the `__temporal_system` endpoint.
 * An ordinary workflow can do this: only the Go SDK refuses the reserved
 * `__temporal_` prefix.
 */
export async function SystemNexusSignalWithStartCaller(
  input: CallerInput,
): Promise<CallerOutput> {
  const client = createNexusServiceClient({
    endpoint: '__temporal_system',
    service: workflowService,
  });

  const { SignalWithStartWorkflowExecutionRequest } =
    temporal.api.workflowservice.v1;

  const response = await client.executeOperation(
    'SignalWithStartWorkflowExecution',
    SignalWithStartWorkflowExecutionRequest.create({
      workflowId: input.targetWorkflowId,
      workflowType: { name: input.targetWorkflowType },
      taskQueue: { name: input.targetTaskQueue },
      signalName: input.signalName,
      // Nothing populates this for us: the server records the request as the
      // caller sent it, and no SDK sets identity on this path yet. The UI shows
      // it when present, so the caller names itself.
      identity: input.identity ?? workflowInfo().workflowId,
      signalInput: { payloads: [jsonPayload(input.signalInput)] },
      input: { payloads: input.workflowInput.map(jsonPayload) },
      ...(Object.keys(input.memo).length
        ? {
            memo: {
              fields: Object.fromEntries(
                Object.entries(input.memo).map(([key, value]) => [
                  key,
                  jsonPayload(value),
                ]),
              ),
            },
          }
        : {}),
    }),
  );

  return { started: response.started, runId: response.runId };
}
