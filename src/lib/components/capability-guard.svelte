<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { Capabilities } from '$lib/types';
  import { hasCapability } from '$lib/utilities/has-capability.svelte';

  interface Props {
    capability: keyof Capabilities;
    children: Snippet;
    fallback?: Snippet;
  }

  let { capability, children, fallback }: Props = $props();

  const enabled = $derived(hasCapability(capability));
</script>

{#if enabled}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
