<script lang="ts">
  import type { HTMLOlAttributes } from 'svelte/elements';
  import IconButton from '../icon-button.svelte';
  import OrderableContainer from './orderable-container.svelte';
  import OrderableItem, { type IOrderableItem } from './orderable-item.svelte';

  interface $$Props extends HTMLOlAttributes {
    items: IOrderableItem[];
    removeItem: (index: number) => void;
  }

  export let items: IOrderableItem[];
  export let removeItem: (index: number) => void;

  const handleMove = (
    event: CustomEvent<{ key: string; from: number; to: number }>,
  ) => {
    const { from, to } = event.detail;
    const tempItems = [...items];
    tempItems.splice(to, 0, tempItems.splice(from, 1)[0]);
    items = tempItems;
  };
</script>

<OrderableContainer class={$$props.class} {...$$restProps}>
  {#each items as { label, key, locked }, index (key)}
    <OrderableItem on:move={handleMove} {locked} {index}>
      {label}
      <IconButton
        slot="item-action"
        icon="hyphen"
        on:click={() => removeItem(index)}
      />
    </OrderableItem>
  {/each}
</OrderableContainer>
