<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';

  import type { PageData } from './$types';

  import Loading from '$lib/holocene/loading.svelte';
  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
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
        goto(routeForWorkflows({ namespace: namespaceToRedirect }));
      } else {
        goto(routeForNamespaceSelector());
      }
    } catch {
      goto(routeForNamespaceSelector());
    }
  });
</script>

<Loading />
