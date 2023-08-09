<script lang="ts" generics="T extends object">
  import Icon from '../icon/icon.svelte';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    selected?: boolean;
    value?: string | T;
    disabled?: boolean;
  }

  interface DisabledProps {
    disabled: true;
    selected?: never;
    value?: never;
  }

  type $$Props = Props | DisabledProps;

  export let selected: boolean = false;
  export let value: string | T = '';
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{
    select: string | T;
  }>();

  const handleClick = () => dispatch('select', value);
  const handleKeypress = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
      dispatch('select', value);
    }
  };
</script>

<li
  on:click={handleClick}
  on:keypress={handleKeypress}
  tabindex="0"
  role="option"
  aria-selected={selected}
  aria-disabled={disabled}
  class="combobox-option"
  class:disabled
>
  <div class="flex">
    <slot name="leading-slot" />
  </div>
  <div class="flex grow">
    <slot />
  </div>
  <div class="flex">
    {#if selected}
      <Icon name="checkmark" class="text-indigo-600" />
    {/if}
    <slot name="trailing-slot" />
  </div>
</li>
