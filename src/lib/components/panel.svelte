<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    error?: boolean;
    class?: string;
    children?: Snippet;
  }

  let { error = false, class: className = '', children }: Props = $props();
</script>

<div class="panel surface-primary {className}" class:error>
  {@render children?.()}
</div>

<style lang="postcss">
  .panel {
    @apply border p-8 dark:border-subtle;

    &.error {
      @apply border-danger bg-danger;
    }
  }
</style>
