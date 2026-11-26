<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  setContext<boolean>('group', true);

  let { children, class: className }: { children?: Snippet; class?: string } =
    $props();
</script>

<div class={merge('flex', className)} role="tablist">
  {@render children?.()}
</div>
