<script lang="ts">
  import IconButton from '../icon-button.svelte';

  type ExtendedDragEvent = DragEvent & {
    currentTarget: EventTarget & HTMLLIElement;
  };

  type BaseProps = {
    label: string;
    index?: number;
    totalItems?: number;
    pinned?: boolean;
    maxPinnedItems?: number;
    addItem?: () => void;
    moveItem?: (args: { from: number; to: number }) => void;
    pinItem?: () => void;
    removeItem?: () => void;
  };

  type ReadonlyProps = BaseProps & {
    static?: false;
    readonly: true;
    moveUpButtonLabel?: '';
    moveDownButtonLabel?: '';
    pinButtonLabel?: '';
    unpinButtonLabel?: '';
    addButtonLabel?: '';
    removeButtonLabel?: '';
  };

  type StaticProps = BaseProps & {
    static: true;
    readonly?: false;
    moveUpButtonLabel?: '';
    moveDownButtonLabel?: '';
    pinButtonLabel?: '';
    unpinButtonLabel?: '';
    removeButtonLabel?: '';
  } & Pick<I18nProps, 'addButtonLabel'>;

  type I18nProps = {
    moveUpButtonLabel: string;
    moveDownButtonLabel: string;
    pinButtonLabel: string;
    unpinButtonLabel: string;
    addButtonLabel: string;
    removeButtonLabel: string;
  };

  type Props =
    | (BaseProps & I18nProps & { static?: false; readonly?: false })
    | ReadonlyProps
    | StaticProps;

  let {
    label,
    maxPinnedItems,
    pinned = false,
    readonly = false,
    index = 0,
    totalItems = 0,
    moveUpButtonLabel = '',
    moveDownButtonLabel = '',
    pinButtonLabel = '',
    unpinButtonLabel = '',
    addButtonLabel = '',
    removeButtonLabel = '',
    addItem = () => {},
    moveItem = () => {},
    pinItem = () => {},
    removeItem = () => {},
    static: isStatic = false,
  }: Props = $props();

  const handleDragStart = (event: ExtendedDragEvent, index: number) => {
    if (isStatic || readonly) return;
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: ExtendedDragEvent, to: number) => {
    event.currentTarget.classList.remove('dragging-over');
    const from = parseInt(event.dataTransfer.getData('text/plain'));
    moveItem({ from, to });
  };

  const handleDragEnter = (event: ExtendedDragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('dragging-over');
  };
  const handleDragLeave = (event: ExtendedDragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('dragging-over');
  };
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
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
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
          onclick={() => moveItem({ from: index, to: index - 1 })}
        />
        <IconButton
          disabled={index === totalItems - 1}
          icon="chevron-down"
          data-testid="orderable-list-item-{label}-move-down-button"
          label={moveDownButtonLabel}
          onclick={() => moveItem({ from: index, to: index + 1 })}
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
          onclick={() => pinItem()}
        />
      {:else}
        <IconButton
          icon="pin"
          data-testid="orderable-list-item-{label}-pin-button"
          label={pinButtonLabel}
          onclick={() => pinItem()}
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
        onclick={() => addItem()}
      />
    {:else}
      <IconButton
        icon="hyphen"
        data-testid="orderable-list-item-{label}-remove-button"
        label={removeButtonLabel}
        onclick={() => removeItem()}
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
