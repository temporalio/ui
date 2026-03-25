<script lang="ts">
  import type { Snippet } from 'svelte';

  import Card from '$lib/holocene/card.svelte';

  interface Props {
    title: string;
    content: string | number | undefined;
    fallbackContent?: string;
    description?: string;
    children?: Snippet;
  }

  let {
    title,
    content,
    description,
    fallbackContent = '-',
    children,
  }: Props = $props();
</script>

<Card class="flex flex-col gap-1">
  <h5 class="text-xs font-semibold uppercase tracking-wide">
    {title}
  </h5>
  <div class="flex items-center gap-2">
    <p class="text-3xl font-bold">
      {#if content}
        {content}
      {:else}
        {fallbackContent}
      {/if}
    </p>
    {@render children?.()}
  </div>
  {#if description}
    <span class="text-xs text-secondary">{description}</span>
  {/if}
</Card>
