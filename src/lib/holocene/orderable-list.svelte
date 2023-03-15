<script lang="ts">
  import IconButton from './icon-button.svelte';
  import Icon from './icon/icon.svelte';

  type ExtendedDragEvent = DragEvent & {
    currentTarget: EventTarget & HTMLLIElement;
  };

  interface $$Props {
    items: string[];
    availableItems?: string[];
    onAddItem: (index: number) => void;
    onRemoveItem: (index: number) => void;
    onMoveItem: (from: number, to: number) => void;
  }

  export let items: string[];
  export let availableItems: string[] = [];
  export let onAddItem: $$Props['onAddItem'];
  export let onMoveItem: $$Props['onMoveItem'];
  export let onRemoveItem: $$Props['onRemoveItem'];

  const handleDragStart = (event: ExtendedDragEvent, index: number) => {
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: ExtendedDragEvent, to: number) => {
    event.currentTarget.classList.remove('dragging-over');
    const from = parseInt(event.dataTransfer.getData('text/plain'));
    onMoveItem(from, to);
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
      {#each items as item, index}
        <li
          draggable="true"
          class="orderable-item group"
          on:dragstart={(e) => handleDragStart(e, index)}
          on:drop|preventDefault={(e) => handleDrop(e, index)}
          on:dragenter|preventDefault|stopPropagation={handleDragEnter}
          on:dragleave|preventDefault|stopPropagation={handleDragLeave}
          on:dragover|preventDefault|stopPropagation
        >
          <div class="flex flex-row gap-2 items-center">
            <div class="flex items-center">
              <IconButton
                hoverable
                icon="chevron-up"
                on:click={() => onMoveItem(index, index - 1)}
              />
              <IconButton
                hoverable
                icon="chevron-down"
                on:click={() => onMoveItem(index, index + 1)}
              />
            </div>
            {item}
            {#if index === 0}
              <Icon width={16} height={16} name="pin-filled" />
            {/if}
          </div>
          <IconButton
            hoverable
            icon="hyphen"
            on:click={() => onRemoveItem(index)}
          />
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
        {#each availableItems as item, index}
          <li class="orderable-item">
            <div class="flex flex-row gap-2 items-center">
              {item}
            </div>
            <IconButton
              hoverable
              icon="add"
              on:click={() => onAddItem(index)}
            />
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
    @apply select-none flex flex-row items-center justify-between p-2 list-none font-medium text-sm;
  }

  .orderable-item[draggable='true'] {
    @apply cursor-move;
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
