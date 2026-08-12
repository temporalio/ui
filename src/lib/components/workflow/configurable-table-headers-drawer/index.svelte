<script lang="ts">
  import type { Readable } from 'svelte/store';

  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconAdd,
    IconChevronSelectorVertical,
    IconHyphen,
  } from '$lib/io/icon';
  import {
    type ConfigurableTableHeader,
    type ConfigurableTableType,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';

  import OrderableList from './orderable-list.svelte';

  interface Props {
    availableColumns: Readable<ConfigurableTableHeader[]>;
    open: boolean;
    table?: ConfigurableTableType;
    type: string;
    title: string;
  }

  let {
    availableColumns,
    open = $bindable(),
    table = TABLE_TYPE.WORKFLOWS,
    type,
    title,
  }: Props = $props();

  const closeCustomizationDrawer = () => {
    open = false;
  };
</script>

<Drawer
  {open}
  onClick={closeCustomizationDrawer}
  position="right"
  id="{table}-table-configuration-drawer"
  dark={false}
  closeButtonLabel={translate('workflows.close-configure-headers', { title })}
  class="w-[35vw] min-w-min max-w-fit"
>
  <DrawerContent title={translate('workflows.configure-headers', { title })}>
    {#snippet subtitle()}
      Add (<IconAdd class="inline" />), re-arrange (<IconChevronSelectorVertical
        class="inline"
      />), and remove (<IconHyphen class="inline" />), {type} to personalize the {title}.
    {/snippet}

    <OrderableList {availableColumns} {table} {type} />
  </DrawerContent>
</Drawer>
