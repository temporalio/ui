<script lang="ts">
  import type { Readable } from 'svelte/store';

  import { page } from '$app/state';

  import ConfigurableTableHeadersDrawer from '$lib/holocene/table/configurable-table-headers-drawer.svelte';
  import type { ConfigurableTableHeadersModel } from '$lib/holocene/table/configurable-table-headers-model';
  import { translate } from '$lib/i18n/translate';
  import {
    addColumn,
    availableCustomSearchAttributeColumns,
    configurableTableColumns,
    type ConfigurableTableHeader,
    type ConfigurableTableType,
    moveColumn,
    removeColumn,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';

  interface Props {
    availableColumns: Readable<ConfigurableTableHeader[]>;
    open: boolean;
    table?: ConfigurableTableType;
    type?: string;
    title: string;
  }

  let {
    availableColumns,
    open = $bindable(),
    table = TABLE_TYPE.WORKFLOWS,
    type,
    title,
  }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const columnsInUse = $derived(
    $configurableTableColumns?.[namespace]?.[table] ?? [],
  );
  const availableCustomColumns = $derived(
    availableCustomSearchAttributeColumns(namespace, table),
  );
  const model: ConfigurableTableHeadersModel = $derived({
    inView: columnsInUse.map((column) => ({
      id: column.label,
      label: column.label,
      key: column,
    })),
    available: $availableColumns.map(({ label }) => ({ id: label, label })),
    customAvailable:
      table === TABLE_TYPE.DEPLOYMENTS
        ? undefined
        : {
            heading: translate('events.custom-search-attributes'),
            columns: $availableCustomColumns.map(({ label }) => ({
              id: label,
              label,
            })),
            emptyLabel: translate('events.no-custom-search-attributes'),
          },
    onAdd: (id: string) => addColumn(id, namespace, table),
    onRemove: (id: string) => removeColumn(id, namespace, table),
    onMove: (from: number, to: number) =>
      moveColumn(from, to, namespace, table),
  });
</script>

<ConfigurableTableHeadersDrawer
  bind:open
  {model}
  {type}
  {title}
  id="{table}-table-configuration-drawer"
/>
