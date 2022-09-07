<script>import Copyable from '../copyable.svelte';
import Link from '../../holocene/link.svelte';
export let title;
export let content;
export let href = null;
export let textSize = 'md';
</script>

<article class="flex gap-2 text-{textSize}">
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
