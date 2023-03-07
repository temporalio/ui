<script lang="ts">
  import IconButton from './icon-button.svelte';
  import Icon from './icon/icon.svelte';

  type ExtendedDragEvent = DragEvent & {
    currentTarget: EventTarget & HTMLLIElement;
  };

  interface OrderableItem {
    label: string;
    key: string;
    locked?: boolean;
  }

  interface $$Props {
    items: OrderableItem[];
    availableItems?: OrderableItem[];
  }

  export let items: OrderableItem[];
  export let availableItems: OrderableItem[] = [];

  const addItem = (index: number) => {
    let tempAvailableItems = [...availableItems];
    items = [...items, ...tempAvailableItems.splice(index, 1)];
    availableItems = tempAvailableItems;
  };

  const removeItem = (index: number) => {
    let tempItems = [...items];
    availableItems = [...tempItems.splice(index, 1), ...availableItems];
    items = tempItems;
  };

  const handleDragStart = (
    event: ExtendedDragEvent,
    index: number,
    locked: boolean,
  ) => {
    if (locked) {
      return false;
    }
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: ExtendedDragEvent, to: number) => {
    event.currentTarget.classList.remove('dragging-over');
    const from = parseInt(event.dataTransfer.getData('text/plain'));
    const tempItems = [...items];
    tempItems.splice(to, 0, tempItems.splice(from, 1)[0]);
    items = tempItems;
  };

  const handleDragEnter = (event: ExtendedDragEvent) =>
    event.currentTarget.classList.add('dragging-over');
  const handleDragLeave = (event: ExtendedDragEvent) =>
    event.currentTarget.classList.remove('dragging-over');
</script>

<div class="flex flex-col gap-4">
  <div class="orderable-section">
    <h4 class="orderable-heading">
      <slot name="main-heading">Items</slot>
    </h4>
    <ol class="orderable-list">
      {#each items as item, index (item.key)}
        {@const { label, locked } = item}
        <li
          draggable={!locked}
          class:locked
          class="orderable-item"
          on:dragstart={(e) => handleDragStart(e, index, locked)}
          on:drop|preventDefault={(e) => handleDrop(e, index)}
          on:dragenter|preventDefault|stopPropagation={handleDragEnter}
          on:dragleave|preventDefault|stopPropagation={handleDragLeave}
          on:dragover|preventDefault|stopPropagation
        >
          <div class="flex flex-row gap-2 items-center">
            {#if locked}
              <Icon name="lock" />
            {:else}
              <Icon name="chevron-selector-vertical" />
            {/if}
            {label}
          </div>
          {#if !locked}
            <IconButton icon="hyphen" on:click={() => removeItem(index)} />
          {/if}
        </li>
        <hr />
      {/each}
    </ol>
  </div>
  {#if availableItems && availableItems.length > 0}
    <div class="orderable-section">
      <h4 class="orderable-heading">
        <slot name="bank-heading">Available Items</slot>
      </h4>
      <ol class="orderable-list">
        {#each availableItems as item, index (item.key)}
          {@const { label } = item}
          <li class="orderable-item">
            <div class="flex flex-row gap-2 items-center">
              <span class="w-6" />
              {label}
            </div>
            <IconButton icon="add" on:click={() => addItem(index)} />
          </li>
          <hr />
        {/each}
      </ol>
    </div>
  {/if}
</div>

<style lang="postcss">
  .orderable-section {
    @apply flex flex-col gap-2;
  }

  .orderable-heading {
    @apply text-sm font-medium;
  }

  .orderable-list {
    @apply bg-white border-3 border-primary rounded-lg;
  }

  .orderable-item {
    @apply select-none flex flex-row items-center justify-between px-4 py-2 list-none font-medium text-sm;
  }

  .orderable-item[draggable='true'] {
    @apply cursor-move;
  }

  .orderable-item.locked {
    @apply pointer-events-none;
  }

  hr {
    @apply pointer-events-none border-primary last-of-type:hidden;
  }

  :global(.orderable-item.dragging-over:not(.locked)) {
    @apply bg-gradient-to-br from-blue-100 to-purple-100;

    &:last-of-type {
      @apply rounded-bl-lg rounded-br-lg;
    }
  }
</style>
