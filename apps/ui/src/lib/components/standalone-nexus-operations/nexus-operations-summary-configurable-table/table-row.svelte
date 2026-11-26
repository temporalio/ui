<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { NexusOperationExecutionListInfo } from '$lib/types/nexus-operation-execution';

  interface Props {
    operation?: NexusOperationExecutionListInfo;
    empty?: boolean;
    children?: Snippet;
  }

  let { operation: _operation, empty = false, children }: Props = $props();
</script>

<tr
  data-testid="nexus-operations-summary-configurable-table-row"
  class:empty
  class="dense"
>
  <td></td>
  {@render children?.()}
</tr>
