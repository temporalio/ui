<script lang="ts">
  import type { HTMLTdAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props extends HTMLTdAttributes {
    class?: string;
    primary?: Snippet;
    secondary?: Snippet;
  }

  let { class: className = '', primary, secondary, ...rest }: Props = $props();
</script>

<td class={merge('py-2', className)} {...rest}>
  <div class="min-h-[1lh] truncate" data-testid="two-line-cell-primary">
    {@render primary?.()}
  </div>
  <div
    class="min-h-[1lh] truncate text-xs text-secondary"
    data-testid="two-line-cell-secondary"
  >
    {@render secondary?.()}
  </div>
</td>
