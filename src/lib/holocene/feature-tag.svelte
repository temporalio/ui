<script lang="ts">
  import { viewedFeatureTags } from '$lib/stores/new-feature-tags';

  interface Props {
    feature: string;
  }
  let { feature }: Props = $props();

  const show = $derived(!$viewedFeatureTags?.includes(feature));
</script>

{#if show}
  <span
    class="absolute right-1 top-1 h-2 w-2 rounded-full bg-success motion-safe:animate-pulse"
  ></span>
{/if}
