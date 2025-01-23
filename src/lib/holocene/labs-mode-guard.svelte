<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/stores';

  import { labsMode } from '$lib/stores/labs-mode';

  interface Props {
    children?: Snippet;
    fallback?: Snippet;
  }

  let { children, fallback }: Props = $props();
  let labsModeParamOn = $derived($page.url.searchParams.get('labs') === 'true');
  let labsModeParamOff = $derived(
    $page.url.searchParams.get('labs') === 'false',
  );

  $effect(() => {
    if (labsModeParamOn) {
      $labsMode = true;
    } else if (labsModeParamOff) {
      $labsMode = false;
    }
  });
</script>

{#if $labsMode}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
