import { get } from 'svelte/store';

import type { Page } from '@sveltejs/kit';

import { coreUserStore } from '$lib/stores/core-user';

import { activityCommandsEnabled } from './activity-commands-enabled';
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
  const version = page.data?.cluster?.serverVersion;
  if (version && !minimumVersionRequired('1.31.2', version)) return true;

  const coreUser = coreUserStore();
  return !activityCommandsEnabled(
    page?.data?.settings,
    get(coreUser),
    namespace ?? page.params.namespace,
  );
};
