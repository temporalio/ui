<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  interface Props {
    class?: ClassNameValue;
    children?: Snippet;
  }

  let { class: className = '', children }: Props = $props();
</script>

<div class={twMerge('flex flex-col', className)}>
  {@render children?.()}
</div>
