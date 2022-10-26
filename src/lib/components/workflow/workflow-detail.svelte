<script lang="ts">
  import Copyable from '$lib/components/copyable.svelte';
  import Link from '$lib/holocene/link.svelte';

  export let title: string;
  export let content: string;
  export let href: string = null;
  export let textSize = 'md';
</script>

<article class="flex gap-2 text-{textSize}" data-cy={$$props['data-cy']}>
  <div class="font-medium">{title}:</div>
  <div>
    {#if href}
      <Copyable {content}>
        <Link {href}>{content}</Link>
      </Copyable>
    {:else}
      <div class="select-all">{content}</div>
    {/if}
  </div>
</article>
