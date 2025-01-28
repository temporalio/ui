<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    width?: number;
    height?: number;
    class?: string;
    children?: Snippet;
  }

  let {
    title = '',
    width = 16,
    height = 16,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
</script>

<svg
  {width}
  {height}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={className}
  role="img"
  aria-hidden={!title}
  {...rest}
>
  <title>{title}</title>
  {@render children?.()}
</svg>
