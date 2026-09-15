import {
  ActivityCancellationType,
  CancellationScope,
  createEventGroup,
  defineQuery,
  defineSignal,
  defineUpdate,
  isCancellation,
  proxyActivities,
  setHandler,
  sleep,
  startChild,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activity.js';
import { longActivity } from '../long-activity/workflow.js';

const roverId = 'ARES-7';
const relay = 'Mars Reconnaissance Orbiter';
const sampleCanisterId = 'JEZERO-DELTA-4';

const {
  analyzeSampleCanister,
  applyTraverseRoute,
  assessTraverseRoute,
  calibrateHighGainAntenna,
  directMissionControlDemo,
  enterStormSafeMode,
  recordGroundContact,
  resumeMissionTelemetry,
  sealSampleCanister,
  uploadTraverseWaypoints,
  validateTelemetryStream,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '45 seconds',
  cancellationType: ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
  retry: { maximumAttempts: 1 },
});

const establishRelayLinkWithRetries = proxyActivities<
  Pick<typeof activities, 'establishRelayLink'>
>({
  startToCloseTimeout: '10 seconds',
  retry: {
    maximumAttempts: 3,
    initialInterval: '2 seconds',
    maximumInterval: '2 seconds',
    backoffCoefficient: 1,
  },
}).establishRelayLink;

export const groundContactRestored = defineSignal<[string]>(
  'groundContactRestored',
);
export const changeTraverseRoute = defineUpdate<string, [string]>(
  'changeTraverseRoute',
);
export const missionStatus = defineQuery<MissionStatus>('missionStatus');

type MissionStatus = {
  contactRelay?: string;
  traverseRoute?: string;
  sampleAnalysisCanceled: boolean;
  missionControlActions: string[];
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export async function marsRoverDustStormRecovery(
  observationWindowSeconds = 120,
): Promise<MissionStatus> {
  const communicationsGroup = createEventGroup('Restore communications', {
    id: 'restore-communications',
  });
  const sciencePayloadGroup = createEventGroup('Protect science payload', {
    id: 'protect-science-payload',
  });
  const missionPlanningGroup = createEventGroup('Replan surface mission', {
    id: 'replan-surface-mission',
  });

  const status: MissionStatus = {
    sampleAnalysisCanceled: false,
    missionControlActions: [],
  };

  setHandler(missionStatus, () => status);

  setHandler(groundContactRestored, async (contactRelay) => {
    status.contactRelay = contactRelay;
    await communicationsGroup.withScope(async () => {
      await recordGroundContact(roverId, contactRelay);
      await validateTelemetryStream(roverId, contactRelay);
      await resumeMissionTelemetry(roverId);
    });
  });

  setHandler(changeTraverseRoute, async (route) => {
    const result = await missionPlanningGroup.withScope(async () => {
      await assessTraverseRoute(roverId, route);
      const appliedRoute = await applyTraverseRoute(roverId, route);
      await uploadTraverseWaypoints(roverId, route);
      return appliedRoute;
    });
    status.traverseRoute = route;
    return result;
  });

  const relayReservationWorkflowId = `relay-reservation-${workflowInfo().workflowId}`;
  const relayReservation = await startChild(longActivity, {
    args: [300_000],
    workflowId: relayReservationWorkflowId,
    eventGroups: [communicationsGroup],
  });

  const restoreCommunications = communicationsGroup.withScope(async () => {
    const link = establishRelayLinkWithRetries(relay);
    const reservationResult = relayReservation
      .result()
      .catch((error) => `Relay reservation ended: ${errorMessage(error)}`);

    await link;
    await calibrateHighGainAntenna(roverId);
    await reservationResult;
  });

  const protectSciencePayload = sciencePayloadGroup.withScope(async () => {
    const cancellationScope = new CancellationScope();
    const analysis = cancellationScope.run(() =>
      analyzeSampleCanister(sampleCanisterId),
    );
    const sealed = sealSampleCanister(sampleCanisterId);

    await sleep('8 seconds');
    cancellationScope.cancel();

    try {
      await analysis;
    } catch (error) {
      if (!isCancellation(error)) throw error;
      status.sampleAnalysisCanceled = true;
    }
    await sealed;
  });

  const replanSurfaceMission = missionPlanningGroup.withScope(async () => {
    const missionControlDirector = directMissionControlDemo(
      relayReservationWorkflowId,
    ).then(
      (actions) => {
        status.missionControlActions = actions;
      },
      (error) => {
        status.missionControlActions = [
          `Mission Control director failed: ${errorMessage(error)}`,
        ];
      },
    );

    await enterStormSafeMode(roverId);
    await missionControlDirector;
    await sleep(`${Math.max(120, observationWindowSeconds)} seconds`);
  });

  await Promise.all([
    restoreCommunications,
    protectSciencePayload,
    replanSurfaceMission,
  ]);

  return status;
}
