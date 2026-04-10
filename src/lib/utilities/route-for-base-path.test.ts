import { afterEach, describe, expect, it } from 'vitest';

import { base } from '$app/paths';

import { routePrefix } from '$lib/stores/route-prefix';

import * as routeForModule from './route-for';
import {
  routeForArchivalEventHistory,
  routeForArchivalWorkflows,
  routeForAuthentication,
  routeForBatchOperation,
  routeForBatchOperations,
  routeForCallStack,
  routeForEventHistory,
  routeForEventHistoryEvent,
  routeForEventHistoryImport,
  routeForLoginPage,
  routeForNamespace,
  routeForNamespaces,
  routeForNamespaceSelector,
  routeForNexus,
  routeForNexusEndpoint,
  routeForNexusEndpointCreate,
  routeForNexusEndpointEdit,
  routeForNexusLinks,
  routeForPendingActivities,
  routeForRelationships,
  routeForSchedule,
  routeForScheduleCreate,
  routeForScheduleEdit,
  routeForSchedules,
  routeForStandaloneActivities,
  routeForStandaloneActivitiesWithQuery,
  routeForStandaloneActivityDetails,
  routeForStandaloneActivityMetadata,
  routeForStandaloneActivitySearchAttributes,
  routeForStandaloneActivityWorkers,
  routeForStartStandaloneActivity,
  routeForTaskQueue,
  routeForTimeline,
  routeForUserMetadata,
  routeForWorkerDeployment,
  routeForWorkerDeploymentCreate,
  routeForWorkerDeployments,
  routeForWorkerDeploymentVersion,
  routeForWorkerDeploymentVersionCreate,
  routeForWorkerDeploymentVersionEdit,
  routeForWorkerInstance,
  routeForWorkers,
  routeForWorkersWithQuery,
  routeForWorkflow,
  routeForWorkflowMemo,
  routeForWorkflowQuery,
  routeForWorkflows,
  routeForWorkflowSearchAttributes,
  routeForWorkflowStart,
  routeForWorkflowsWithQuery,
  routeForWorkflowUpdate,
  routeForWorkflowWorkers,
} from './route-for';

describe('routeFor functions should resolve the base path exactly once', () => {
  const namespaceParams = { namespace: 'default' };
  const workflowParams = {
    namespace: 'default',
    workflow: 'wf-id',
    run: 'run-id',
  };
  const scheduleParams = { namespace: 'default', scheduleId: 'sched-1' };

  const activityParams = {
    namespace: 'default',
    activityId: 'act-1',
    runId: 'run-1',
  };

  const cases: [string, () => string | undefined][] = [
    ['routeForNamespaces', () => routeForNamespaces()],
    ['routeForNexus', () => routeForNexus()],
    ['routeForNexusEndpoint', () => routeForNexusEndpoint('ep-1')],
    ['routeForNexusEndpointEdit', () => routeForNexusEndpointEdit('ep-1')],
    ['routeForNexusEndpointCreate', () => routeForNexusEndpointCreate()],
    ['routeForNamespace', () => routeForNamespace(namespaceParams)],
    ['routeForNamespaceSelector', () => routeForNamespaceSelector()],
    ['routeForWorkflows', () => routeForWorkflows(namespaceParams)],
    [
      'routeForArchivalWorkflows',
      () => routeForArchivalWorkflows(namespaceParams),
    ],
    ['routeForWorkflow', () => routeForWorkflow(workflowParams)],
    ['routeForSchedules', () => routeForSchedules(namespaceParams)],
    ['routeForScheduleCreate', () => routeForScheduleCreate(namespaceParams)],
    ['routeForSchedule', () => routeForSchedule(scheduleParams)],
    ['routeForScheduleEdit', () => routeForScheduleEdit(scheduleParams)],
    [
      'routeForArchivalEventHistory',
      () => routeForArchivalEventHistory(workflowParams),
    ],
    [
      'routeForEventHistoryEvent',
      () => routeForEventHistoryEvent({ ...workflowParams, eventId: '1' }),
    ],
    ['routeForEventHistory', () => routeForEventHistory(workflowParams)],
    ['routeForTimeline', () => routeForTimeline(workflowParams)],
    ['routeForWorkers', () => routeForWorkers(namespaceParams)],
    [
      'routeForWorkerDeployments',
      () => routeForWorkerDeployments(namespaceParams),
    ],
    [
      'routeForWorkerDeployment',
      () =>
        routeForWorkerDeployment({
          namespace: 'default',
          deployment: 'dep-1',
        }),
    ],
    [
      'routeForWorkerDeploymentVersion',
      () =>
        routeForWorkerDeploymentVersion({
          namespace: 'default',
          deployment: 'dep-1',
          version: 'v1',
        }),
    ],
    ['routeForRelationships', () => routeForRelationships(workflowParams)],
    [
      'routeForTaskQueue',
      () => routeForTaskQueue({ namespace: 'default', queue: 'q-1' }),
    ],
    ['routeForCallStack', () => routeForCallStack(workflowParams)],
    ['routeForWorkflowQuery', () => routeForWorkflowQuery(workflowParams)],
    ['routeForUserMetadata', () => routeForUserMetadata(workflowParams)],
    [
      'routeForWorkflowSearchAttributes',
      () => routeForWorkflowSearchAttributes(workflowParams),
    ],
    ['routeForWorkflowMemo', () => routeForWorkflowMemo(workflowParams)],
    ['routeForWorkflowUpdate', () => routeForWorkflowUpdate(workflowParams)],
    [
      'routeForPendingActivities',
      () => routeForPendingActivities(workflowParams),
    ],
    ['routeForNexusLinks', () => routeForNexusLinks(workflowParams)],
    ['routeForEventHistoryImport', () => routeForEventHistoryImport()],
    ['routeForBatchOperations', () => routeForBatchOperations(namespaceParams)],
    [
      'routeForBatchOperation',
      () => routeForBatchOperation({ namespace: 'default', jobId: 'job-1' }),
    ],
    [
      'routeForStandaloneActivities',
      () => routeForStandaloneActivities(namespaceParams),
    ],
    [
      'routeForStandaloneActivitiesWithQuery',
      () =>
        routeForStandaloneActivitiesWithQuery(namespaceParams, 'test-query'),
    ],
    [
      'routeForStartStandaloneActivity',
      () => routeForStartStandaloneActivity(namespaceParams),
    ],
    [
      'routeForStandaloneActivityDetails',
      () => routeForStandaloneActivityDetails(activityParams),
    ],
    [
      'routeForStandaloneActivityWorkers',
      () => routeForStandaloneActivityWorkers(activityParams),
    ],
    [
      'routeForStandaloneActivitySearchAttributes',
      () => routeForStandaloneActivitySearchAttributes(activityParams),
    ],
    [
      'routeForStandaloneActivityMetadata',
      () => routeForStandaloneActivityMetadata(activityParams),
    ],
    [
      'routeForWorkflowStart',
      () => routeForWorkflowStart({ namespace: 'default' }),
    ],
    [
      'routeForWorkflowsWithQuery',
      () => routeForWorkflowsWithQuery({ namespace: 'default', query: 'test' }),
    ],
    [
      'routeForAuthentication',
      () =>
        routeForAuthentication({
          settings: { auth: {}, baseUrl: 'https://example.com' },
          searchParams: new URLSearchParams(),
        }),
    ],
    ['routeForLoginPage', () => routeForLoginPage('', false)],
    ['routeForWorkflowWorkers', () => routeForWorkflowWorkers(workflowParams)],
    [
      'routeForWorkerInstance',
      () =>
        routeForWorkerInstance({
          namespace: 'default',
          workerInstanceKey: 'worker-1',
        }),
    ],
    [
      'routeForWorkersWithQuery',
      () => routeForWorkersWithQuery({ namespace: 'default', query: 'test' }),
    ],
    [
      'routeForWorkerDeploymentCreate',
      () => routeForWorkerDeploymentCreate(namespaceParams),
    ],
    [
      'routeForWorkerDeploymentVersionCreate',
      () =>
        routeForWorkerDeploymentVersionCreate({
          namespace: 'default',
          deployment: 'test-deployment',
        }),
    ],
    [
      'routeForWorkerDeploymentVersionEdit',
      () =>
        routeForWorkerDeploymentVersionEdit({
          namespace: 'default',
          deployment: 'test-deployment',
          buildId: 'v1',
        }),
    ],
  ];

  it.each(cases)('%s should resolve the base path', (_name, fn) => {
    const result = fn();
    expect(typeof result).toBe('string');
    expect(result?.length).toBeGreaterThan(0);
    expect(result).toMatch(new RegExp(`${base}`));
    expect(result).not.toMatch(new RegExp(`${base}${base}`));
  });

  it('should have a test case for every exported routeFor function', () => {
    const testedNames = new Set(cases.map(([name]) => name));
    const exportedRouteForFunctions = Object.keys(routeForModule).filter(
      (key) =>
        key.startsWith('routeFor') &&
        typeof routeForModule[key as keyof typeof routeForModule] ===
          'function',
    );

    const missing = exportedRouteForFunctions.filter(
      (name) => !testedNames.has(name),
    );
    if (missing.length > 0) {
      throw new Error(
        `Missing base path test cases for: ${missing.join(', ')}. Add them to the cases array above.`,
      );
    }
  });
});

describe('routeFor functions with prefix should resolve base + prefix correctly', () => {
  const prefix = '/projects/my-project';

  const namespaceParams = { namespace: 'default' };
  const workflowParams = {
    namespace: 'default',
    workflow: 'wf-id',
    run: 'run-id',
  };
  const scheduleParams = { namespace: 'default', scheduleId: 'sched-1' };
  const activityParams = {
    namespace: 'default',
    activityId: 'act-1',
    runId: 'run-1',
  };

  afterEach(() => {
    routePrefix.set('');
  });

  const prefixedCases: [string, () => string | undefined][] = [
    ['routeForNamespaces', () => routeForNamespaces()],
    ['routeForNexus', () => routeForNexus()],
    ['routeForNexusEndpoint', () => routeForNexusEndpoint('ep-1')],
    ['routeForNexusEndpointEdit', () => routeForNexusEndpointEdit('ep-1')],
    ['routeForNexusEndpointCreate', () => routeForNexusEndpointCreate()],
    ['routeForNamespace', () => routeForNamespace(namespaceParams)],
    ['routeForNamespaceSelector', () => routeForNamespaceSelector()],
    ['routeForWorkflows', () => routeForWorkflows(namespaceParams)],
    [
      'routeForArchivalWorkflows',
      () => routeForArchivalWorkflows(namespaceParams),
    ],
    ['routeForWorkflow', () => routeForWorkflow(workflowParams)],
    ['routeForSchedules', () => routeForSchedules(namespaceParams)],
    ['routeForScheduleCreate', () => routeForScheduleCreate(namespaceParams)],
    ['routeForSchedule', () => routeForSchedule(scheduleParams)],
    ['routeForScheduleEdit', () => routeForScheduleEdit(scheduleParams)],
    [
      'routeForArchivalEventHistory',
      () => routeForArchivalEventHistory(workflowParams),
    ],
    [
      'routeForEventHistoryEvent',
      () => routeForEventHistoryEvent({ ...workflowParams, eventId: '1' }),
    ],
    ['routeForEventHistory', () => routeForEventHistory(workflowParams)],
    ['routeForTimeline', () => routeForTimeline(workflowParams)],
    ['routeForWorkers', () => routeForWorkers(workflowParams)],
    [
      'routeForWorkerDeployments',
      () => routeForWorkerDeployments(namespaceParams),
    ],
    [
      'routeForWorkerDeployment',
      () =>
        routeForWorkerDeployment({
          namespace: 'default',
          deployment: 'dep-1',
        }),
    ],
    [
      'routeForWorkerDeploymentVersion',
      () =>
        routeForWorkerDeploymentVersion({
          namespace: 'default',
          deployment: 'dep-1',
          version: 'v1',
        }),
    ],
    ['routeForRelationships', () => routeForRelationships(workflowParams)],
    [
      'routeForTaskQueue',
      () => routeForTaskQueue({ namespace: 'default', queue: 'q-1' }),
    ],
    ['routeForCallStack', () => routeForCallStack(workflowParams)],
    ['routeForWorkflowQuery', () => routeForWorkflowQuery(workflowParams)],
    ['routeForUserMetadata', () => routeForUserMetadata(workflowParams)],
    [
      'routeForWorkflowSearchAttributes',
      () => routeForWorkflowSearchAttributes(workflowParams),
    ],
    ['routeForWorkflowMemo', () => routeForWorkflowMemo(workflowParams)],
    ['routeForWorkflowUpdate', () => routeForWorkflowUpdate(workflowParams)],
    [
      'routeForPendingActivities',
      () => routeForPendingActivities(workflowParams),
    ],
    ['routeForNexusLinks', () => routeForNexusLinks(workflowParams)],
    ['routeForEventHistoryImport', () => routeForEventHistoryImport()],
    ['routeForBatchOperations', () => routeForBatchOperations(namespaceParams)],
    [
      'routeForBatchOperation',
      () => routeForBatchOperation({ namespace: 'default', jobId: 'job-1' }),
    ],
    [
      'routeForStandaloneActivities',
      () => routeForStandaloneActivities(namespaceParams),
    ],
    [
      'routeForStandaloneActivitiesWithQuery',
      () =>
        routeForStandaloneActivitiesWithQuery(namespaceParams, 'test-query'),
    ],
    [
      'routeForStartStandaloneActivity',
      () => routeForStartStandaloneActivity(namespaceParams),
    ],
    [
      'routeForStandaloneActivityDetails',
      () => routeForStandaloneActivityDetails(activityParams),
    ],
    [
      'routeForStandaloneActivityWorkers',
      () => routeForStandaloneActivityWorkers(activityParams),
    ],
    [
      'routeForStandaloneActivitySearchAttributes',
      () => routeForStandaloneActivitySearchAttributes(activityParams),
    ],
    [
      'routeForStandaloneActivityMetadata',
      () => routeForStandaloneActivityMetadata(activityParams),
    ],
    [
      'routeForWorkflowStart',
      () => routeForWorkflowStart({ namespace: 'default' }),
    ],
    [
      'routeForWorkflowsWithQuery',
      () => routeForWorkflowsWithQuery({ namespace: 'default', query: 'test' }),
    ],
  ];

  const authCases: [string, () => string | undefined][] = [
    [
      'routeForAuthentication',
      () =>
        routeForAuthentication({
          settings: { auth: {}, baseUrl: 'https://example.com' },
          searchParams: new URLSearchParams(),
        }),
    ],
    ['routeForLoginPage', () => routeForLoginPage('', false)],
  ];

  it.each(prefixedCases)(
    '%s should include base + prefix when prefix is set',
    (_name, fn) => {
      routePrefix.set(prefix);
      const result = fn();
      expect(typeof result).toBe('string');
      expect(result).toMatch(new RegExp(`^${base}${prefix}`));
      expect(result).not.toMatch(
        new RegExp(`${base}${prefix}${base}${prefix}`),
      );
    },
  );

  it.each(authCases)(
    '%s should NOT include prefix (auth routes excluded)',
    (_name, fn) => {
      routePrefix.set(prefix);
      const result = fn();
      expect(typeof result).toBe('string');
      expect(result).not.toContain(prefix);
    },
  );
});
