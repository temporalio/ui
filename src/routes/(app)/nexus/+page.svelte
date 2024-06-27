<script lang="ts">
  import NexusEndpoints from '$lib/pages/nexus-endpoints.svelte';

  import type { PageData } from '../$types';

  export let data: PageData;

  $: ({ endpoints } = data);
</script>

<div class:empty={!endpoints?.length}>
  <NexusEndpoints {endpoints} />
</div>

<style lang="postcss">
  .empty {
    @apply absolute left-0 right-0 top-12;
  }
</style>
