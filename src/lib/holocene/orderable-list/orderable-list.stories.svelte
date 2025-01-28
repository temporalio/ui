<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import OrderableListItem from './orderable-list-item.svelte';
  import OrderableList from './orderable-list.svelte';

  const items = [
    { label: 'Item A', pinned: true },
    { label: 'Item B', pinned: true },
    { label: 'Item C' },
    { label: 'Item D' },
    { label: 'Item E' },
    { label: 'Item F' },
  ];

  const { Story } = defineMeta({
    title: 'Orderable List',
    component: OrderableList,
  });
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
</script>

<Story name="Empty">
  <OrderableList />
</Story>

<Story name="Heading">
  {#snippet children(_, context)}
    <OrderableList>
      {#snippet heading()}
        <span>{context.name}</span>
      {/snippet}
    </OrderableList>
  {/snippet}
</Story>

<Story name="With Items">
  {#snippet children(_, context)}
    <OrderableList>
      {#snippet heading()}
        <span>{context.name}</span>
      {/snippet}
      {#each items as item, index (item.label)}
        <OrderableListItem
          moveItem={action('moveItem')}
          removeItem={action('removeItem')}
          addButtonLabel="Add"
          label={item.label}
          pinned={item.pinned}
          moveUpButtonLabel="Move Up"
          moveDownButtonLabel="Move Down"
          removeButtonLabel="Remove"
          pinButtonLabel="Pin"
          unpinButtonLabel="Unpin"
          {index}
        />
      {/each}
    </OrderableList>
  {/snippet}
</Story>
