<script lang="ts">
  import type { HTMLOlAttributes } from 'svelte/elements';
  import { noop } from 'svelte/internal';
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

  interface $$Props extends HTMLOlAttributes {
    items: OrderableItem[];
    readonly?: boolean;
    removeItem?: (index: number) => void;
    addItem?: (index: number) => void;
  }

  let className: string = undefined;
  export { className as class };
  export let items: OrderableItem[];
  export let readonly: boolean = false;
  export let removeItem: (index: number) => void = noop;
  export let addItem: (index: number) => void = noop;

  const handleDragStart = (
    event: ExtendedDragEvent,
    index: number,
    locked: boolean,
  ) => {
    if (readonly || locked) {
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

<ol class="orderable-list {className}" {...$$restProps}>
  {#each items as item, index (item.key)}
    {@const { label, locked } = item}
    <li
      draggable={!readonly && !locked}
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
        {:else if readonly}
          <span class="w-6" />
        {:else}
          <Icon name="chevron-selector-vertical" />
        {/if}
        {label}
      </div>
      {#if !locked}
        {#if readonly}
          <IconButton icon="add" on:click={() => addItem(index)} />
        {:else}
          <IconButton icon="hyphen" on:click={() => removeItem(index)} />
        {/if}
      {/if}
    </li>
    <hr />
  {/each}
</ol>

<style lang="postcss">
  .orderable-list {
    @apply border-3 border-primary rounded-lg;
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

  .orderable-item.dragging-over:not(.locked) {
    @apply bg-gradient-to-br from-blue-100 to-purple-100;

    &:last-of-type {
      @apply rounded-bl-lg rounded-br-lg;
    }
  }
</style>
