<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconButton from '../icon-button.svelte';

  const dispatch = createEventDispatcher<{
    addItem: undefined;
    moveItem: { from: number; to: number };
    pinItem: undefined;
    removeItem: undefined;
  }>();

  type ExtendedDragEvent = DragEvent & {
    currentTarget: EventTarget & HTMLLIElement;
  };

  interface $$Props {
    label: string;
    index?: number;
    totalItems?: number;
    pinned?: boolean;
    maxPinnedItems?: number;
    static?: boolean;
    readonly?: boolean;
  }

  let isStatic: boolean = false;
  export { isStatic as static };
  export let label: string;
  export let maxPinnedItems: number = undefined;
  export let pinned: boolean = false;
  export let readonly: boolean = false;
  export let index: number = 0;
  export let totalItems: number = 0;

  const handleDragStart = (event: ExtendedDragEvent, index: number) => {
    if (isStatic || readonly) return;
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: ExtendedDragEvent, to: number) => {
    event.currentTarget.classList.remove('dragging-over');
    const from = parseInt(event.dataTransfer.getData('text/plain'));
    dispatch('moveItem', { from, to });
  };

  const handleDragEnter = (event: ExtendedDragEvent) =>
    event.currentTarget.classList.add('dragging-over');
  const handleDragLeave = (event: ExtendedDragEvent) =>
    event.currentTarget.classList.remove('dragging-over');
</script>

<li
  draggable={!isStatic && !readonly}
  class="orderable-item group"
  class:readonly
  on:dragstart={(e) => handleDragStart(e, index)}
  on:drop|preventDefault={(e) => handleDrop(e, index)}
  on:dragenter|preventDefault|stopPropagation={handleDragEnter}
  on:dragleave|preventDefault|stopPropagation={handleDragLeave}
  on:dragover|preventDefault|stopPropagation
  data-testid="orderable-list-item-{label}"
>
  <div class="flex flex-row items-center gap-2">
    {#if !isStatic && !readonly}
      <div class="flex items-center">
        <IconButton
          disabled={index === 0}
          hoverable
          icon="chevron-up"
          data-testid="orderable-list-item-{label}-move-up-button"
          on:click={() => dispatch('moveItem', { from: index, to: index - 1 })}
        />
        <IconButton
          disabled={index === totalItems - 1}
          hoverable
          icon="chevron-down"
          data-testid="orderable-list-item-{label}-move-down-button"
          on:click={() => dispatch('moveItem', { from: index, to: index + 1 })}
        />
      </div>
    {/if}
    {label}
    {#if !isStatic && !readonly && index <= maxPinnedItems - 1}
      {#if pinned}
        <IconButton
          hoverable
          icon="pin-filled"
          data-testid="orderable-list-item-{label}-unpin-button"
          on:click={() => dispatch('pinItem')}
        />
      {:else}
        <IconButton
          hoverable
          icon="pin"
          data-testid="orderable-list-item-{label}-pin-button"
          on:click={() => dispatch('pinItem')}
        />
      {/if}
    {/if}
  </div>
  {#if !readonly}
    {#if isStatic}
      <IconButton
        hoverable
        icon="add"
        data-testid="orderable-list-item-{label}-add-button"
        on:click={() => dispatch('addItem')}
      />
    {:else}
      <IconButton
        hoverable
        icon="hyphen"
        data-testid="orderable-list-item-{label}-remove-button"
        on:click={() => dispatch('removeItem')}
      />
    {/if}
  {/if}
</li>
<hr />

<style lang="postcss">
  .orderable-item {
    @apply flex select-none list-none flex-row items-center justify-between p-2 text-sm font-medium first-of-type:rounded-tl-lg first-of-type:rounded-tr-lg last-of-type:rounded-bl-lg last-of-type:rounded-br-lg;
  }

  .orderable-item[draggable='true'] {
    @apply cursor-move;
  }

  .orderable-item.readonly {
    @apply bg-gray-100 bg-opacity-50;
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
