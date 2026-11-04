<script lang="ts">
  import OrderableListItem from '$lib/holocene/orderable-list/orderable-list-item.svelte';
  import OrderableList from '$lib/holocene/orderable-list/orderable-list.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { ConfigurableTableHeadersModel } from './configurable-table-headers-model';

  interface Props {
    model: ConfigurableTableHeadersModel;
    type: string;
  }

  let { model, type }: Props = $props();
  const customAvailable = $derived(model.customAvailable);
</script>

<div class="flex flex-col gap-4">
  <OrderableList>
    {#snippet heading()}
      {type}
      <span class="font-normal">{translate('workflows.in-view')}</span>
    {/snippet}
    {#each model.inView as { id, label, key }, index (key ?? id)}
      <OrderableListItem
        {index}
        {label}
        totalItems={model.inView.length}
        onMoveItem={({ from, to }) => model.onMove(from, to)}
        onRemoveItem={() => model.onRemove(id)}
        addButtonLabel={translate('workflows.add-column-label', {
          column: label,
          escapeValue: false,
        })}
        removeButtonLabel={translate('workflows.remove-column-label', {
          column: label,
          escapeValue: false,
        })}
        moveUpButtonLabel={translate('workflows.move-column-up-label', {
          column: label,
          escapeValue: false,
        })}
        moveDownButtonLabel={translate('workflows.move-column-down-label', {
          column: label,
          escapeValue: false,
        })}
      />
    {:else}
      <OrderableListItem
        readonly
        label={translate('workflows.no-headings-in-view')}
      />
    {/each}
  </OrderableList>
  <OrderableList>
    {#snippet heading()}
      {model.availableHeading ?? translate('workflows.available-columns')}
      <span class="font-normal">{translate('workflows.not-in-view')}</span>
    {/snippet}
    {#each model.available as { id, label } (id)}
      <OrderableListItem
        static
        {label}
        onAddItem={() => model.onAdd(id)}
        addButtonLabel={translate('workflows.add-column-label', {
          column: label,
          escapeValue: false,
        })}
      />
    {:else}
      <OrderableListItem
        readonly
        label={translate('workflows.all-headings-in-view')}
      />
    {/each}
  </OrderableList>
  {#if customAvailable}
    <OrderableList>
      {#snippet heading()}
        {customAvailable.heading}
        <span class="font-normal">{translate('workflows.not-in-view')}</span>
      {/snippet}
      {#each customAvailable.columns as { id, label } (id)}
        <OrderableListItem
          static
          {label}
          onAddItem={() => model.onAdd(id)}
          addButtonLabel={translate('workflows.add-column-label', {
            column: label,
            escapeValue: false,
          })}
        />
      {:else}
        <OrderableListItem readonly label={customAvailable.emptyLabel} />
      {/each}
    </OrderableList>
  {/if}
</div>
