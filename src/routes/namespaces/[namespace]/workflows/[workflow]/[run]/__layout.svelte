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
  import { fly } from 'svelte/transition';
  import { isFullScreen } from '$lib/stores/full-screen';

  import Header from './_header.svelte';
  import { getWorkflow } from '$lib/stores/workflow';

  export let executionId: string;
  export let runId: string;
  export let namespace: string;

  let store = getWorkflow({ executionId, runId, namespace });
  $: workflow = $store.data;
  $: loading = $store.loading;
</script>

<section
  class="border-l-2 h-screen"
  class:full={$isFullScreen}
  class:sidebar={!$isFullScreen}
  in:fly={{ x: 500, duration: 350 }}
  out:fly={{ x: 500 }}
>
  <main class="w-full">
    <Header {workflow} {loading} />
    <slot />
  </main>
</section>

<style type="postcss">
  .full {
    @apply w-full;
  }

  .sidebar {
    background-color: white;
    width: 600px;
    left: calc(100% - 600px);
    position: absolute;
    overflow-y: scroll;
    box-shadow: -2px 14px 20px 0px rgb(0 0 0 / 20%);
    z-index: 2;
  }
</style>
