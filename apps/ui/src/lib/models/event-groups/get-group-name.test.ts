import { SignalWithStartWorkflowExecutionRequestSchema } from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';
import { create, toBinary } from '@bufbuild/protobuf';
import { describe, expect, it } from 'vitest';

import type { CommonHistoryEvent } from '$lib/types/events';

import { getEventGroupLabel, getEventGroupName } from './get-group-name';

const requestPayload = (init: Record<string, unknown>) => {
  const bytes = toBinary(
    SignalWithStartWorkflowExecutionRequestSchema,
    create(SignalWithStartWorkflowExecutionRequestSchema, init) as never,
  );
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return {
    metadata: {
      encoding: btoa('binary/protobuf'),
      messageType: btoa(
        'temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest',
      ),
    },
    data: btoa(binary),
  };
};

const scheduledEvent = (
  endpoint: string,
  operation = 'SignalWithStartWorkflowExecution',
) =>
  ({
    id: '5',
    name: 'NexusOperationScheduled',
    nexusOperationScheduledEventAttributes: {
      endpoint,
      service: 'temporal.api.workflowservice.v1.WorkflowService',
      operation,
      input: requestPayload({
        workflowId: 'target-workflow-id',
        signalName: 'test-signal',
      }),
    },
  }) as unknown as CommonHistoryEvent;

describe('getEventGroupLabel', () => {
  it('labels a system Nexus group with the operation, not the transport', () => {
    expect(getEventGroupLabel(scheduledEvent('__temporal_system'))).toBe(
      'Signal With Start Workflow Execution',
    );
  });

  it('leaves a non-system Nexus group as a generic Nexus Operation', () => {
    expect(getEventGroupLabel(scheduledEvent('my-endpoint'))).toBe(
      'Nexus Operation',
    );
  });

  it('leaves an unregistered system operation as a generic Nexus Operation', () => {
    expect(
      getEventGroupLabel(scheduledEvent('__temporal_system', 'QueryWorkflow')),
    ).toBe('Nexus Operation');
  });
});

describe('getEventGroupName', () => {
  it('names a system Nexus group with the operation', () => {
    expect(getEventGroupName(scheduledEvent('__temporal_system'))).toBe(
      'Signal With Start Workflow Execution',
    );
  });

  it('falls back to service.operation for a non-system endpoint', () => {
    expect(getEventGroupName(scheduledEvent('my-endpoint'))).toBe(
      'temporal.api.workflowservice.v1.WorkflowService.SignalWithStartWorkflowExecution',
    );
  });
});
