<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    title?: string;
    class?: string;
    subtitle?: Snippet;
    children?: Snippet;
  }

  let {
    title = '',
    class: className = '',
    subtitle,
    children,
  }: Props = $props();

  const position: 'bottom' | 'right' = getContext('drawer-pos');

  const hasHeader = $derived(Boolean(title) || Boolean(subtitle));
</script>

{#if hasHeader}
  <div class="title-wrapper {position}">
    {#if title}
      <h2>{title}</h2>
    {/if}
    {#if subtitle}
      <p class="text-xs font-normal">
        {@render subtitle()}
      </p>
    {/if}
  </div>
{/if}

<div class={twMerge('content', position, !hasHeader && 'pt-4', className)}>
  {@render children?.()}
</div>

<style lang="postcss">
  .title-wrapper {
    @apply flex flex-col justify-center gap-1 border-b border-subtle px-4 py-3;

    &.bottom {
      @apply items-start;
    }

    &.right {
      @apply items-start;
    }
  }

  .content {
    @apply whitespace-normal px-4 pb-4 pt-3;
  }
</style>
