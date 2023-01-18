<script lang="ts">
  import Copyable from '$lib/components/copyable.svelte';
  import Link from '$lib/holocene/link.svelte';

  export let title = '';
  export let content: string;
  export let copyable = false;
  export let href: string = null;
  export let textSize = 'md';
</script>

<p class="flex items-center gap-2 text-{textSize} whitespace-nowrap pt-2">
  {#if copyable}
    <Copyable {content} visible container-class="gap-1 w-full">
      {#if title}
        {title}:
      {/if}
      {#if href}
        <Link {href} class="truncate">{content}</Link>
      {:else}
        <span class="select-all truncate">{content}</span>
      {/if}
    </Copyable>
  {:else}
    {#if title}
      {title}:
    {/if}
    {#if href}
      <Link {href} class="truncate">{content}</Link>
    {:else}
      <span class="select-all truncate">{content}</span>
    {/if}
  {/if}
</p>
