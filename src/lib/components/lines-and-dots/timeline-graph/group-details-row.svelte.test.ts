import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

import {
  closeGroupDetailsRowClientTestRunner,
  getGroupDetailsRowClientTestRunner,
} from './group-details-row-client-test-runner';

const scheduledEvent = {
  id: '5',
  name: 'NexusOperationScheduled',
  category: 'nexus',
  classification: 'Scheduled',
  eventTime: '2026-08-18T12:00:00.000Z',
};

const terminalEvent = {
  id: '6',
  name: 'NexusOperationCompleted',
  category: 'nexus',
  classification: 'Completed',
  eventTime: '2026-08-18T12:00:01.000Z',
};

const completedSignalWithStartGroup = {
  id: '5',
  displayName: 'Signal With Start Workflow Execution',
  eventList: [scheduledEvent, terminalEvent],
  initialEvent: scheduledEvent,
  lastEvent: terminalEvent,
  classification: 'Scheduled',
  finalClassification: 'Completed',
  category: 'nexus',
  isPending: false,
} as unknown as EventGroup;

describe('GroupDetailsRow', () => {
  let client: Awaited<ReturnType<typeof getGroupDetailsRowClientTestRunner>>;

  beforeAll(async () => {
    client = await getGroupDetailsRowClientTestRunner();
  });

  afterEach(async () => {
    await client.cleanup();
  });

  afterAll(closeGroupDetailsRowClientTestRunner);

  it('opens a completed SignalWithStart group as a whole group', () => {
    const target = client.render(completedSignalWithStartGroup);

    expect(
      target
        .querySelector('[data-testid="event-details-full"]')
        ?.getAttribute('data-group-row'),
    ).toBe('true');
  });
});
