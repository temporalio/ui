<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import type { Capabilities } from '$lib/types';

  interface Props {
    capability: keyof Capabilities;
    children: Snippet;
    fallback?: Snippet;
  }

  let { capability, children, fallback }: Props = $props();

  const enabled = $derived(
    Boolean(page.data?.systemInfo?.capabilities?.[capability]),
  );
</script>

{#if enabled}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
