<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  interface Props {
    step: number;
    title: string;
    last?: boolean;
    class?: ClassNameValue;
    children?: Snippet;
  }

  let {
    step,
    title,
    last = false,
    class: className = '',
    children,
  }: Props = $props();
</script>

<div class={twMerge('flex gap-3', className)}>
  <div class="flex flex-col items-center">
    <div
      class="bg-interactive flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
    >
      {step}
    </div>
    {#if !last}
      <div class="bg-interactive/30 mt-1 w-px flex-1"></div>
    {/if}
  </div>
  <div class="flex-1 pb-6" class:pb-0={last}>
    <h4 class="text-base font-medium">{title}</h4>
    {@render children?.()}
  </div>
</div>
