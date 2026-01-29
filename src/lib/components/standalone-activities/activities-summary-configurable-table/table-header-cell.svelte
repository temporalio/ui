<script lang="ts">
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';

  interface Props {
    column: ConfigurableTableHeader;
  }

  let { column }: Props = $props();

  const label = $derived(column.label);
</script>

<th data-testid="activities-summary-table-header-cell-{label}">
  {label}
</th>
