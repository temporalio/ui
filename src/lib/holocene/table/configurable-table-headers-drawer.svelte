<script lang="ts">
  import DrawerContent from '$lib/holocene/drawer-content.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconAdd,
    IconChevronSelectorVertical,
    IconHyphen,
  } from '$lib/io/icon';

  import type { ConfigurableTableHeadersModel } from './configurable-table-headers-model';

  import OrderableList from './configurable-table-headers-orderable-list.svelte';

  interface Props {
    open: boolean;
    model: ConfigurableTableHeadersModel;
    type?: string;
    title: string;
    id: string;
  }

  let {
    open = $bindable(),
    model,
    type = translate('common.columns'),
    title,
    id,
  }: Props = $props();

  const subtitleIcons = [IconAdd, IconChevronSelectorVertical, IconHyphen];
  const subtitleParts = $derived(
    translate('workflows.configure-headers-description', {
      type,
      title,
      escapeValue: false,
    }).split(/<([1-3])><\/\1>/),
  );

  const closeCustomizationDrawer = () => {
    open = false;
  };
</script>

<Drawer
  {open}
  onClick={closeCustomizationDrawer}
  position="right"
  {id}
  dark={false}
  closeButtonLabel={translate('workflows.close-configure-headers', {
    title,
    escapeValue: false,
  })}
  class="w-[35vw] min-w-min max-w-fit"
>
  <DrawerContent
    title={translate('workflows.configure-headers', {
      title,
      escapeValue: false,
    })}
  >
    {#snippet subtitle()}
      {#each subtitleParts as part, index (index)}
        {#if index % 2 === 0}
          {part}
        {:else}
          {@const Icon = subtitleIcons[Number(part) - 1]}
          {#if Icon}<Icon class="inline" />{/if}
        {/if}
      {/each}
    {/snippet}

    <OrderableList {model} {type} />
  </DrawerContent>
</Drawer>
