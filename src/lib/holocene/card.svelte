<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: className = '', children }: Props = $props();
</script>

<div class="card surface-primary {className}">
  {@render children?.()}
</div>

<style lang="postcss">
  .card {
    @apply border border-subtle p-4;
  }
</style>
