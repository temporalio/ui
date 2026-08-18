import { SignalWithStartWorkflowExecutionRequestSchema } from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';
import { create, toBinary } from '@bufbuild/protobuf';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Payload } from '$lib/types';

import {
  closeInputRendererClientTestRunner,
  getInputRendererClientTestRunner,
} from './input-renderer-client-test-runner';

const registeredPayload = (data: string): Payload =>
  ({
    metadata: {
      encoding: btoa('binary/protobuf'),
      messageType: btoa(
        'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest',
      ),
    },
    data,
  }) as unknown as Payload;

const validRequestPayload = (init: Record<string, unknown>) => {
  const bytes = toBinary(
    SignalWithStartWorkflowExecutionRequestSchema,
    create(SignalWithStartWorkflowExecutionRequestSchema, init) as never,
  );
  return registeredPayload(btoa(String.fromCharCode(...bytes)));
};

let client: Awaited<ReturnType<typeof getInputRendererClientTestRunner>>;

beforeAll(async () => {
  client = await getInputRendererClientTestRunner();
});

afterEach(async () => {
  await client.cleanup();
});

afterAll(closeInputRendererClientTestRunner);

describe('signal-with-start workflow input renderer', () => {
  it('keeps corrupt registered payload bytes visible', async () => {
    const payload = registeredPayload(
      btoa('this is not valid protobuf binary data!!!'),
    );
    const target = await client.render(payload);

    expect(target.textContent).toContain(payload.data);
  });

  it('keeps a valid request without inputs visible', async () => {
    const payload = validRequestPayload({
      namespace: 'default',
      workflowId: 'workflow-id',
    });
    const target = await client.render(payload);

    expect(target.textContent).toContain(payload.data);
  });
});
