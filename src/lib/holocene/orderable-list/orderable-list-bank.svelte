<script lang="ts">
  import type { HTMLOlAttributes } from 'svelte/elements';
  import OrderableContainer from './orderable-container.svelte';
  import OrderableItem from './orderable-item.svelte';
  import type { IOrderableItem } from './orderable-item.svelte';
  import IconButton from '../icon-button.svelte';

  interface $$Props extends HTMLOlAttributes {
    items: IOrderableItem[];
    addItem: (index: number) => void;
  }

  export let items: IOrderableItem[];
  export let addItem: (index: number) => void;
</script>

<OrderableContainer class={$$props.class} {...$$restProps}>
  {#each items as { key, label }, index (key)}
    <OrderableItem orderable={false} {index}>
      {label}
      <IconButton
        slot="item-action"
        icon="add"
        on:click={() => addItem(index)}
      />
    </OrderableItem>
  {/each}
</OrderableContainer>
