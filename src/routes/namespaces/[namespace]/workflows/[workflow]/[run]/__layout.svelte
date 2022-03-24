<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  export const load: Load = async function ({ url, params, fetch }) {
    const { searchParams } = url;
    const path = routeForWorkflow({
      namespace: params.namespace,
      workflow: params.workflow,
      run: params.run,
      endpoint: 'workflow.json',
      searchParams,
    });
    const { workflow, namespace } = await fetch(path).then((r) => r.json());

    return {
      props: { workflow, namespace },
      stuff: { workflow },
    };
  };
</script>

<script lang="ts">
  import Header from './_header.svelte';
  export let workflow: WorkflowExecution;
  export let namespace: string;
</script>

<main class="flex flex-col gap-6 h-full">
  <Header {namespace} {workflow} />
  <slot />
</main>
