<script lang="ts" context="module">
  export interface IOrderableItem {
    label: string;
    key: string;
    locked?: boolean;
  }
</script>

<script lang="ts">
  import type { HTMLLiAttributes } from 'svelte/elements';
  import { createEventDispatcher } from 'svelte';
  import Icon from '../icon/icon.svelte';

  const dispatch = createEventDispatcher<{
    move: { from: number; to: number };
  }>();

  interface $$Props extends HTMLLiAttributes {
    locked?: boolean;
    orderable?: boolean;
    index?: number;
  }

  export let locked: boolean = false;
  export let orderable: boolean = true;
  export let index: number = undefined;

  let item: HTMLLIElement;

  const handleDragStart = (event: DragEvent) => {
    if (!orderable || locked) {
      return false;
    }
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: DragEvent) => {
    const initialIndex = parseInt(event.dataTransfer.getData('text/plain'));
    dispatch('move', { from: initialIndex, to: index });
  };

  const handleDragEnter = () => item.classList.add('dragging-over');
  const handleDragLeave = () => item.classList.remove('dragging-over');
</script>

<li
  bind:this={item}
  draggable={orderable && !locked}
  class:locked
  on:dragstart={handleDragStart}
  on:drop|preventDefault|stopPropagation={handleDrop}
  on:dragenter|preventDefault|stopPropagation={handleDragEnter}
  on:dragleave|preventDefault|stopPropagation={handleDragLeave}
  on:dragover|preventDefault|stopPropagation
  class="orderable-item"
  {...$$restProps}
>
  <div class="flex flex-row gap-2 items-center">
    {#if orderable && !locked}
      <Icon name="chevron-selector-vertical" />
    {:else}
      <span class="w-6" />
    {/if}
    <slot />
    {#if locked}
      <Icon name="lock" />
    {/if}
  </div>
  {#if !locked}
    <slot name="item-action" />
  {/if}
</li>
<hr />

<style lang="postcss">
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
  }
</style>
