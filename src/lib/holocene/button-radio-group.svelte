<script lang="ts" module>
  export type ButtonRadioOption<T extends string> = {
    value: T;
    label?: string;
    disabled?: boolean;
  };

  export type ButtonRadioItem<O extends ButtonRadioOption<string>> = {
    option: O;
    checked: boolean;
    attrs: {
      role: 'radio';
      'aria-checked': boolean;
      tabindex: number;
      disabled: boolean;
      'data-radio-group': string;
      'data-radio-index': number;
    };
    onSelect: () => void;
    onKeydown: (event: KeyboardEvent) => void;
  };
</script>

<script lang="ts" generics="O extends ButtonRadioOption<string>">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props {
    label: string;
    value: O['value'];
    options: readonly O[];
    onChange: (value: O['value']) => void;
    item: Snippet<[ButtonRadioItem<O>]>;
    class?: string;
  }

  let {
    label,
    value,
    options,
    onChange,
    item,
    class: className = '',
  }: Props = $props();

  const id = $props.id();

  const checkedIndex = $derived(options.findIndex((o) => o.value === value));

  let radioGroup: HTMLDivElement;

  function focusItem(index: number): void {
    radioGroup
      ?.querySelector<HTMLElement>(
        `[data-radio-group="${id}"][data-radio-index="${index}"]`,
      )
      ?.focus();
  }

  function select(index: number): void {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    focusItem(index);
  }

  function nextEnabledIndex(from: number, step: number): number {
    const { length } = options;
    for (let i = 1; i <= length; i++) {
      const index = (from + step * i + length * i) % length;
      if (!options[index].disabled) return index;
    }
    return from;
  }

  function handleKeydown(event: KeyboardEvent, index: number): void {
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = nextEnabledIndex(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = nextEnabledIndex(index, -1);
        break;
      case 'Home':
        nextIndex = nextEnabledIndex(-1, 1);
        break;
      case 'End':
        nextIndex = nextEnabledIndex(0, -1);
        break;
      default:
        return;
    }

    event.preventDefault();
    select(nextIndex);
  }
</script>

<div
  bind:this={radioGroup}
  class={merge('flex flex-wrap gap-2', className)}
  role="radiogroup"
  aria-label={label}
>
  {#each options as option, index (option.value)}
    {@const checked = option.value === value}
    {@render item({
      option,
      checked,
      attrs: {
        role: 'radio',
        'aria-checked': checked,
        tabindex: checked || (checkedIndex === -1 && index === 0) ? 0 : -1,
        disabled: option.disabled ?? false,
        'data-radio-group': id,
        'data-radio-index': index,
      },
      onSelect: () => select(index),
      onKeydown: (event) => handleKeydown(event, index),
    })}
  {/each}
</div>
