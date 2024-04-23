<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import OrderableListItem from './orderable-list-item.svelte';
  import OrderableList from './orderable-list.svelte';

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
  } satisfies Meta;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story } from '@storybook/addon-svelte-csf';

  let items = [
    { label: 'Item A', pinned: true },
    { label: 'Item B', pinned: true },
    { label: 'Item C' },
    { label: 'Item D' },
    { label: 'Item E' },
    { label: 'Item F' },
  ];
</script>

<Story name="Empty">
  <OrderableList />
</Story>

<Story name="Heading">
  <OrderableList>
    <span slot="heading">Orderable List</span>
  </OrderableList>
</Story>

<Story name="With Items">
  <OrderableList>
    <span slot="heading">Orderable List</span>
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
    {/each}
  </OrderableList>
</Story>

<Story name="Empty (Dark)" parameters={{ themes: { themeOverride: 'dark' } }}>
  <OrderableList />
</Story>

<Story
  name="With Items (Dark)"
  parameters={{ themes: { themeOverride: 'dark' } }}
>
  <OrderableList>
    <span slot="heading">Orderable List</span>
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
    {/each}
  </OrderableList>
</Story>
