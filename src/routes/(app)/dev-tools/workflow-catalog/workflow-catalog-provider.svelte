<script lang="ts">
  import { onDestroy, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import { coreUserStore } from '$lib/stores/core-user';
  import { getIdentity } from '$lib/utilities/core-context';
  import { createWorkflowCatalogSessionStore } from '$lib/workflow-catalog/browser/session-store';
  import { workflowCatalogStartAllowed } from '$lib/workflow-catalog/browser/workbench-host';
  import { createOssUiWorkbenchHost } from '$lib/workflow-catalog/oss/ui-services';

  import { routeWorkflowCatalog } from './catalog';
  import { setWorkflowCatalogContext } from './context';

  let { children }: { children: Snippet } = $props();

  const coreUser = coreUserStore();
  const workflowStartsDisabled = () =>
    (page.data?.settings as { startWorkflowDisabled?: boolean } | undefined)
      ?.startWorkflowDisabled ?? false;
  const host = createOssUiWorkbenchHost({
    descriptors: routeWorkflowCatalog,
    getIdentity,
  });
  const sessionStore = createWorkflowCatalogSessionStore(host, {
    startAllowed: (descriptor) =>
      workflowCatalogStartAllowed(descriptor, {
        disableWriteActions: page.data?.settings?.disableWriteActions ?? false,
        workflowStartsDisabled: workflowStartsDisabled(),
        namespaceWriteDisabled: $coreUser.namespaceWriteDisabled,
      }),
  });

  setWorkflowCatalogContext({ host, sessionStore });

  onDestroy(() => sessionStore.dispose());
</script>

{@render children()}
