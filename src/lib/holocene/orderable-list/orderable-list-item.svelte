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

  type BaseProps = {
    label: string;
    index?: number;
    totalItems?: number;
    pinned?: boolean;
    maxPinnedItems?: number;
  };

  type ReadonlyProps = BaseProps & {
    readonly: boolean;
  };

  type StaticProps = BaseProps & {
    static: boolean;
  } & Pick<I18nProps, 'addButtonLabel'>;

  type I18nProps = {
    moveUpButtonLabel: string;
    moveDownButtonLabel: string;
    pinButtonLabel: string;
    unpinButtonLabel: string;
    addButtonLabel: string;
    removeButtonLabel: string;
  };

  type $$Props = (BaseProps & I18nProps) | ReadonlyProps | StaticProps;

  let isStatic = false;
  export { isStatic as static };
  export let label: string;
  export let maxPinnedItems: number = undefined;
  export let pinned = false;
  export let readonly = false;
  export let index = 0;
  export let totalItems = 0;
  export let moveUpButtonLabel = '';
  export let moveDownButtonLabel = '';
  export let pinButtonLabel = '';
  export let unpinButtonLabel = '';
  export let addButtonLabel = '';
  export let removeButtonLabel = '';

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
          icon="chevron-up"
          data-testid="orderable-list-item-{label}-move-up-button"
          label={moveUpButtonLabel}
          on:click={() => dispatch('moveItem', { from: index, to: index - 1 })}
        />
        <IconButton
          disabled={index === totalItems - 1}
          icon="chevron-down"
          data-testid="orderable-list-item-{label}-move-down-button"
          label={moveDownButtonLabel}
          on:click={() => dispatch('moveItem', { from: index, to: index + 1 })}
        />
      </div>
    {/if}
    {label}
    {#if !isStatic && !readonly && index <= maxPinnedItems - 1}
      {#if pinned}
        <IconButton
          icon="pin-filled"
          data-testid="orderable-list-item-{label}-unpin-button"
          label={unpinButtonLabel}
          on:click={() => dispatch('pinItem')}
        />
      {:else}
        <IconButton
          icon="pin"
          data-testid="orderable-list-item-{label}-pin-button"
          label={pinButtonLabel}
          on:click={() => dispatch('pinItem')}
        />
      {/if}
    {/if}
  </div>
  {#if !readonly}
    {#if isStatic}
      <IconButton
        icon="add"
        data-testid="orderable-list-item-{label}-add-button"
        label={addButtonLabel}
        on:click={() => dispatch('addItem')}
      />
    {:else}
      <IconButton
        icon="hyphen"
        data-testid="orderable-list-item-{label}-remove-button"
        label={removeButtonLabel}
        on:click={() => dispatch('removeItem')}
      />
    {/if}
  {/if}
</li>

<style lang="postcss">
  .orderable-item {
    @apply flex select-none list-none flex-row items-center justify-between border-b border-subtle p-2 text-sm font-medium first-of-type:rounded-tl-lg first-of-type:rounded-tr-lg last-of-type:rounded-bl-lg last-of-type:rounded-br-lg last-of-type:border-b-0;
  }

  .orderable-item[draggable='true'] {
    @apply cursor-move;
  }

  .orderable-item.readonly {
    @apply surface-secondary;
  }

  :global(.orderable-item.dragging-over:not(.locked)) {
    @apply bg-gradient-to-br from-blue-100 to-purple-100;

    &:last-of-type {
      @apply rounded-bl-lg rounded-br-lg;
    }
  }
</style>
