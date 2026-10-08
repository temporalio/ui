import {
  confirmOrbit,
  deploySatellite,
  establishContact,
  fireStage,
  planOrbitBurn,
  powerOnSatellite,
  recordLaunchPoll,
  requestLaunchPoll,
  requestOrbitAdjustment,
  runPreflightCheck,
  separateStage,
} from './activity.js';
import { satelliteLaunchEventGroups } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [
    {
      missionName: 'Aurora-7',
      satellites: ['SAT-A', 'SAT-B'],
      launchPollTimeoutSeconds: 30,
    },
  ],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Mission',
        type: 'object',
        properties: {
          missionName: { type: 'string', minLength: 1 },
          satellites: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
            maxItems: 5,
            uniqueItems: true,
          },
          launchPollTimeoutSeconds: {
            type: 'integer',
            minimum: 5,
            maximum: 300,
          },
        },
        required: ['missionName', 'satellites', 'launchPollTimeoutSeconds'],
        additionalProperties: false,
      },
    ],
    items: false,
    minItems: 1,
    maxItems: 1,
  },
};

const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};

export const catalogExample: CatalogExampleDefinition = {
  id: 'satellite-launch-event-groups',
  title: 'Event marker groups',
  description:
    'Launches a rocket and deploys satellites, grouping history events by mission phase and satellite.',
  capabilityTags: ['event-groups', 'signals', 'updates', 'activities'],
  expectedEvidence: [
    'Events grouped under Pre-launch checks, Ascent, and Payload deployment, with deployment events also grouped by satellite.',
    'Launch poll events grouped by the goForLaunch signal, and orbit burn events grouped by both the adjustOrbit update and their satellite.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'satelliteLaunchEventGroups',
    workflow: satelliteLaunchEventGroups,
    activities: {
      confirmOrbit,
      deploySatellite,
      establishContact,
      fireStage,
      planOrbitBurn,
      powerOnSatellite,
      recordLaunchPoll,
      requestLaunchPoll,
      requestOrbitAdjustment,
      runPreflightCheck,
      separateStage,
    },
  },
};
