import {
  applyCatalogSchedulePlan,
  listCatalogSchedules,
} from './activities.js';
import { catalogScheduleSync } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [[]],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Declared schedules',
        type: 'array',
        items: { type: 'object' },
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
  id: 'schedule-sync',
  title: 'Schedule sync',
  description:
    'Reconciles the schedules declared by catalog examples against the server.',
  capabilityTags: ['schedules', 'activities', 'terminal-outcome'],
  expectedEvidence: [
    'A completed workflow whose result lists the created, updated, and deleted schedule ids.',
  ],
  input,
  startOptions,
  setupMarkdown: [
    'The schedule manager is disabled by default, so no catalog example creates a schedule until you turn it on.',
    '',
    'Set `CATALOG_SCHEDULES=enabled` in `.env.catalog.local` and restart the worker. The worker then creates its own hourly `ui-catalog-schedule-sync` schedule and triggers it once.',
    '',
    'The manager only writes schedules it owns. Ownership comes from the `uiCatalog` memo it stamps on every schedule it creates. A schedule id that already exists without that memo is reported as blocked and is never updated or deleted.',
  ].join('\n'),
  execution: {
    kind: 'workflow',
    workflowType: 'catalogScheduleSync',
    workflow: catalogScheduleSync,
    activities: { applyCatalogSchedulePlan, listCatalogSchedules },
  },
};
