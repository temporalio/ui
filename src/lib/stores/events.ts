import { derived, writable, type Readable } from 'svelte/store';

import { page } from '$app/stores';

import type {
  FetchEventsParameters,
  FetchEventsParametersWithSettings,
} from '$lib/services/events-service';

import { eventFilterSort } from './event-view';
import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
import { refresh } from '$lib/stores/workflow-run';
import { authUser } from '$lib/stores/auth-user';

const namespace = derived([page], ([$page]) => {
  if ($page.params.namespace) {
    return decodeURIForSvelte($page.params.namespace);
  }
  return '';
});

const workflowId = derived([page], ([$page]) => {
  if ($page.params.workflow) {
    return decodeURIForSvelte($page.params.workflow);
  }
  return '';
});

const runId = derived([page], ([$page]) => {
  if ($page.params.run) {
    return decodeURIForSvelte($page.params.run);
  }
  return '';
});

const settings = derived([page], ([$page]) => $page.data?.settings);

const accessToken = derived(
  [authUser],
  ([$authUser]) => $authUser?.accessToken,
);

export const parameters: Readable<FetchEventsParameters> = derived(
  [namespace, workflowId, runId, eventFilterSort],
  ([$namespace, $workflowId, $runId, $sort]) => {
    return {
      namespace: $namespace,
      workflowId: $workflowId,
      runId: $runId,
      sort: $sort,
    };
  },
);

export const parametersWithSettings: Readable<FetchEventsParametersWithSettings> =
  derived(
    [parameters, settings, accessToken, refresh],
    ([$parameters, $settings, $accessToken, $refresh]) => {
      return {
        ...$parameters,
        settings: $settings,
        accessToken: $accessToken,
        refresh,
        $refresh,
      };
    },
  );

export type StartAndEndEventHistory = {
  start: WorkflowEvents;
  end: WorkflowEvents;
};

export const eventHistory = writable<StartAndEndEventHistory>({
  start: [],
  end: [],
});

export const timelineEvents = writable(null);
