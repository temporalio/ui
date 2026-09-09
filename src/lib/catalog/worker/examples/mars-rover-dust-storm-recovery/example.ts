import {
  analyzeSampleCanister,
  applyTraverseRoute,
  assessTraverseRoute,
  calibrateHighGainAntenna,
  directMissionControlDemo,
  enterStormSafeMode,
  establishRelayLink,
  recordGroundContact,
  resumeMissionTelemetry,
  sealSampleCanister,
  uploadTraverseWaypoints,
  validateTelemetryStream,
} from './activity.js';
import { marsRoverDustStormRecovery } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [120],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Observation window in seconds',
        description:
          'The mission remains open for at least two minutes so its pending Event Group is easy to inspect.',
        type: 'integer',
        minimum: 120,
        maximum: 900,
      },
    ],
    items: false,
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
  id: 'mars-rover-dust-storm-recovery',
  title: 'Event Groups example',
  description:
    'Mars rover dust-storm recovery with explicit, signal, and update Event Group Markers.',
  capabilityTags: [
    'event-groups',
    'activities',
    'child-workflows',
    'signals',
    'updates',
    'retries',
    'cancellations',
  ],
  expectedEvidence: [
    'Three labeled Event Groups separate concurrent communications, science-payload, and surface-mission recovery paths.',
    'Relay-link acquisition fails twice because of dust interference before succeeding on its third attempt.',
    'A running sample-spectrometer activity is canceled to conserve power during the storm.',
    'The dedicated orbiter-relay child workflow is terminated after direct contact is restored.',
    'The ground-contact signal groups contact recording, telemetry validation, and downlink resumption inside the broader communications group.',
    'The traverse-route update groups hazard assessment, route application, and waypoint upload inside the broader mission-planning group.',
    'The surface-mission Event Group remains pending for at least two minutes, showing the running-state treatment in the timeline.',
  ],
  input,
  startOptions,
  setupMarkdown:
    'Event Groups require a Temporal Server version that supports Event Group Markers. The example automatically sends its Mission Control signal and update and terminates its relay-reservation child workflow by connecting back to the same namespace with the Catalog connection environment.',
  execution: {
    kind: 'workflow',
    workflowType: 'marsRoverDustStormRecovery',
    workflow: marsRoverDustStormRecovery,
    activities: {
      analyzeSampleCanister,
      applyTraverseRoute,
      assessTraverseRoute,
      calibrateHighGainAntenna,
      directMissionControlDemo,
      enterStormSafeMode,
      establishRelayLink,
      recordGroundContact,
      resumeMissionTelemetry,
      sealSampleCanister,
      uploadTraverseWaypoints,
      validateTelemetryStream,
    },
  },
};
