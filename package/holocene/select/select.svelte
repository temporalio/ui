<script context="module"></script>

<script>import { onDestroy, setContext } from 'svelte';
import Icon from '$holocene/icon/icon.svelte';
import Menu from '$holocene/primitives/menu/menu.svelte';
import MenuButton from '$holocene/primitives/menu/menu-button.svelte';
import MenuContainer from '$holocene/primitives/menu/menu-container.svelte';
import { writable } from 'svelte/store';
import { noop } from 'svelte/internal';
let show = false;
export let label = '';
export let id;
export let value = undefined;
export let dark = false;
export let placeholder = '';
export let disabled = false;
export let displayValue = (value) => value !== null && value !== void 0 ? value : '';
export let onChange = noop;
const context = writable({
    selectValue: value,
    onChange,
});
const unsubscribe = context.subscribe((ctx) => {
    value = ctx.selectValue;
});
onDestroy(() => {
    unsubscribe();
});
$: {
    if (value) {
        context.update((previous) => ({ ...previous, selectValue: value }));
    }
    setContext('select-value', context);
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
      <div class="select-input" class:dark class:disabled {id}>
        {#if !value && placeholder !== ''}
          {placeholder}
        {:else}
          {displayValue(value)}
        {/if}
      </div>
      {#if disabled}
        <Icon name="lock" class="text-gray-500" />
      {:else}
        <Icon name={show ? 'chevron-up' : 'chevron-down'} />
      {/if}
    </MenuButton>
    <Menu id="{id}-menu" class="h-auto max-h-80 min-w-fit" {show} {dark}>
      <slot />
    </Menu>
  </MenuContainer>
</div>

<style>
  label {

    margin-bottom: 2.5rem;

    font-size: 0.875rem;

    line-height: 1.25rem;

    font-weight: 500;

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity))
}

  .select :global(.select-input-container) {

    display: flex;

    height: 2.5rem;

    width: 100%;

    flex-direction: row;

    align-items: center;

    justify-content: space-between;

    border-radius: 0.25rem;

    border-width: 1px;

    --tw-border-opacity: 1;

    border-color: rgb(24 24 27 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    padding-left: 0.5rem;

    padding-right: 0.5rem;

    font-size: 0.875rem;

    line-height: 1.25rem;

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity))
}

  .select-input {

    display: inline;

    cursor: pointer;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity))
}

  .select-input.dark {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .select-input.disabled {

    --tw-bg-opacity: 1;

    background-color: rgb(250 250 250 / var(--tw-bg-opacity))
}

  .select-input.disabled::-moz-placeholder {

    --tw-text-opacity: 1;

    color: rgb(82 82 91 / var(--tw-text-opacity))
}

  .select-input.disabled:-ms-input-placeholder {

    --tw-text-opacity: 1;

    color: rgb(82 82 91 / var(--tw-text-opacity))
}

  .select-input.disabled::placeholder {

    --tw-text-opacity: 1;

    color: rgb(82 82 91 / var(--tw-text-opacity))
}</style>
