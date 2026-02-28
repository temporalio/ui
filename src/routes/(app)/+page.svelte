<script lang="ts">
  import { onMount } from 'svelte';

  import type { PageData } from './$types';

  import Loading from '$lib/holocene/loading.svelte';
  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { gotoResolved } from '$lib/utilities/goto-resolved';
  import {
    routeForNamespaceSelector,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  export let data: PageData;

  let { defaultNamespace } = data;

  const namespaceToRedirect =
    $lastUsedNamespace && $lastUsedNamespace !== 'default'
      ? $lastUsedNamespace
      : defaultNamespace;

  onMount(async () => {
    try {
      const { authorized } =
        await fetchWorkflowForAuthorization(namespaceToRedirect);
      if (authorized) {
        gotoResolved(routeForWorkflows({ namespace: namespaceToRedirect }));
      } else {
        gotoResolved(routeForNamespaceSelector());
      }
    } catch {
      gotoResolved(routeForNamespaceSelector());
    }
  });
</script>

<Loading />
