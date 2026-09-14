<script lang="ts" module>
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import type { ComponentProps } from 'svelte';

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

  const { Story } = defineMeta({
    title: 'Orderable List',
    component: OrderableList,
  });
</script>

<Story name="Empty" asChild>
  <OrderableList />
</Story>

<Story name="Heading">
  {#snippet template(
    _args: ComponentProps<typeof OrderableList>,
    context: StoryContext<ComponentProps<typeof OrderableList>>,
  )}
    <OrderableList>
      {#snippet heading()}<span>{context.name}</span>{/snippet}
    </OrderableList>
  {/snippet}
</Story>

<Story name="With Items">
  {#snippet template(
    _args: ComponentProps<typeof OrderableList>,
    context: StoryContext<ComponentProps<typeof OrderableList>>,
  )}
    <OrderableList>
      {#snippet heading()}<span>{context.name}</span>{/snippet}
      {#each items as item, index (item.label)}
        <OrderableListItem
          onMoveItem={action('moveItem')}
          onRemoveItem={action('removeItem')}
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
  {/snippet}
</Story>
