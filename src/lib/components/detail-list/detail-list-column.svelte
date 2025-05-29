<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

<div
  class="contents lg:col-span-2 lg:row-[span_var(--row-count)] lg:grid lg:grid-cols-subgrid lg:grid-rows-subgrid [&:not(:first-child)]:ml-8"
>
  {@render children()}
</div>
