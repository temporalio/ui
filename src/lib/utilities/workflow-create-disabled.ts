import { get } from 'svelte/store';

import type { Page } from '@sveltejs/kit';

import { coreUserStore } from '$lib/stores/core-user';

export const workflowCreateDisabled = (
  page: Page,
  namespace?: string,
): boolean => {
  const coreUser = coreUserStore();
  const namespaceWriteDisabled = get(coreUser).namespaceWriteDisabled(
    namespace ?? page.params.namespace,
  );
  if (page?.data?.settings?.startWorkflowDisabled) return true;

  return namespaceWriteDisabled;
};
