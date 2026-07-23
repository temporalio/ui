import { get } from 'svelte/store';

import type { Page } from '@sveltejs/kit';

import { coreUserStore } from '$lib/stores/core-user';

import { activityCommandsEnabled } from './activity-commands-enabled';
import { getStandaloneActivitiesGaEnabled } from './core-provider';
import { minimumVersionRequired } from './version-check';

export const standaloneActivityWriteActionsDisabled = (
  page: Page,
  namespace?: string,
): boolean => {
  if (page?.data?.settings?.disableWriteActions) return true;

  const coreUser = coreUserStore();
  const namespaceWriteDisabled = get(coreUser).namespaceWriteDisabled(
    namespace ?? page.params.namespace,
  );
  return namespaceWriteDisabled;
};

export const standaloneActivityCommandsDisabled = (
  page: Page,
  namespace?: string,
): boolean => {
  if (!getStandaloneActivitiesGaEnabled()) return true;

  const version = page.data?.cluster?.serverVersion;
  if (version && !minimumVersionRequired('1.32.0', version)) return true;

  const coreUser = coreUserStore();
  return !activityCommandsEnabled(
    page?.data?.settings,
    get(coreUser),
    namespace ?? page.params.namespace,
  );
};

export const standaloneActivityBulkActionsEnabled = (
  page: Page,
  namespace?: string,
): boolean => {
  const capabilities = page?.data?.namespace?.namespaceInfo?.capabilities;
  if (!capabilities?.standaloneActivityBatchOperations) return false;
  if (page?.data?.settings?.batchActionsDisabled) return false;
  if (standaloneActivityWriteActionsDisabled(page, namespace)) return false;

  return true;
};
