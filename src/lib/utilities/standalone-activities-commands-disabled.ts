import { get } from 'svelte/store';

import type { Page } from '@sveltejs/kit';

import { coreUserStore } from '$lib/stores/core-user';

import { activityCommandsEnabled } from './activity-commands-enabled';

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
  const coreUser = coreUserStore();
  return !activityCommandsEnabled(
    page?.data?.settings,
    get(coreUser),
    namespace ?? page.params.namespace,
  );
};
