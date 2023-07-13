import { describe, expect, it } from 'vitest';

import { toWorkflowExecution } from '$lib/models/workflow-execution';

import {
  getCurrentCompatibilityDefaultVersion,
  getCurrentWorkflowBuildId,
  getDefaultVersionForSet,
  getNonDefaultVersionsForSet,
  getOrderedVersionSets,
} from './task-queue-compatibility';

describe('getOrderedVersionSets', () => {
  it(`should return empty array if undefined majorVersionSets`, () => {
    expect(getOrderedVersionSets(undefined)).toStrictEqual([]);
  });

  it(`should return empty array if empty array of majorVersionSets`, () => {
    expect(getOrderedVersionSets([])).toStrictEqual([]);
  });

  it(`should return reversed array of majorVersionSets`, () => {
    const majorVersionSets = [
      {
        versionSetId: '1.0',
        buildIds: ['1.0', '1.1', '1.2'],
      },
      {
        versionSetId: '2.0',
        buildIds: ['2.0', '2.1', '2.2'],
      },
      {
        versionSetId: '3.0',
        buildIds: ['3.0'],
      },
    ];
    expect(getOrderedVersionSets({ majorVersionSets })).toStrictEqual([
      {
        versionSetId: '3.0',
        buildIds: ['3.0'],
      },
      {
        versionSetId: '2.0',
        buildIds: ['2.0', '2.1', '2.2'],
      },
      {
        versionSetId: '1.0',
        buildIds: ['1.0', '1.1', '1.2'],
      },
    ]);
  });
});

describe('getDefaultVersionForSet', () => {
  it('should return undefined if no buildIds', () => {
    expect(getDefaultVersionForSet(undefined)).toBe(undefined);
  });

  it('should return undefined if empty array of buildIds', () => {
    expect(getDefaultVersionForSet([])).toBe(undefined);
  });

  it('should return last element of single element array of buildIds', () => {
    expect(getDefaultVersionForSet(['1.0'])).toBe('1.0');
  });

  it('should return last element of array of buildIds', () => {
    expect(getDefaultVersionForSet(['1.0', '2.3', '3.6', '4.4'])).toBe('4.4');
  });
});

describe('getDefaultVersionForSet', () => {
  it('should return undefined if no buildIds', () => {
    expect(getDefaultVersionForSet(undefined)).toBe(undefined);
  });

  it('should return undefined if empty array of buildIds', () => {
    expect(getDefaultVersionForSet([])).toBe(undefined);
  });

  it('should return last element of single element array of buildIds', () => {
    expect(getDefaultVersionForSet(['1.0'])).toBe('1.0');
  });

  it('should return last element of array of buildIds', () => {
    expect(getDefaultVersionForSet(['1.0', '2.3', '3.6', '4.4'])).toBe('4.4');
  });
});

describe('getNonDefaultVersionsForSet', () => {
  it('should return undefined if no buildIds', () => {
    expect(getNonDefaultVersionsForSet(undefined)).toStrictEqual([]);
  });

  it('should return undefined if empty array of buildIds', () => {
    expect(getNonDefaultVersionsForSet([])).toStrictEqual([]);
  });

  it('should return last element of single element array of buildIds', () => {
    expect(getNonDefaultVersionsForSet(['1.0'])).toStrictEqual([]);
  });

  it('should return all but last element of array of buildIds', () => {
    expect(
      getNonDefaultVersionsForSet(['1.0', '2.3', '3.6', '4.4']),
    ).toStrictEqual(['3.6', '2.3', '1.0']);
  });
});

describe('getCurrentCompatibilityDefaultVersion', () => {
  it('should return undefined if no majorVersionSets', () => {
    expect(
      getCurrentCompatibilityDefaultVersion({ majorVersionSets: undefined }),
    ).toBe(undefined);
  });

  it('should return undefined if empty array of majorVersionSets', () => {
    expect(
      getCurrentCompatibilityDefaultVersion({ majorVersionSets: [] }),
    ).toBe(undefined);
  });

  it('should return default version if one array of majorVersionSets', () => {
    const majorVersionSets = [
      {
        versionSetId: '1.0',
        buildIds: ['1.0', '1.1', '1.2'],
      },
    ];

    expect(getCurrentCompatibilityDefaultVersion({ majorVersionSets })).toBe(
      '1.2',
    );
  });
  it('should return default version if multiple arrays of majorVersionSets', () => {
    const majorVersionSets = [
      {
        versionSetId: '1.0',
        buildIds: ['1.0', '1.1', '1.2'],
      },
      {
        versionSetId: '2.0',
        buildIds: ['2.0', '2.1', '2.2'],
      },
      {
        versionSetId: '3.0',
        buildIds: ['3.0', '3.1', '3.2'],
      },
    ];
    expect(getCurrentCompatibilityDefaultVersion({ majorVersionSets })).toBe(
      '3.2',
    );
  });
});

const getWorkflow = (mostRecentWorkerVersionStamp) =>
  toWorkflowExecution({
    executionConfig: {
      taskQueue: {
        name: 'hello-world',
        kind: 'Normal',
        normalName: '',
      },
      workflowExecutionTimeout: '0s',
      workflowRunTimeout: '0s',
      defaultWorkflowTaskTimeout: '10s',
    },
    workflowExecutionInfo: {
      execution: {
        workflowId: 'hello_world_workflowID',
        runId: '959f8c0a-3af8-4f4b-833a-55d5117cf3de',
      },
      type: {
        name: 'Workflow',
      },
      startTime: '2023-07-13T14:29:25.409300Z',
      closeTime: '2023-07-13T14:29:25.422152Z',
      status: 'Completed',
      historyLength: '11',
      parentNamespaceId: '',
      parentExecution: null,
      executionTime: '2023-07-13T14:29:25.409300Z',
      memo: {
        fields: {},
      },
      searchAttributes: {
        indexedFields: {
          BuildIds: {
            metadata: {
              encoding: 'anNvbi9wbGFpbg==',
              type: 'S2V5d29yZExpc3Q=',
            },
            data: 'WyJ1bnZlcnNpb25lZCIsInVudmVyc2lvbmVkOjAwZDY0ZTAyZTA2NWI1YTEyYmVkMTkyNjVkODZmZDA1Il0=',
          },
        },
      },
      autoResetPoints: {
        points: [
          {
            binaryChecksum: '00d64e02e065b5a12bed19265d86fd05',
            runId: '959f8c0a-3af8-4f4b-833a-55d5117cf3de',
            firstWorkflowTaskCompletedId: '4',
            createTime: '2023-07-13T14:29:25.416779Z',
            expireTime: null,
            resettable: true,
          },
        ],
      },
      taskQueue: 'hello-world',
      stateTransitionCount: '7',
      historySizeBytes: '1237',
      mostRecentWorkerVersionStamp: mostRecentWorkerVersionStamp,
    },
    pendingActivities: [],
    pendingChildren: [],
    pendingWorkflowTask: null,
  });

describe('getCurrentWorkflowBuildId', () => {
  it('should return undefined if no worker version stamp', () => {
    toWorkflowExecution;
    expect(getCurrentWorkflowBuildId(getWorkflow(undefined))).toBe(undefined);
  });

  it('should return undefined if not using versioning', () => {
    const mostRecentWorkerVersionStamp = {
      buildId: '00d64e02e065b5a12bed19265d86fd05',
      bundleId: '',
      useVersioning: false,
    };
    expect(
      getCurrentWorkflowBuildId(getWorkflow(mostRecentWorkerVersionStamp)),
    ).toBe(undefined);
  });

  it('should return undefined if not using versioning', () => {
    const mostRecentWorkerVersionStamp = {
      buildId: '3.5',
      bundleId: '',
      useVersioning: true,
    };
    expect(
      getCurrentWorkflowBuildId(getWorkflow(mostRecentWorkerVersionStamp)),
    ).toBe('3.5');
  });
});
