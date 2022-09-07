<script context="module">export const EMPTY_OPTION = {
    label: '',
    value: '',
};
</script>

<script>import { getContext } from 'svelte';
import Icon from '$holocene/icon/icon.svelte';
import MenuItem from '$holocene/primitives/menu/menu-item.svelte';
const context = getContext('select-value');
export let value = undefined;
export let description = '';
export let dark = false;
let selected;
let _value;
let slotWrapper;
$: {
    if (slotWrapper) {
        _value = value !== null && value !== void 0 ? value : slotWrapper.textContent;
        selected = $context.selectValue === _value;
    }
}
const handleOptionClick = () => {
    context.update((previous) => ({ ...previous, selectValue: _value }));
    $context.onChange(_value);
};
</script>

<MenuItem
  class="flex flex-row items-start"
  on:click={handleOptionClick}
  {selected}
  {dark}
>
  <div class="mr-2 w-6">
    {#if selected}
      <Icon name="checkmark" />
    {/if}
  </div>
  <div class="flex w-full flex-col">
    <span bind:this={slotWrapper} class="option-label">
      <slot />
    </span>
    {#if description}
      <span class="option-description">
        {description}
      </span>
    {/if}
  </div>
</MenuItem>

<style>
  .option-label {

    display: flex;

    white-space: nowrap;

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem;

    font-weight: 500
}

  .option-description {

    display: flex;

    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem;

    font-weight: 400
}</style>
