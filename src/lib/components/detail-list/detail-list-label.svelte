<script lang="ts">
  import type { Snippet } from 'svelte';

  import Link from '$lib/holocene/link.svelte';

  interface Props {
    children: Snippet;
    href?: string;
  }

  const { children, href }: Props = $props();
</script>

<dd class="col-[1]">
  {#if href}
    <Link {href} newTab>{@render children()}</Link>
  {:else}
    {@render children()}
  {/if}
</dd>
