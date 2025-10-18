import { get } from 'svelte/store';

import type { Page } from '@sveltejs/kit';

import { authUser } from '$lib/stores/auth-user';
import { coreUserStore } from '$lib/stores/core-user';

import { canStartWorkflow } from './permissions';

export const workflowCreateDisabled = (
  page: Page,
  namespace?: string,
): boolean => {
  const coreUser = coreUserStore();
  const user = get(authUser);
  const namespaceWriteDisabled = get(coreUser).namespaceWriteDisabled(
    namespace ?? page.params.namespace,
  );
  if (page?.data?.settings?.disableWriteActions) return true;
  if (page?.data?.settings?.startWorkflowDisabled) return true;
  if (!canStartWorkflow(user)) return true;

  return namespaceWriteDisabled;
};
