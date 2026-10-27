<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<div
  class="contents xl:col-span-2 xl:grid xl:grid-cols-subgrid xl:grid-rows-subgrid [&:not(:first-child)]:ml-8 max-md:[&:not(:first-child)>dt:first-child]:mt-2"
  style:grid-row="span var(--row-count)"
>
  {@render children()}
</div>
