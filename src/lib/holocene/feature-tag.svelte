<script lang="ts">
  import { viewedFeatureTags } from '$lib/stores/new-feature-tags';

  export let feature: string;
  export let alpha = false;

  $: hide = $viewedFeatureTags?.includes(feature);
</script>

{#if hide}
  <slot />
{:else}
  <span class="new-tag" class:alpha></span>
{/if}

<style lang="postcss">
  @reference "tailwindcss";

  .new-tag {
    @apply absolute top-1 right-1 h-2 w-2 animate-pulse rounded-full bg-green-500;
  }

  .alpha {
    @apply bg-purple-300;
  }
</style>
