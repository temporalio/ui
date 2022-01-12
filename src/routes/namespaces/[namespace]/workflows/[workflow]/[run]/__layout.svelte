<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { fetchWorkflow } from '$lib/services/workflow-service';

  export async function load({ page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;

    const parameters = {
      namespace,
      executionId,
      runId,
    };

    return {
      props: { parameters, namespace },
    };
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import { refreshable } from '$lib/stores/refreshable';

  import Header from './_header.svelte';

  export let parameters: Parameters<typeof fetchWorkflow>[0];
  export let namespace: string;

  let workflow = refreshable(() => fetchWorkflow(parameters));

  $: console.log($workflow);

  $: setContext('workflow', $workflow);
  $: setContext('workflow', workflow);
</script>

<main class="flex flex-col gap-4 h-full">
  <Header {namespace} />
  <slot />
</main>
