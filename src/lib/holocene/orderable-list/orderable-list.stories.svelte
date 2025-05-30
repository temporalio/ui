<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import OrderableListItem from './orderable-list-item.svelte';
  import OrderableList from './orderable-list.svelte';

  const items = [
    { label: 'Item A' },
    { label: 'Item B' },
    { label: 'Item C' },
    { label: 'Item D' },
    { label: 'Item E' },
    { label: 'Item F' },
  ];

  export const meta = {
    title: 'Orderable List',
    component: OrderableList,
    subcomponents: { OrderableListItem },
    argTypes: {
      items: {
        name: 'Items',
        control: { type: 'object' },
      },
    },
  } satisfies Meta<OrderableList>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Empty">
  <OrderableList />
</Story>

<Story name="Heading" let:context>
  <OrderableList>
    <span slot="heading">{context.name}</span>
  </OrderableList>
</Story>

<Story name="With Items" let:context>
  <OrderableList>
    <span slot="heading">{context.name}</span>
    {#each items as item, index (item.label)}
      <OrderableListItem
        on:moveItem={action('moveItem')}
        on:removeItem={action('removeItem')}
        addButtonLabel="Add"
        static={false}
        label={item.label}
        moveUpButtonLabel="Move Up"
        moveDownButtonLabel="Move Down"
        removeButtonLabel="Remove"
        {index}
      />
    {/each}
  </OrderableList>
</Story>
