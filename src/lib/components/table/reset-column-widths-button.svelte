<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconRetry } from '$lib/io/icon';
  import {
    type ConfigurableTableHeader,
    type ConfigurableTableType,
    resizeColumn,
  } from '$lib/stores/configurable-table-columns';

  interface Props {
    columns: ConfigurableTableHeader[];
    namespace: string;
    table: ConfigurableTableType;
  }

  let { columns, namespace, table }: Props = $props();

  const resizedColumns = $derived(
    columns.filter((column) => column.width !== undefined),
  );

  const resetColumnWidths = () => {
    resizedColumns.forEach((column) =>
      resizeColumn(column.label, undefined, namespace, table),
    );
  };
</script>

{#if resizedColumns.length > 0}
  <Tooltip text={translate('common.reset-column-widths')} top>
    <Button
      onclick={resetColumnWidths}
      data-testid="reset-column-widths-button"
      size="xs"
      variant="ghost"
      LeadingIcon={IconRetry}
      aria-label={translate('common.reset-column-widths')}
      data-track-name="table-control"
      data-track-intent="reset-column-widths"
      data-track-text={translate('common.reset-column-widths')}
    ></Button>
  </Tooltip>
{/if}
