<script lang="ts">
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';

  export let column: ConfigurableTableHeader;

  $: ({ label } = column);
</script>

<th data-testid="activities-summary-table-header-cell-{label}">
  {label}
</th>
