<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  import {
    routeForWorkflows,
    routeForNamespaceSelector,
  } from '$lib/utilities/route-for';

  export const load: Load = async ({ stuff }) => {
    const defaultNamespace = stuff?.settings?.defaultNamespace;
    const isCloud = stuff.settings.runtimeEnvironment?.isCloud;

    if (isCloud) {
      return {
        status: 302,
        redirect: routeForWorkflows({
          namespace: defaultNamespace,
        }),
      };
    }

    return {
      props: { defaultNamespace },
    };
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import { fetchWorkflowForAuthorization } from '$lib/services/workflow-service';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import Loading from '$lib/holocene/loading.svelte';

  export let defaultNamespace: string;

  const namespaceToRedirect =
    $lastUsedNamespace && $lastUsedNamespace !== 'default'
      ? $lastUsedNamespace
      : defaultNamespace;

  onMount(async () => {
    try {
      const { authorized } = await fetchWorkflowForAuthorization(
        namespaceToRedirect,
      );
      if (authorized) {
        goto(routeForWorkflows({ namespace: namespaceToRedirect }));
      } else {
        goto(routeForNamespaceSelector());
      }
    } catch (e) {
      goto(routeForNamespaceSelector());
    }
  });
</script>

<Loading />
