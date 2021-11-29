<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;

    return {
      props: {
        executionId,
        runId,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import Header from './_header.svelte';
  import { getWorkflow } from '$lib/stores/workflow';
  import { setContext } from 'svelte';

  export let executionId: string;
  export let runId: string;
  export let namespace: string;

  $: store = getWorkflow({ executionId, runId, namespace });
  $: workflow = $store.data;
  $: loading = $store.loading;

  setContext('workflow', store);
</script>

<section class="border-l-2 h-screen">
  <main class="w-full">
    <Header {workflow} {loading} />
    <slot />
  </main>
</section>
