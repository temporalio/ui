<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    maxRows?: number; // subgrid cannot create implicit rows, so make more rows than needed
    'aria-label': string;
  }
  let { children, 'aria-label': ariaLabel, maxRows = 10 }: Props = $props();
</script>

<dl
  class="grid grid-cols-[repeat(auto-fit,_minmax(0px,_max-content)_minmax(0px,_max-content))] items-center gap-x-12"
  aria-label={ariaLabel}
  style={`grid-template-rows: repeat(${maxRows}, auto);`}
>
  {@render children()}
</dl>
