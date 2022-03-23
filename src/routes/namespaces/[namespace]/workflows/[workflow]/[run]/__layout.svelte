<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  export const load: Load = async function ({ params, fetch }) {
    const url = routeForWorkflow({ ...params, endpoint: 'workflow.json' });
    const { workflow, namespace } = await fetch(url).then((r) => r.json())

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
