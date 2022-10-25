import { describe, expect, it } from 'vitest';

import settingsFixture from '$fixtures/settings.json';
import pendingActivityWorkflow from '$fixtures/workflow.pending-activities.json';
import { toDecodedPendingActivities } from './index';

const namespace = 'unit-tests';
const settings = settingsFixture as unknown as Settings;
const accessToken = 'access-token';

describe('toDecodedPendingActivities', () => {
  it(`should decode heartbeatDetails`, async () => {
    const workflow = pendingActivityWorkflow as unknown as WorkflowExecution;
    const decodedHeartbeatDetails = await toDecodedPendingActivities(
      workflow,
      namespace,
      settings,
      accessToken,
    );

    expect(decodedHeartbeatDetails[0].heartbeatDetails.payloads[0]).toBe(2);
    expect(decodedHeartbeatDetails[1].heartbeatDetails.payloads[0]).toBe(8);
  });
});
