import {
  allHandlersFinished,
  condition,
  createEventGroup,
  defineSignal,
  defineUpdate,
  type EventGroup,
  proxyActivities,
  setHandler,
  sleep,
} from '@temporalio/workflow';

import type * as activities from './activity.js';

const {
  runPreflightCheck,
  requestLaunchPoll,
  recordLaunchPoll,
  fireStage,
  separateStage,
  deploySatellite,
  powerOnSatellite,
  establishContact,
  requestOrbitAdjustment,
  planOrbitBurn,
  confirmOrbit,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: { maximumAttempts: 3 },
});

export type SatelliteLaunchInput = {
  missionName: string;
  satellites: string[];
  launchPollTimeoutSeconds: number;
};

export const goForLaunch = defineSignal<[string]>('goForLaunch');
export const adjustOrbit = defineUpdate<string, [activities.OrbitAdjustment]>(
  'adjustOrbit',
);

export async function satelliteLaunchEventGroups({
  missionName,
  satellites,
  launchPollTimeoutSeconds,
}: SatelliteLaunchInput): Promise<string> {
  const satelliteGroups = new Map<string, EventGroup>();
  const satelliteGroup = (satelliteId: string) => {
    let group = satelliteGroups.get(satelliteId);
    if (!group) {
      group = createEventGroup(`satellite:${satelliteId}`, {
        label: `Satellite ${satelliteId}`,
      });
      satelliteGroups.set(satelliteId, group);
    }
    return group;
  };

  let launchPollResult: string | undefined;
  setHandler(goForLaunch, async (flightDirector) => {
    launchPollResult = await recordLaunchPoll(flightDirector);
  });

  const orbitAdjustments: string[] = [];
  setHandler(
    adjustOrbit,
    async (adjustment) =>
      satelliteGroup(adjustment.satelliteId).withScope(async () => {
        await planOrbitBurn(adjustment);
        await sleep('1 second');
        const result = await confirmOrbit(adjustment.satelliteId);
        orbitAdjustments.push(result);
        return result;
      }),
    {
      validator: (adjustment) => {
        if (!satellites.includes(adjustment.satelliteId)) {
          throw new Error(`Unknown satellite ${adjustment.satelliteId}`);
        }
      },
    },
  );

  const preLaunch = createEventGroup('pre-launch', {
    label: 'Pre-launch checks',
  });
  const ascent = createEventGroup('ascent', { label: 'Ascent' });
  const deployment = createEventGroup('deployment', {
    label: 'Payload deployment',
  });

  const cleared = await preLaunch.withScope(async () => {
    await Promise.all(
      ['Propellant', 'Weather', 'Range safety'].map(runPreflightCheck),
    );
    await requestLaunchPoll('Flight Director');
    return condition(
      () => launchPollResult !== undefined,
      `${launchPollTimeoutSeconds} seconds`,
    );
  });
  if (!cleared) {
    return `${missionName} scrubbed: no launch poll within ${launchPollTimeoutSeconds}s`;
  }

  await ascent.withScope(async () => {
    await fireStage('Stage 1');
    await sleep('2 seconds');
    await separateStage('Stage 1');
    await fireStage('Stage 2');
    await sleep('2 seconds');
  });

  await deployment.withScope(async () => {
    for (const [index, satelliteId] of satellites.entries()) {
      await satelliteGroup(satelliteId).withScope(async () => {
        await deploySatellite(satelliteId);
        await powerOnSatellite(satelliteId);
        await establishContact(satelliteId);
        if (index === 0) {
          await requestOrbitAdjustment({
            satelliteId,
            deltaVMetersPerSecond: 12,
          });
        }
      });
    }
  });

  await condition(allHandlersFinished);

  return `${missionName}: ${satellites.length} satellites deployed, ${orbitAdjustments.length} orbit adjustment(s)`;
}
