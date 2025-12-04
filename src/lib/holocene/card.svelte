<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  type Props = {
    class?: ClassNameValue;
    children?: Snippet;
  };
  let { class: className = '', children }: Props = $props();
</script>

<div class={twMerge('surface-primary border border-subtle p-4', className)}>
  {@render children?.()}
</div>
