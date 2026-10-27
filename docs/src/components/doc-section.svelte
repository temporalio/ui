<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  let {
    id,
    title,
    description,
    children,
    class: className,
  }: {
    id: string;
    title: string;
    description?: string;
    children: Snippet;
    class?: string;
  } = $props();
</script>

<section
  {id}
  class={twMerge('mt-12 scroll-mt-6', className)}
  aria-labelledby="{id}-title"
>
  <h2 id="{id}-title" class="mb-5 text-xl font-medium">{title}</h2>
  {#if description}<p class="-mt-3 mb-5 text-sm text-secondary">
      {description}
    </p>{/if}
  {@render children()}
</section>
