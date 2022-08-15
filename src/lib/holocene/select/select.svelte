<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import colors from 'tailwindcss/colors';
  import Icon from '$holocene/icon/index.svelte';
  import Menu from '$holocene/primitives/menu/menu.svelte';
  import Option from '$holocene/select/option.svelte';
  import type { OptionType } from '$holocene/select/option.svelte';
  import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
  import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';

  type T = $$Generic;
  let show = false;

  export let label = '';
  export let id: string;
  export let value: OptionType<T>;
  export let options: OptionType<T>[] | undefined = undefined;
  export let dark: boolean = false;
  export let placeholder = '';
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{ select: { value: typeof value } }>();

  function handleOptionClick(event: CustomEvent<{ value: typeof value }>) {
    dispatch('select', { value: event.detail.value });
  }
</script>

<div class="select {$$props.class}">
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <MenuContainer class="w-full">
    <MenuButton
      class="select-input-container {disabled ? 'disabled' : ''}"
      bind:show
      controls="{id}-menu"
      data-cy={$$props.dataCy}
      {dark}
      {disabled}
    >
      <input
        class="select-input"
        class:dark
        class:disabled
        {placeholder}
        value={value?.label ?? ''}
        name={id}
        disabled
        {id}
      />
      {#if disabled}
        <Icon name="lock" stroke={colors.gray[600]} />
      {:else}
        <Icon stroke="currentcolor" name={show ? 'caretUp' : 'caretDown'} />
      {/if}
    </MenuButton>
    <Menu id="{id}-menu" class="max-h-96 border-primary" {show} {dark}>
      {#if options}
        {#each options as option}
          <Option
            on:select={handleOptionClick}
            selected={value === option}
            value={option}
            {dark}
          />
        {/each}
      {:else}
        <slot />
      {/if}
    </Menu>
  </MenuContainer>
</div>

<style lang="postcss">
  label {
    @apply mb-10 text-sm font-medium text-gray-900;
  }

  .select :global(.select-input-container) {
    @apply flex h-10 w-full flex-row items-center justify-between rounded border border-gray-900 bg-white px-2 text-sm text-primary;
  }

  .select :global(.select-input-container.show) {
    @apply border-blue-700;
  }

  .select-input {
    @apply h-full w-full cursor-pointer bg-white placeholder:text-gray-900;
  }

  .select-input.dark {
    @apply bg-primary text-white placeholder:text-gray-200;
  }

  .select-input.disabled {
    @apply bg-gray-50 placeholder:text-gray-600;
  }
</style>
