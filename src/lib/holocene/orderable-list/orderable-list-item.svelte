<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import IconButton from '../icon-button.svelte';

  const dispatch = createEventDispatcher<{
    addItem: undefined;
    moveItem: { from: number; to: number };
    removeItem: undefined;
  }>();

  type ExtendedDragEvent = DragEvent & {
    currentTarget: EventTarget & HTMLLIElement;
  };

  type Props = {
    label: string;
    index?: number;
    totalItems?: number;
  } & (
    | {
        readonly: true;
        static?: never;
        addButtonLabel?: never;
        moveUpButtonLabel?: never;
        moveDownButtonLabel?: never;
        removeButtonLabel?: never;
      }
    | {
        readonly?: false;
        static: true;
        addButtonLabel: string;
        moveUpButtonLabel?: never;
        moveDownButtonLabel?: never;
        removeButtonLabel?: never;
      }
    | {
        readonly?: false;
        static?: false;
        moveUpButtonLabel: string;
        moveDownButtonLabel: string;
        addButtonLabel: string;
        removeButtonLabel: string;
      }
  );

  let {
    label,
    index = 0,
    totalItems = 0,
    readonly = false,
    static: isStatic = false,
    moveUpButtonLabel = '',
    moveDownButtonLabel = '',
    addButtonLabel = '',
    removeButtonLabel = '',
  }: Props = $props();

  const handleDragStart = (event: ExtendedDragEvent, index: number) => {
    if (isStatic || readonly || !event.dataTransfer) return;
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: ExtendedDragEvent, to: number) => {
    if (!event.dataTransfer) return;
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
  ondragstart={(e) => handleDragStart(e, index)}
  ondrop={(e) => {
    e.preventDefault();
    handleDrop(e, index);
  }}
  ondragenter={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragEnter(e);
  }}
  ondragleave={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragLeave(e);
  }}
  ondragover={(e) => {
    e.preventDefault();
    e.stopPropagation();
  }}
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
    @apply flex select-none list-none flex-row items-center justify-between border-b border-subtle p-2 text-sm font-medium last-of-type:border-b-0;
  }

  .orderable-item[draggable='true'] {
    @apply cursor-move;
  }

  .orderable-item.readonly {
    @apply surface-secondary;
  }

  :global(.orderable-item.dragging-over:not(.locked)) {
    @apply bg-gradient-to-br from-blue-100 to-purple-100;
  }
</style>
