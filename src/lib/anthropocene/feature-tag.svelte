<script lang="ts">
  import { viewedFeatureTags } from '$lib/stores/new-feature-tags';

  interface Props {
    feature: string;
    alpha?: boolean;
    children?: import('svelte').Snippet;
  }

  let { feature, alpha = false, children }: Props = $props();

  const hide = $derived($viewedFeatureTags?.includes(feature));
</script>

{#if hide}
  {#if children}{@render children()}{/if}
{:else}
  <span class="new-tag" class:alpha></span>
{/if}

<style lang="postcss">
  .new-tag {
    @apply absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-green-500;
  }

  .alpha {
    @apply bg-purple-300;
  }
</style>
