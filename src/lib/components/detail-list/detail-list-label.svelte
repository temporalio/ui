<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import Link from '$lib/holocene/link.svelte';

  interface Props {
    children: Snippet;
    class?: ClassNameValue;
    href?: string;
  }

  const { children, href, class: className = '' }: Props = $props();
</script>

<dd class={twMerge('col-[1]', className)}>
  {#if href}
    <Link {href} newTab>{@render children()}</Link>
  {:else}
    {@render children()}
  {/if}
</dd>
