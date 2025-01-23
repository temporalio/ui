<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="*:border-t-0 [&>*:first-child]:border-t">
  {@render children()}
</div>
