<script lang="ts" context="module">
  export const SELECT_CONTEXT = 'select-context';
  type ExtendedSelectOption<T> = {
    nativeElement: HTMLLIElement;
  } & SelectOption<T>;
  export interface SelectContext<T> {
    handleChange: (value: T) => void;
    options: Writable<ExtendedSelectOption<T>[]>;
    selectLabel: Writable<string>;
    selectValue: Writable<T>;
    open: Writable<boolean>;
  }

  export interface SelectOption<T> {
    value: T;
    label: string;
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { writable, type Writable } from 'svelte/store';
  import { noop, onMount } from 'svelte/internal';

  type T = $$Generic;

  export let label = '';
  export let id: string;
  export let value: T = undefined;
  export let placeholder = '';
  export let disabled: boolean = false;
  export let unroundRight: boolean = false;
  export let onChange: (value: T) => void = noop;

  let select: HTMLUListElement;

  // We get the "true" value of this further down but before the mount happens we should have some kind of value
  const valueCtx = writable<T>(value);
  const optionsCtx = writable<ExtendedSelectOption<T>[]>([]);
  const labelCtx = writable<string>(value?.toString());
  const open = writable<boolean>(false);

  $: {
    $valueCtx = value;
    $labelCtx = getLabelFromOptions(value);
  }

  const handleChange = (newValue: T) => {
    closeOptions();
    value = newValue;
    onChange(value);
  };

  function getLabelFromOptions(value: T): string {
    const selectedOption = $optionsCtx.find((option) => option.value === value);

    if (selectedOption !== undefined) {
      return selectedOption.label;
    }
  }

  const closeOptions = () => {
    $open = false;
    select.focus();
  };

  const toggleOptions = () => {
    $open = !$open;
    // when the menu is open, focus the selected option if one exists, else focus the first option.
    if ($open) {
      const selectedOption = $optionsCtx.find(
        (option) => option.value === value,
      );

      if (selectedOption !== undefined) {
        selectedOption.nativeElement.focus();
      } else {
        $optionsCtx[0].nativeElement.focus();
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === ' ') {
      event.preventDefault();
      toggleOptions();
    }

    if ($open && event.key === 'Escape') {
      closeOptions();
    }
  };

  const handleWindowClick = (event: MouseEvent) => {
    if (
      !$open ||
      event.target === select ||
      select.contains(event.target as HTMLElement)
    ) {
      return;
    }

    closeOptions();
  };

  setContext<SelectContext<T>>(SELECT_CONTEXT, {
    selectValue: valueCtx,
    selectLabel: labelCtx,
    options: optionsCtx,
    open,
    handleChange,
  });

  onMount(() => {
    // After all the Options are mounted use context to read the label assocaited with the value
    $labelCtx = getLabelFromOptions(value);
  });
</script>

<svelte:window on:click={handleWindowClick} />
<div class="select {$$props.class}">
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <ul
    role="button"
    class="select-input-container"
    class:unroundRight
    class:disabled
    tabindex={0}
    aria-controls="{id}-options"
    bind:this={select}
    on:click={toggleOptions}
    on:keydown|stopPropagation={handleKeyDown}
    data-testid={$$props.testId}
  >
    <input
      tabindex="-1"
      class="select-input"
      disabled
      class:disabled
      aria-labelledby={id}
      {id}
      value={!value && placeholder !== '' ? placeholder : $labelCtx}
    />
    {#if disabled}
      <Icon name="lock" class="text-gray-500" />
    {:else}
      <Icon
        class="pointer-events-none"
        name={$open ? 'chevron-up' : 'chevron-down'}
      />
    {/if}
    <ul
      id="{id}-options"
      class="select-options"
      role="listbox"
      class:sr-only={!$open}
    >
      <slot />
    </ul>
  </ul>
</div>

<style lang="postcss">
  label {
    @apply mb-10 text-sm font-medium text-gray-900;
  }

  .select-input-container {
    @apply relative flex h-10 w-full flex-row items-center justify-between rounded border border-gray-900 bg-white px-2 text-sm text-primary;

    &:focus {
      outline: none;

      @apply outline outline-2 -outline-offset-2 outline-blue-700;
    }
  }

  .select-input-container.unroundRight {
    @apply rounded-tr-none rounded-br-none border-r-0;
  }

  .select-input-container.disabled {
    @apply bg-gray-50 pointer-events-none;
  }

  .select-input {
    @apply inline cursor-pointer truncate bg-white;
  }

  .select-input.disabled {
    @apply bg-gray-50 placeholder:text-gray-600 pointer-events-none;
  }

  .select-options:not(.sr-only) {
    @apply absolute z-50 p-2 top-10 left-0 w-full list-none rounded border border-gray-900 bg-white text-primary shadow max-h-80 overflow-y-scroll;
  }
</style>
