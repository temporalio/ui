<script lang="ts">
  import { getContext } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  export let title: string = '';

  let position: 'bottom' | 'right' = getContext('drawer-pos');

  $: hasHeader = Boolean(title) || $$slots['subtitle'];
</script>

{#if hasHeader}
  <div class="title-wrapper {position}">
    {#if title}
      <h2>{title}</h2>
    {/if}
    {#if $$slots['subtitle']}
      <p class="text-xs font-normal">
        <slot name="subtitle" />
      </p>
    {/if}
  </div>
{/if}

<div class={twMerge('content', position, !hasHeader && 'pt-6', $$props.class)}>
  <slot />
</div>

<style lang="postcss">
  .title-wrapper {
    @apply flex flex-col justify-center gap-2 p-6;

    &.bottom {
      @apply items-start;
    }

    &.right {
      @apply items-start;
    }
  }

  .content {
    @apply whitespace-normal px-6 pb-6;
  }
</style>
