<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import OrderableListItem from './orderable-list-item.svelte';
  import OrderableList from './orderable-list.svelte';

  let items = [
    { label: 'Item A', pinned: true },
    { label: 'Item B', pinned: true },
    { label: 'Item C' },
    { label: 'Item D' },
    { label: 'Item E' },
    { label: 'Item F' },
  ];
</script>

<Meta title="Orderable List" component={OrderableList} />

<Story name="orderable list">
  <OrderableList>
    <svelte:fragment slot="heading">Items</svelte:fragment>
    {#each items as item, index (item.label)}
      <OrderableListItem
        on:moveItem={action('moveItem')}
        on:removeItem={action('removeItem')}
        addButtonLabel="Add"
        static={false}
        label={item.label}
        pinned={item.pinned}
        {index}
      />
    {:else}
      <OrderableListItem readonly label="No items" />
    {/each}
  </OrderableList>
</Story>
