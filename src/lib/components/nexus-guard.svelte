<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  interface Props {
    children: Snippet;
    fallback?: Snippet;
  }

  let { children, fallback }: Props = $props();
  let nexusEnabled = $derived(page.data?.systemInfo?.capabilities?.nexus);
</script>

{#if nexusEnabled}
  {@render children()}
{:else}
  {@render fallback?.()}
{/if}
