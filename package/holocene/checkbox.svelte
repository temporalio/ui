<script>import { createEventDispatcher } from 'svelte';
import Icon from '$holocene/icon/icon.svelte';
export let id;
export let checked = false;
export let label = '&nbsp;';
export let onDark = false;
export let indeterminate = false;
export let disabled = false;
const dispatch = createEventDispatcher();
const handleChange = (event) => {
    dispatch('change', { checked: event.target.checked });
};
</script>

<label class="checkbox {$$props.class}" class:disabled class:on-dark={onDark}>
  {@html label}
  <input
    on:change={handleChange}
    {id}
    type="checkbox"
    bind:checked
    {indeterminate}
    {disabled}
    class:indeterminate
  />
  <span class="checkmark" class:on-dark={onDark}>
    {#if indeterminate}
      <span class="dash" class:on-dark={onDark} />
    {:else if checked}
      <Icon
        class="absolute top-0 left-0 h-4 w-4"
        name="checkmark"
        strokeWidth={3}
      />
    {/if}
  </span>
</label>

<style>
  .checkbox {

    position: relative;

    display: block;

    width: -webkit-fit-content;

    width: -moz-fit-content;

    width: fit-content;

    cursor: pointer;

    -webkit-user-select: none;

       -moz-user-select: none;

        -ms-user-select: none;

            user-select: none;

    gap: 0.25rem;

    padding-left: 1.75rem;

    vertical-align: middle;

    font-size: 0.875rem;

    line-height: 1.5rem;

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity))
}

  .checkbox.on-dark {

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  input {

    position: absolute;

    top: 0px;

    left: 0px;

    height: 0px;

    width: 0px;

    opacity: 0
}

  .checkmark {

    position: absolute;

    top: 3px;

    left: 0.125rem;

    box-sizing: content-box;

    height: 1rem;

    width: 1rem;

    cursor: pointer;

    border-radius: 0.125rem;

    border-width: 1px;

    --tw-border-opacity: 1;

    border-color: rgb(24 24 27 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity))
}

  .checkmark.on-dark {

    --tw-border-opacity: 1;

    border-color: rgb(255 255 255 / var(--tw-border-opacity))
}

  .dash {

    position: absolute;

    top: 7px;

    left: 0.25rem;

    height: 0px;

    width: 0.5rem;

    border-radius: 0.25rem;

    border-width: 1px;

    --tw-border-opacity: 1;

    border-color: rgb(255 255 255 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity))
}

  .dash.on-dark {

    --tw-border-opacity: 1;

    border-color: rgb(255 255 255 / var(--tw-border-opacity))
}

  input:checked + .checkmark, 
  input.indeterminate + .checkmark {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}

  .checkbox.disabled, 
  .checkbox.disabled .checkmark {

    cursor: default
}

  .checkbox.disabled.on-dark {

    --tw-text-opacity: 0.8
}

  .checkbox.disabled:not(.on-dark) .checkmark {

    --tw-bg-opacity: 0.5
}

  .checkbox.disabled.on-dark .checkmark {

    --tw-border-opacity: 0.8;

    --tw-text-opacity: 0.8
}

  .checkbox.disabled.on-dark .checkmark .dash {

    opacity: 0.8
}</style>
