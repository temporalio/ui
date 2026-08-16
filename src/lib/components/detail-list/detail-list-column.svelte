<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<div
  class="contents xl:col-span-2 xl:row-[span_var(--row-count)] xl:grid xl:grid-cols-subgrid xl:grid-rows-subgrid xl:[&:not(:first-child)]:ml-4"
>
  {@render children()}
</div>
