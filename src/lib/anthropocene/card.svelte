<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    children?: Snippet;
  };
  let { class: className = '', children }: Props = $props();
</script>

<div class="surface-primary border border-subtle p-4 {className}">
  {@render children?.()}
</div>
