<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    empty?: boolean;
    children?: Snippet;
  }

  let { empty = false, children }: Props = $props();
</script>

<tr
  data-testid="activities-summary-configurable-table-row"
  class:empty
  class="dense"
>
  {@render children?.()}
</tr>
