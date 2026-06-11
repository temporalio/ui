<script lang="ts">
  import { viewedFeatureTags } from '$lib/stores/new-feature-tags';

  interface Props {
    feature: string;
    alpha?: boolean;
  }
  let { feature, alpha = true }: Props = $props();

  const show = $derived(!$viewedFeatureTags?.includes(feature));
</script>

{#if show}
  <span class="new-tag" class:alpha></span>
{/if}

<style lang="postcss">
  @reference "../../app.css";

  .new-tag {
    @apply absolute top-1 right-1 h-2 w-2 animate-pulse rounded-full bg-green-500;
  }

  .alpha {
    @apply bg-purple-300;
  }
</style>
