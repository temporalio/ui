<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  let {
    isCloud = false,
    children,
    fallback,
  }: { isCloud?: boolean; children?: Snippet; fallback?: Snippet } = $props();
</script>

{#if isCloud || page.data?.settings?.runtimeEnvironment?.isCloud}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
