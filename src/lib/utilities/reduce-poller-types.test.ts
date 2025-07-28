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

  it('should combine activity and workflow pollers', () => {
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
          lastAccessTime: 2,
          taskQueueTypes: ['WORKFLOW', 'ACTIVITY'],
        },
      ],
    });
  });

  it('should combine nexus and workflow pollers', () => {
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
          lastAccessTime: 2,
          taskQueueTypes: ['WORKFLOW', 'NEXUS'],
        },
      ],
    });
  });

  it('should combine all poller types', () => {
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
          lastAccessTime: 2,
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
});
