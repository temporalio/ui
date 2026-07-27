import { describe, expect, it } from 'vitest';

import { reducePollerTypes } from './reduce-poller-types';

const versioningInfo = {
  versioningInfo: {
    currentVersion: '__unversioned__',
  },
};

const taskQueueStatus = undefined;

describe('reducePollerTypes', () => {
  it('should return only workflow pollers if only workflow pollers', () => {
    const result = reducePollerTypes({
      workflowPollers: {
        pollers: [{ identity: '1', lastAccessTime: 1 }],
        versioningInfo,
      },
      activityPollers: {
        versioningInfo,
      },
      nexusPollers: {
        versioningInfo,
      },
    });
    expect(result).toEqual({
      versioningInfo,
      taskQueueStatus,
      pollers: [
        {
          identity: '1',
          lastAccessTime: 1,
          taskQueueTypes: ['WORKFLOW'],
        },
      ],
    });
  });

  it('should combine activity and workflow pollers with same identity', () => {
    const result = reducePollerTypes({
      activityPollers: {
        pollers: [{ identity: '1', lastAccessTime: 2 }],
        versioningInfo,
      },
      nexusPollers: {
        versioningInfo,
      },
      workflowPollers: {
        pollers: [{ identity: '1', lastAccessTime: 3 }],
        versioningInfo,
      },
    });
    expect(result).toEqual({
      versioningInfo,
      taskQueueStatus,
      pollers: [
        {
          identity: '1',
          lastAccessTime: 3,
          taskQueueTypes: ['WORKFLOW', 'ACTIVITY'],
        },
      ],
    });
  });

  it('should combine nexus and workflow pollers with same identity', () => {
    const result = reducePollerTypes({
      activityPollers: {
        versioningInfo,
      },
      nexusPollers: {
        pollers: [{ identity: '1', lastAccessTime: 2 }],
        versioningInfo,
      },
      workflowPollers: {
        pollers: [{ identity: '1', lastAccessTime: 3 }],
        versioningInfo,
      },
    });
    expect(result).toEqual({
      versioningInfo,
      taskQueueStatus,
      pollers: [
        {
          identity: '1',
          lastAccessTime: 3,
          taskQueueTypes: ['WORKFLOW', 'NEXUS'],
        },
      ],
    });
  });

  it('should combine all poller types with same identity', () => {
    const result = reducePollerTypes({
      activityPollers: {
        pollers: [{ identity: '1', lastAccessTime: 2 }],
        versioningInfo,
      },
      nexusPollers: {
        pollers: [{ identity: '1', lastAccessTime: 4 }],
        versioningInfo,
      },
      workflowPollers: {
        pollers: [{ identity: '1', lastAccessTime: 3 }],
        versioningInfo,
      },
    });
    expect(result).toEqual({
      versioningInfo,
      taskQueueStatus,
      pollers: [
        {
          identity: '1',
          lastAccessTime: 4,
          taskQueueTypes: ['WORKFLOW', 'ACTIVITY', 'NEXUS'],
        },
      ],
    });
  });

  it('should return an empty array if no pollers are present', () => {
    const result = reducePollerTypes({
      activityPollers: { versioningInfo },
      nexusPollers: { versioningInfo },
      workflowPollers: { versioningInfo },
    });
    expect(result).toEqual({
      versioningInfo,
      taskQueueStatus,
      pollers: [],
    });
  });

  it('should return separate workers when identities differ', () => {
    const result = reducePollerTypes({
      workflowPollers: {
        pollers: [
          {
            identity: '124@Mac.local.net',
            lastAccessTime: '2025-12-10T15:55:38.544049618Z',
          },
        ],
        versioningInfo,
      },
      activityPollers: {
        pollers: [
          {
            identity: '345@Mac.local.net',
            lastAccessTime: '2025-12-10T15:55:39.802086504Z',
          },
        ],
        versioningInfo,
      },
      nexusPollers: {
        pollers: [
          {
            identity: '678@Mac.local.net',
            lastAccessTime: '2025-12-10T15:55:40.000000000Z',
          },
        ],
        versioningInfo,
      },
    });
    expect(result.pollers).toHaveLength(3);
    expect(result.pollers).toContainEqual({
      identity: '124@Mac.local.net',
      lastAccessTime: '2025-12-10T15:55:38.544049618Z',
      taskQueueTypes: ['WORKFLOW'],
    });
    expect(result.pollers).toContainEqual({
      identity: '345@Mac.local.net',
      lastAccessTime: '2025-12-10T15:55:39.802086504Z',
      taskQueueTypes: ['ACTIVITY'],
    });
    expect(result.pollers).toContainEqual({
      identity: '678@Mac.local.net',
      lastAccessTime: '2025-12-10T15:55:40.000000000Z',
      taskQueueTypes: ['NEXUS'],
    });
  });

  it('should handle mix of shared and different identities', () => {
    const result = reducePollerTypes({
      workflowPollers: {
        pollers: [
          { identity: 'shared@host', lastAccessTime: 1 },
          { identity: 'workflow-only@host', lastAccessTime: 2 },
        ],
        versioningInfo,
      },
      activityPollers: {
        pollers: [
          { identity: 'shared@host', lastAccessTime: 3 },
          { identity: 'activity-only@host', lastAccessTime: 4 },
        ],
        versioningInfo,
      },
      nexusPollers: {
        pollers: [
          { identity: 'shared@host', lastAccessTime: 5 },
          { identity: 'nexus-only@host', lastAccessTime: 6 },
        ],
        versioningInfo,
      },
    });
    expect(result.pollers).toHaveLength(4);
    expect(result.pollers).toContainEqual({
      identity: 'shared@host',
      lastAccessTime: 5,
      taskQueueTypes: ['WORKFLOW', 'ACTIVITY', 'NEXUS'],
    });
    expect(result.pollers).toContainEqual({
      identity: 'workflow-only@host',
      lastAccessTime: 2,
      taskQueueTypes: ['WORKFLOW'],
    });
    expect(result.pollers).toContainEqual({
      identity: 'activity-only@host',
      lastAccessTime: 4,
      taskQueueTypes: ['ACTIVITY'],
    });
    expect(result.pollers).toContainEqual({
      identity: 'nexus-only@host',
      lastAccessTime: 6,
      taskQueueTypes: ['NEXUS'],
    });
  });

  it('should return only nexus pollers if only nexus pollers', () => {
    const result = reducePollerTypes({
      workflowPollers: {
        versioningInfo,
      },
      activityPollers: {
        versioningInfo,
      },
      nexusPollers: {
        pollers: [{ identity: '1', lastAccessTime: 1 }],
        versioningInfo,
      },
    });
    expect(result).toEqual({
      versioningInfo,
      taskQueueStatus,
      pollers: [
        {
          identity: '1',
          lastAccessTime: 1,
          taskQueueTypes: ['NEXUS'],
        },
      ],
    });
  });

  it('should combine nexus and activity pollers with same identity', () => {
    const result = reducePollerTypes({
      workflowPollers: {
        versioningInfo,
      },
      activityPollers: {
        pollers: [{ identity: '1', lastAccessTime: 2 }],
        versioningInfo,
      },
      nexusPollers: {
        pollers: [{ identity: '1', lastAccessTime: 3 }],
        versioningInfo,
      },
    });
    expect(result).toEqual({
      versioningInfo,
      taskQueueStatus,
      pollers: [
        {
          identity: '1',
          lastAccessTime: 3,
          taskQueueTypes: ['ACTIVITY', 'NEXUS'],
        },
      ],
    });
  });
});
