<script lang="ts">
  import type { Readable } from 'svelte/store';

  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    type ConfigurableTableHeader,
    type ConfigurableTableType,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';

  import OrderableList from './orderable-list.svelte';

  export let availableColumns: Readable<ConfigurableTableHeader[]>;
  export let open: boolean;
  export let table: ConfigurableTableType = TABLE_TYPE.WORKFLOWS;
  export let type: string;
  export let title: string;

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
    <svelte:fragment slot="subtitle">
      Add (<Icon className="inline" name="add" />), re-arrange (<Icon
        className="inline"
        name="chevron-selector-vertical"
      />), and remove (<Icon className="inline" name="hyphen" />), {type} Headings
      to personalize the {title} Table.
    </svelte:fragment>

    <OrderableList {availableColumns} {table} {type} />
  </DrawerContent>
</Drawer>
